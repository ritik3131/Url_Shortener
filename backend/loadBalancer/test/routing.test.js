import test from 'node:test';
import assert from 'node:assert/strict';
import { routeRequest } from '../src/routing.js';

test('routes public write and read endpoints internally', () => {
  assert.equal(routeRequest('POST', '/shorten'), 'write');
  assert.equal(routeRequest('GET', '/Ab_19z'), 'read');
});
test('does not proxy invalid methods or paths', () => {
  assert.equal(routeRequest('GET', '/shorten'), undefined);
  assert.equal(routeRequest('GET', '/nested/path'), undefined);
  assert.equal(routeRequest('DELETE', '/Ab_19z'), undefined);
});
