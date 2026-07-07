import { describe, it, expect, beforeAll } from 'vitest';
import { encrypt, decrypt } from './encryption.js';

const TEST_KEY = 'abcdef0123456789abcdef0123456789abcdef0123456789abcdef0123456789';

beforeAll(() => {
  process.env.ENCRYPTION_KEY = TEST_KEY;
});

describe('encryption', () => {
  it('should encrypt and decrypt a string successfully', () => {
    const plaintext = 'sk-my-secret-api-key-12345';
    const result = encrypt(plaintext);

    expect(result.ciphertext).toBeTruthy();
    expect(result.iv).toBeTruthy();
    expect(result.authTag).toBeTruthy();
    expect(typeof result.ciphertext).toBe('string');
    expect(typeof result.iv).toBe('string');
    expect(typeof result.authTag).toBe('string');

    const decrypted = decrypt(result);
    expect(decrypted).toBe(plaintext);
  });

  it('should produce different ciphertext for same plaintext (random IV)', () => {
    const plaintext = 'sk-test-key';
    const result1 = encrypt(plaintext);
    const result2 = encrypt(plaintext);

    expect(result1.iv).not.toBe(result2.iv);
    expect(result1.ciphertext).not.toBe(result2.ciphertext);
  });

  it('should handle empty string', () => {
    const plaintext = '';
    const result = encrypt(plaintext);
    const decrypted = decrypt(result);
    expect(decrypted).toBe('');
  });

  it('should handle long strings', () => {
    const plaintext = 'A'.repeat(10000);
    const result = encrypt(plaintext);
    const decrypted = decrypt(result);
    expect(decrypted).toBe(plaintext);
  });

  it('should throw on tampered ciphertext', () => {
    const plaintext = 'sk-sensitive-key';
    const result = encrypt(plaintext);

    const tampered = {
      ...result,
      ciphertext: result.ciphertext.slice(0, -2) + '00',
    };

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should throw on tampered auth tag', () => {
    const plaintext = 'sk-sensitive-key';
    const result = encrypt(plaintext);

    const tampered = {
      ...result,
      authTag: result.authTag.slice(0, -2) + '00',
    };

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should throw on tampered iv', () => {
    const plaintext = 'sk-sensitive-key';
    const result = encrypt(plaintext);

    const tampered = {
      ...result,
      iv: result.iv.slice(0, -2) + '00',
    };

    expect(() => decrypt(tampered)).toThrow();
  });

  it('should handle unicode characters', () => {
    const plaintext = '🔥 测试 कुंजी 🔑';
    const result = encrypt(plaintext);
    const decrypted = decrypt(result);
    expect(decrypted).toBe(plaintext);
  });
});
