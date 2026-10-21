import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';

const scrypt = (password: string, salt: Buffer) =>
  new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, 64, { N: 16_384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }, (error, key) => {
      if (error) reject(error);
      else resolve(key as Buffer);
    });
  });

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await scrypt(password, salt);
  return `scrypt$${salt.toString('base64url')}$${key.toString('base64url')}`;
}

export async function verifyPassword(password: string, storedHash: string) {
  const [algorithm, saltValue, keyValue] = storedHash.split('$');
  if (algorithm !== 'scrypt' || !saltValue || !keyValue) return false;

  try {
    const salt = Buffer.from(saltValue, 'base64url');
    const expected = Buffer.from(keyValue, 'base64url');
    const actual = await scrypt(password, salt);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}
