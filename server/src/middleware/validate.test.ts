import { describe, it, expect, vi } from 'vitest';
import { z } from 'zod';
import { validate } from './validate.js';
import { ValidationError } from './errorHandler.js';
import type { Request, Response } from 'express';

const testSchema = z.object({
  email: z.string().email(),
  age: z.number().min(18),
});

function createMockReq(body: unknown): Partial<Request> {
  return { body } as Partial<Request>;
}

describe('validate middleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRes = {};
    mockNext = vi.fn();
  });

  it('passes valid body through', () => {
    const req = createMockReq({ email: 'test@example.com', age: 25 }) as Request;
    const middleware = validate(testSchema);

    middleware(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.body).toEqual({ email: 'test@example.com', age: 25 });
  });

  it('transforms parsed data (e.g., string to number)', () => {
    const schema = z.object({
      count: z.coerce.number(),
    });
    const req = createMockReq({ count: '42' }) as Request;
    const middleware = validate(schema);

    middleware(req, mockRes as Response, mockNext);

    expect(req.body.count).toBe(42);
  });

  it('throws ValidationError for invalid body', () => {
    const req = createMockReq({ email: 'not-an-email', age: 15 }) as Request;
    const middleware = validate(testSchema);

    expect(() => middleware(req, mockRes as Response, mockNext))
      .toThrow(ValidationError);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('throws ValidationError for missing required fields', () => {
    const req = createMockReq({ email: 'test@example.com' }) as Request;
    const middleware = validate(testSchema);

    expect(() => middleware(req, mockRes as Response, mockNext))
      .toThrow(ValidationError);
  });

  it('validates query params when source is query', () => {
    const schema = z.object({ page: z.coerce.number().optional() });
    const req = { query: { page: '2' } } as unknown as Request;
    const middleware = validate(schema, 'query');

    middleware(req, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(req.query).toEqual({ page: 2 });
  });

  it('throws ValidationError for invalid query params', () => {
    const schema = z.object({ status: z.enum(['active', 'inactive']) });
    const req = { query: { status: 'bogus' } } as unknown as Request;
    const middleware = validate(schema, 'query');

    expect(() => middleware(req, mockRes as Response, mockNext))
      .toThrow(ValidationError);
  });

  it('provides field-level error details', () => {
    const req = createMockReq({ email: 'bad', age: 10 }) as Request;
    const middleware = validate(testSchema);

    try {
      middleware(req, mockRes as Response, mockNext);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect((err as ValidationError).details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'email' }),
          expect.objectContaining({ field: 'age' }),
        ]),
      );
    }
  });
});
