import http from "node:http";
import "dotenv/config";
import { routeRequest } from "./routing.js";
const port = Number(process.env.PORT ?? 3000);
const writeTarget = new URL(
  process.env.WRITE_SERVICE_URL ?? "http://127.0.0.1:3001",
);
const readTarget = new URL(
  process.env.READ_SERVICE_URL ?? "http://127.0.0.1:3002",
);

http
  .createServer((request, response) => {
    const route = routeRequest(request.method, request.url);
    const target =
      route === "write"
        ? writeTarget
        : route === "read"
          ? readTarget
          : undefined;
    if (!target) return response.writeHead(404).end();
    const upstream = http.request(
      {
        hostname: target.hostname,
        port: target.port,
        protocol: target.protocol,
        method: request.method,
        path: request.url,
        headers: request.headers,
      },
      (upstreamResponse) => {
        response.writeHead(
          upstreamResponse.statusCode,
          upstreamResponse.headers,
        );
        upstreamResponse.pipe(response);
      },
    );
    upstream.on("error", () => response.writeHead(502).end());
    request.pipe(upstream);
  })
  .listen(port, () => console.log(`Load balancer listening on ${port}`));
