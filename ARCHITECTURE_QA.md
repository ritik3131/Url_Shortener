# Architecture Trade-Offs

## 1. What did you ask the AI to do, and what did you write or decide yourself?

I used the AI mainly as an implementation partner, not as the decision-maker.

I asked it to help me write the base code for the system and then extend it step by step. For the backend, it helped generate the initial service structure, API wiring, and some of the core logic. For the frontend, I relied on most of the generated code because the UI was relatively simple.

The important architectural decisions were mine. I chose:

- load balancer + separate read/write services instead of a single modular service
- Cassandra as the only database
- Redis as the read cache
- no PostgreSQL
- no Kafka in the core flow
- a distributed unique ID generator for short-code creation instead of a normal Base62 hashing approach
- custom alias support as part of the product flow

So the AI helped me build around the design, but I made the main system-level choices myself.

## 2. Where did you override, correct, or throw away the AI’s output, and why?

I overrode the AI in the places where the default suggestion did not match the architecture I wanted.

I specifically changed:

- the overall architecture
  - The AI initially suggested a single modular service.
  - I decided to split it into load balancer + read/write microservices because I wanted something more extensible.

- the persistence layer
  - The AI moved toward PostgreSQL + Cassandra with Kafka syncing.
  - I corrected that to Cassandra only, because I wanted one source of truth and a simpler implementation.

- the code generation strategy
  - The AI suggested normal Base62 hashing or encoding with collision handling.
  - I rejected that and chose a distributed unique ID generator, because I wanted a deterministic, scalable, low-collision design and a fixed 7-character short code.

- the data flow
  - The AI introduced Kafka in the core path.
  - I removed Kafka from the core implementation and kept the code modular only for possible future analytics use.

- the frontend and docs
  - I mostly kept the generated frontend structure, but I corrected it to match the final backend contract, including custom aliases.
  - I also asked for README and testing changes so the implementation matched the architecture I had already decided on.

So the short version is: the AI helped me build the code, but I kept correcting it whenever its suggestion diverged from the architecture I had already chosen. The architectural direction was mine; the AI handled a lot of the scaffolding and incremental implementation.

## 3. What were the biggest trade-offs you made, and what alternatives did you consider?

The biggest trade-offs I made were:

1. Architecture: single service vs load balancer + read/write split

   I considered keeping everything in one modular backend, which would have been simpler to build and deploy. I rejected that and chose a load balancer in front of separate write and read services.

   Why:

   - it makes the system easier to extend later
   - write and read paths can scale independently
   - the public API stays stable even if internal services change

   Trade-off:

   - more moving parts
   - more operational overhead
   - harder local setup than a single service

2. Database: PostgreSQL + Cassandra vs Cassandra only

   I considered a pipeline where PostgreSQL is the source of truth and Kafka syncs data into Cassandra for fast reads. I also considered using Cassandra only.

   I chose Cassandra only.

   Why:

   - simpler architecture
   - one source of truth
   - avoids sync bugs between databases
   - better fit for a high-read redirect service where lookups matter more than relational features

   Trade-off:

   - I give up relational guarantees and richer SQL querying
   - data modeling has to be more deliberate up front

3. Short-code generation: Base62 hashing vs distributed unique ID generator

   I considered normal Base62 hashing or encoding from the long URL or a random short code approach. I rejected that because of collision concerns and the need for predictable uniqueness at scale.

   I chose a distributed unique ID generator and then Base62-encoded the ID into a 7-character code.

   Why:

   - uniqueness is much more controlled
   - no dependency on hashing the URL itself
   - fixed-length short codes are easier to expose in URLs
   - the code stays compact while still being scalable

   Trade-off:

   - the code is not derived from the original URL
   - the implementation is more complex than simple hashing
   - it relies on disciplined ID generation rather than a trivial random string

In short, I consistently chose the more scalable and extensible design over the simpler one, even when that meant more complexity in the implementation.

## 4. What's missing, or what would you do with another day?

With another day, I would focus on turning the current core URL-shortening flow into a more production-ready service.

1. Expiring links

   I would add an optional expiry time to each URL record. The read service would reject an expired link, remove its Redis cache entry, and return a clear response instead of redirecting. Cassandra TTL can help with automatic data expiry, but the application should still handle the expiry state explicitly.

2. Cache and link-deletion policies

   I would define Redis TTL and eviction behaviour so frequently used links remain fast without allowing the cache to grow indefinitely. I would also add a delete/disable flow for links, including cache invalidation and a safe strategy for removing or marking records as inactive in Cassandra.

3. Real distributed worker-ID coordination

   The current Snowflake-style generator assumes a fixed worker ID because the project runs on one server. When the write service scales horizontally, I would use ZooKeeper (or a modern alternative such as etcd) to lease unique worker IDs and prevent duplicate IDs across instances.

4. Analytics

   I would publish redirect events asynchronously for analytics, such as click count, country or region, referrer, device type, and time of access. This must stay outside the redirect path so analytics does not slow down a user redirect.

5. Monitoring and alerting

   I would add structured logs, health checks, metrics, and dashboards for redirect latency, Redis hit rate, Cassandra errors, link-creation failures, and service availability. Alerts would make failures visible before users report them.

6. Authentication and paid-user features

   I would add user accounts so people can manage their own links. Paid plans could provide custom domains, higher creation limits, advanced analytics, longer retention, API keys, and branded links.

7. Abuse prevention and security

   I would add rate limiting, URL validation, malicious-link reporting, and protection against users repeatedly claiming aliases or creating spam links. This is important for a public URL-shortener because it can otherwise be used for phishing or abuse.

8. Reliability and developer workflow

   I would add idempotency for repeated create requests, automated end-to-end tests, CI/CD, backups, and a documented recovery plan. These improvements make the service safer to operate as traffic and the number of deployed instances grow.
