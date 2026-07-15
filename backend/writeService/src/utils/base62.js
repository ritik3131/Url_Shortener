const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function encodeBase62(value) {
  let id = BigInt(value);
  let result = '';
  do {
    result = alphabet[Number(id % 62n)] + result;
    id /= 62n;
  } while (id > 0n);
  return result;
}
