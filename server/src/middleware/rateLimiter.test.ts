import { describe, it, expect, vi, beforeEach } from 'vitest';
import { rateLimiter } from './rateLimiter.js';
import { AppError } from './errorHandler.js';
import type { Request, Response } from 'express';

describe('rateLimiter middleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRes = {};
    mockNext = vi.fn();
  });

  it('allows request within limit', () => {
    const limiter = rateLimiter(5, 60000);
    const req = { ip: '127.0.0.1', path: '/api/allow-test' } as Request;

    for (let i = 0; i < 5; i++) {
      limiter(req, mockRes as Response, mockNext);
    }

    expect(mockNext).toHaveBeenCalledTimes(5);
  });

  it('blocks request when limit exceeded', () => {
    const limiter = rateLimiter(3, 60000);
    const req = { ip: '127.0.0.1', path: '/api/block-test' } as Request;

    for (let i = 0; i < 3; i++) {
      limiter(req, mockRes as Response, mockNext);
    }

    expect(() => limiter(req, mockRes as Response, mockNext)).toThrow(AppError);
  });

  it('throws 429 RATE_LIMIT_EXCEEDED error', () => {
    const limiter = rateLimiter(1, 60000);
    const req = { ip: '127.0.0.1', path: '/api/throw-test' } as Request;

    limiter(req, mockRes as Response, mockNext);

    try {
      limiter(req, mockRes as Response, mockNext);
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(AppError);
      expect((err as AppError).statusCode).toBe(429);
      expect((err as AppError).code).toBe('RATE_LIMIT_EXCEEDED');
    }
  });

  it('resets after window expires', async () => {
    const limiter = rateLimiter(1, 50);
    const req = { ip: '127.0.0.1', path: '/api/reset-test' } as Request;

    limiter(req, mockRes as Response, mockNext);

    await new Promise((resolve) => setTimeout(resolve, 60));

    limiter(req, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalledTimes(2);
  });

  it('tracks different paths separately', () => {
    const limiter = rateLimiter(2, 60000);
    const req1 = { ip: '127.0.0.1', path: '/api/path-a' } as Request;
    const req2 = { ip: '127.0.0.1', path: '/api/path-b' } as Request;

    limiter(req1, mockRes as Response, mockNext);
    limiter(req1, mockRes as Response, mockNext);
    limiter(req2, mockRes as Response, mockNext);

    expect(mockNext).toHaveBeenCalledTimes(3);
  });
});
