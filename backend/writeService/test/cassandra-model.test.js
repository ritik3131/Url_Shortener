import test from "node:test";
import assert from "node:assert/strict";
import { insertShortLinkIfAbsent } from "../src/models/shortLinkModel.js";

test("uses a conditional Cassandra insert for a new short code", async () => {
  const calls = [];
  const client = {
    execute: async (query, parameters, options) => {
      calls.push({ query, parameters, options });
      return { first: () => ({ "[applied]": true }) };
    },
  };
  const createdAt = new Date("2026-07-15T00:00:00Z");
  assert.equal(
    await insertShortLinkIfAbsent(
      { code: "0s6u0Y4", destinationUrl: "https://example.com", createdAt },
      client,
    ),
    true,
  );
  assert.match(calls[0].query, /IF NOT EXISTS/);
  assert.deepEqual(calls[0].parameters, [
    "0s6u0Y4",
    "https://example.com",
    createdAt,
  ]);
  assert.deepEqual(calls[0].options, { prepare: true });
});

test("reports a code collision when Cassandra does not apply the insert", async () => {
  const client = {
    execute: async () => ({ first: () => ({ "[applied]": false }) }),
  };
  assert.equal(
    await insertShortLinkIfAbsent(
      {
        code: "0s6u0Y4",
        destinationUrl: "https://example.com",
        createdAt: new Date(),
      },
      client,
    ),
    false,
  );
});
