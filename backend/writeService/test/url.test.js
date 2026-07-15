import test from "node:test";
import assert from "node:assert/strict";
import { validateUrl } from "../src/utils/url.js";

test("normalizes an HTTP URL", () =>
  assert.equal(
    validateUrl("https://example.com/a path"),
    "https://example.com/a%20path",
  ));
test("rejects non-web and relative URLs", () => {
  assert.throws(() => validateUrl("ftp://example.com"));
  assert.throws(() => validateUrl("/relative"));
});
