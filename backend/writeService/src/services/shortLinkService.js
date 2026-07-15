import { redis } from "../config/redis.js";
import { insertShortLinkWithOutbox } from "../models/shortLinkModel.js";
import { AppError } from "../utils/errors.js";
import { validateUrl } from "../utils/url.js";

export class ShortLinkService {
  constructor(generator) {
    this.generator = generator;
  }

  async create(destinationUrl) {
    const normalizedUrl = validateUrl(destinationUrl);
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = await this.generator.nextCode();
      try {
        const link = await insertShortLinkWithOutbox({
          code,
          destinationUrl: normalizedUrl,
        });
        redis
          .set(`link:${code}`, normalizedUrl, { EX: 300 })
          .catch((error) =>
            console.error("Redis cache write failed:", error.message),
          );
        return {
          code: link.code,
          destinationUrl: link.destination_url,
          createdAt: link.created_at,
        };
      } catch (error) {
        if (error.code !== "23505") throw error;
      }
    }
    throw new AppError(503, "Could not allocate a unique short code");
  }
}
