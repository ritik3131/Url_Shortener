# URL shortener backend

The backend has three Node.js services behind one public endpoint:

- **Load balancer** (`:3000`) reverse-proxies requests by method and path.
- **Write service** (`:3001`) creates short links.
- **Read service** (`:3002`) resolves short links and redirects visitors.

Cassandra is the durable source of truth. Redis is a cache, not a source of truth. ZooKeeper is included for a future distributed worker-ID lease; the current single writer uses `WORKER_ID=1`.

## Request flow

```text
POST /shorten
client -> load balancer -> write service
       -> validate HTTP/HTTPS destination URL
       -> if provided, validate customAlias and reserve it as the code
       -> generate seven-character Snowflake/Base62 code
       -> Cassandra INSERT ... IF NOT EXISTS
       -> Redis SET link:{code} with a 300-second TTL
       -> 201 { code, shortUrl }

GET /{code}
client -> load balancer -> read service
       -> Redis GET link:{code}
       -> on cache miss: Cassandra SELECT by code
       -> on Cassandra hit: Redis SET link:{code}
       -> 301 Location: destination URL
```

The load balancer is the only public endpoint. It forwards `POST /shorten` to the write service and `GET /{code}` to the read service without exposing internal service ports.

Custom aliases are supported by sending `customAlias` in the `POST /shorten` body. The alias must be 3 to 32 characters long and may contain only letters, numbers, hyphens, and underscores. The writer uses that alias as the code directly, so the same Cassandra uniqueness check protects both generated codes and custom aliases. If the alias is already taken, the writer returns `409`.

## Start the system

Start Docker Desktop, then from `backend/` run:

```powershell
docker-compose up -d
```

Wait until Cassandra is healthy and its schema-init container completes:

```powershell
docker-compose ps
```

In three separate terminals, install dependencies once and start each service:

```powershell
# Terminal 1 - write service
Set-Location backend\writeService
Copy-Item .env.example .env
npm install
npm run dev
```

```powershell
# Terminal 2 - read service
Set-Location backend\readService
Copy-Item .env.example .env
npm install
npm run dev
```

```powershell
# Terminal 3 - public load balancer
Set-Location backend\loadBalancer
Copy-Item .env.example .env
npm install
npm run dev
```

## End-to-end test

From `backend/`, create a link through the public load balancer and retain its code:

```powershell
$response = Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:3000/shorten' `
  -ContentType 'application/json' `
  -Body '{"url":"https://example.com/articles/hello"}'

$code = [string]$response.code
$shortUrl = $response.shortUrl
$response
```

Expected result: HTTP `201`, a seven-character `code`, and a `shortUrl` beginning with `http://localhost:3000/`.

To create a custom alias, send `customAlias` in the same request:

```powershell
$aliasResponse = Invoke-RestMethod -Method Post `
  -Uri 'http://localhost:3000/shorten' `
  -ContentType 'application/json' `
  -Body '{"url":"https://example.com/launch","customAlias":"launch-2026"}'

$aliasResponse
```

Expected result: HTTP `201`, `code` equal to `launch-2026`, and a matching `shortUrl`.

Verify the durable Cassandra mapping:

```powershell
docker-compose exec cassandra cqlsh -e "SELECT code, destination_url FROM url_shortener.links_by_code WHERE code = '$code';"
```

Expected result: one row with `$code` and `https://example.com/articles/hello`.

Verify the Redis cache entry and TTL:

```powershell
docker-compose exec redis redis-cli GET "link:$code"
docker-compose exec redis redis-cli TTL "link:$code"
```

Expected result: the destination URL, then a positive TTL close to `300`. After the TTL expires, `GET` may return `(nil)`; that is expected because Redis is only a cache.

Finally, verify the redirect through the public load balancer:

```powershell
curl.exe -i --max-redirs 0 $shortUrl
```

Expected result: `HTTP/1.1 301` and a `Location: https://example.com/articles/hello` header. If Redis has expired, the read service fetches the mapping from Cassandra and repopulates Redis.

## What to check

- `POST /shorten` returns `201`; invalid HTTP/HTTPS URLs return `400`.
- `customAlias` is optional, but when present it must be unique and follow the alias rules.
- Generated codes are exactly seven Base62 characters.
- Cassandra has one `links_by_code` row for every created code.
- Redis contains `link:{code}` immediately after creation, but its disappearance after the TTL is normal.
- `GET /{code}` returns `301`; an unknown code returns `404`.
- The public URL uses port `3000`; callers should not use write/read service ports directly.

## Code allocation

The generator builds a 41-bit Snowflake-style ID: 31-bit seconds since a 2025 epoch, 5-bit worker ID, and 5-bit per-second sequence. Base62 encodes it into exactly seven characters. Cassandra's conditional insert protects the mapping from collisions.
