import test from 'node:test';
import assert from 'node:assert/strict';
import { SnowflakeCodeGenerator } from '../src/utils/snowflake.js';

test('creates unique seven-character Base62 codes in one second', async () => {
  const now = () => Date.parse('2026-01-01T00:00:00Z');
  const generator = new SnowflakeCodeGenerator({ workerId: 1, epochSeconds: 1735689600, now });
  const codes = await Promise.all(Array.from({ length: 32 }, () => generator.nextCode()));
  assert.equal(new Set(codes).size, 32);
  assert.ok(codes.every((code) => /^[0-9A-Za-z]{7}$/.test(code)));
});

test('rejects an invalid worker ID', () => {
  assert.throws(() => new SnowflakeCodeGenerator({ workerId: 32, epochSeconds: 1735689600 }), /WORKER_ID/);
});
