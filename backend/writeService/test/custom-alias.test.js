import test from "node:test";
import assert from "node:assert/strict";
import { ShortLinkService } from "../src/services/shortLinkService.js";
import { validateCustomAlias } from "../src/utils/customAlias.js";

test("validates a supported custom alias", () => {
  assert.equal(validateCustomAlias("launch-2026"), "launch-2026");
  assert.equal(validateCustomAlias("My_Link_7"), "My_Link_7");
});

test("rejects an invalid or reserved custom alias", () => {
  assert.throws(() => validateCustomAlias("ab"), /3 to 32/);
  assert.throws(() => validateCustomAlias("bad alias"), /3 to 32/);
  assert.throws(() => validateCustomAlias("shorten"), /reserved/);
});

test("uses a provided custom alias instead of generating one", async () => {
  const generated = [];
  const inserted = [];
  const service = new ShortLinkService(
    {
      nextCode: async () => {
        generated.push(true);
        return "generated";
      },
    },
    {
      insertLink: async (payload) => {
        inserted.push(payload);
        return true;
      },
      cache: {
        set: async () => {},
      },
    },
  );

  const result = await service.create("https://example.com/landing", "launch-2026");

  assert.deepEqual(generated, []);
  assert.equal(result.code, "launch-2026");
  assert.equal(result.customAlias, true);
  assert.equal(inserted[0].code, "launch-2026");
  assert.equal(inserted[0].destinationUrl, "https://example.com/landing");
});

test("returns a conflict when a custom alias already exists", async () => {
  const service = new ShortLinkService(
    {
      nextCode: async () => "generated",
    },
    {
      insertLink: async () => false,
      cache: {
        set: async () => {},
      },
    },
  );

  await assert.rejects(
    () => service.create("https://example.com", "launch-2026"),
    (error) => error.statusCode === 409,
  );
});
