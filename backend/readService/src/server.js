import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { redis } from "./config/redis.js";
import { cassandraClient } from "./config/database.js";
await redis.connect();
await cassandraClient.connect();
const server = createApp().listen(env.port, () =>
  console.log(`Read service listening on ${env.port}`),
);
async function shutdown() {
  server.close();
  await redis.quit();
  await cassandraClient.shutdown();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
