import { redis } from '../config/redis.js';
import { findByCode } from '../models/shortLinkModel.js';
export async function resolveCode(code) {
  let destinationUrl = await redis.get(`link:${code}`);
  if (destinationUrl) return destinationUrl;
  const result = await findByCode(code);
  destinationUrl = result.first()?.destination_url;
  if (destinationUrl) await redis.set(`link:${code}`, destinationUrl, { EX: 300 });
  return destinationUrl;
}
