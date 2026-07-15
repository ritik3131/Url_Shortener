import { redis } from "../config/redis.js";
import { insertShortLinkIfAbsent } from "../models/shortLinkModel.js";
import { AppError } from "../utils/errors.js";
import { validateCustomAlias } from "../utils/customAlias.js";
import { validateUrl } from "../utils/url.js";
export class ShortLinkService {
  constructor(generator, { cache = redis, insertLink = insertShortLinkIfAbsent } = {}) {
    this.generator = generator;
    this.cache = cache;
    this.insertLink = insertLink;
  }

  async create(destinationUrl, customAlias) {
    const normalizedUrl = validateUrl(destinationUrl);

    if (customAlias !== undefined && customAlias !== null && customAlias !== "") {
      const code = validateCustomAlias(customAlias);
      const createdAt = new Date();
      const inserted = await this.insertLink({
        code,
        destinationUrl: normalizedUrl,
        createdAt,
      });
      if (!inserted) throw new AppError(409, "custom alias is already in use");
      this.cache.set(`link:${code}`, normalizedUrl, { EX: 300 }).catch(() => {});
      return { code, destinationUrl: normalizedUrl, createdAt, customAlias: true };
    }

    for (let attempt = 0; attempt < 3; attempt += 1) {
      const code = await this.generator.nextCode();
      const createdAt = new Date();
      if (
        !(await this.insertLink({
          code,
          destinationUrl: normalizedUrl,
          createdAt,
        }))
      )
        continue;
      this.cache.set(`link:${code}`, normalizedUrl, { EX: 300 }).catch(() => {});
      return { code, destinationUrl: normalizedUrl, createdAt, customAlias: false };
    }
    throw new AppError(503, "Could not allocate a unique short code");
  }
}
