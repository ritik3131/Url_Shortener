import { AppError } from './errors.js';

export function validateUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) throw new AppError(400, 'url must be at most 2048 characters');
  try {
    const parsed = new URL(value);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error();
    return parsed.toString();
  } catch { throw new AppError(400, 'url must be an absolute HTTP or HTTPS URL'); }
}
