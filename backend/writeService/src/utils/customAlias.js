import { AppError } from "./errors.js";

const ALIAS_PATTERN = /^[0-9A-Za-z_-]{3,32}$/;
const RESERVED_ALIASES = new Set(["shorten"]);

export function validateCustomAlias(value) {
  if (typeof value !== "string") throw new AppError(400, "customAlias must be a string");

  const alias = value.trim();
  if (!alias) throw new AppError(400, "customAlias is required when provided");
  if (!ALIAS_PATTERN.test(alias)) {
    throw new AppError(
      400,
      "customAlias must be 3 to 32 characters using letters, numbers, hyphen, or underscore",
    );
  }
  if (RESERVED_ALIASES.has(alias.toLowerCase())) {
    throw new AppError(400, "customAlias is reserved");
  }
  return alias;
}
