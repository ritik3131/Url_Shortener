import { redis } from "../config/redis.js";
import { insertShortLinkIfAbsent } from "../models/shortLinkModel.js";
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
      const createdAt = new Date();
      if (
        !(await insertShortLinkIfAbsent({
          code,
          destinationUrl: normalizedUrl,
          createdAt,
        }))
      )
        continue;
      redis.set(`link:${code}`, normalizedUrl, { EX: 300 }).catch(() => {});
      return { code, destinationUrl: normalizedUrl, createdAt };
    }
    throw new AppError(503, "Could not allocate a unique short code");
  }
}
