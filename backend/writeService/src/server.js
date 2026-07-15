import { createApp } from "./app.js";
import { cassandraClient } from "./config/database.js";
import { env } from "./config/env.js";
import { redis } from "./config/redis.js";
import { ShortLinkService } from "./services/shortLinkService.js";
import { SnowflakeCodeGenerator } from "./utils/snowflake.js";
await cassandraClient.connect();
await redis.connect();
const server = createApp(
  new ShortLinkService(
    new SnowflakeCodeGenerator({
      workerId: env.workerId,
      epochSeconds: env.customEpochSeconds,
    }),
  ),
).listen(env.port, () => console.log(`Write service listening on ${env.port}`));
async function shutdown() {
  server.close();
  await redis.quit();
  await cassandraClient.shutdown();
  process.exit(0);
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
