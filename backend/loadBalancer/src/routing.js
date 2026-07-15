export function routeRequest(method, path) {
  if (method === 'POST' && path === '/shorten') return 'write';
  if (path === '/shorten') return undefined;
  if (method === 'GET' && /^\/[0-9A-Za-z_-]+$/.test(path)) return 'read';
  return undefined;
}
