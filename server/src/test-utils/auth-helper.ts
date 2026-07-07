import jwt from 'jsonwebtoken';

const TEST_JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long!!';

export function generateTestToken(userId: string, email = 'test@example.com'): string {
  return jwt.sign({ sub: userId, email }, TEST_JWT_SECRET, { expiresIn: '15m' });
}

export function generateExpiredToken(userId: string, email = 'test@example.com'): string {
  return jwt.sign({ sub: userId, email }, TEST_JWT_SECRET, { expiresIn: '0s' });
}

export function getTestJwtSecret(): string {
  return TEST_JWT_SECRET;
}
