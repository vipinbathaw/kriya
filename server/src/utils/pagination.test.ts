import { describe, it, expect } from 'vitest';
import {
  encodeCursor,
  decodeCursor,
  buildPaginatedResponse,
  buildCursorWhere,
} from './pagination.js';

describe('encodeCursor / decodeCursor', () => {
  it('encodes and decodes a cursor object', () => {
    const obj = { id: 'abc-123', createdAt: '2025-01-01T00:00:00Z' };
    const encoded = encodeCursor(obj);
    expect(typeof encoded).toBe('string');
    expect(encoded).not.toContain('{');
    const decoded = decodeCursor(encoded);
    expect(decoded).toEqual(obj);
  });

  it('throws on invalid cursor input', () => {
    expect(() => decodeCursor('not-valid-base64url-json')).toThrow('Invalid cursor');
  });
});

describe('buildPaginatedResponse', () => {
  it('returns empty result for empty rows', () => {
    const result = buildPaginatedResponse([], 20);
    expect(result).toEqual({ data: [], nextCursor: null });
  });

  it('returns no cursor when rows are within limit', () => {
    const rows = [
      { id: '1', title: 'a', created_at: '2025-01-03T00:00:00Z' },
      { id: '2', title: 'b', created_at: '2025-01-02T00:00:00Z' },
    ];
    const result = buildPaginatedResponse(rows, 10);
    expect(result.data).toHaveLength(2);
    expect(result.nextCursor).toBeNull();
  });

  it('returns cursor when rows exceed limit', () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      created_at: new Date(2025, 0, 6 - i).toISOString(),
    }));
    const result = buildPaginatedResponse(rows, 5);
    expect(result.data).toHaveLength(5);
    expect(result.nextCursor).toBeTruthy();
  });

  it('strips extra row when limit exceeded', () => {
    const rows = [
      { id: '1', created_at: '2025-01-02T00:00:00Z' },
      { id: '2', created_at: '2025-01-01T00:00:00Z' },
      { id: '3', created_at: '2024-12-31T00:00:00Z' },
    ];
    const result = buildPaginatedResponse(rows, 2);
    expect(result.data).toHaveLength(2);
    expect(result.data[0].id).toBe('1');
    expect(result.data[1].id).toBe('2');
  });
});

describe('buildCursorWhere', () => {
  it('returns null for undefined cursor', () => {
    expect(buildCursorWhere(undefined)).toBeNull();
  });

  it('returns null for null cursor', () => {
    expect(buildCursorWhere(null)).toBeNull();
  });

  it('decodes cursor into where condition', () => {
    const cursor = encodeCursor({ id: 'abc', createdAt: '2025-01-01T00:00:00Z' });
    const result = buildCursorWhere(cursor);
    expect(result).toEqual({ id: 'abc', createdAt: '2025-01-01T00:00:00Z' });
  });
});
