import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authenticate } from './authenticate.js';
import { UnauthorizedError } from './errorHandler.js';
import { generateTestToken, generateExpiredToken } from '../test-utils/auth-helper.js';
import type { Request, Response, NextFunction } from 'express';

vi.mock('../config/index.js', () => ({
  config: {
    JWT_SECRET: 'test-secret-that-is-at-least-32-characters-long!!',
  },
}));

function createMockReq(headers?: Record<string, string>): Partial<Request> {
  return {
    headers: headers ?? {},
  } as Partial<Request>;
}

describe('authenticate middleware', () => {
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockRes = {};
    mockNext = vi.fn();
  });

  it('sets req.user for a valid token', () => {
    const userId = 'test-user-id';
    const token = generateTestToken(userId, 'test@example.com');
    const req = createMockReq({ authorization: `Bearer ${token}` }) as Request;

    authenticate(req, mockRes as Response, mockNext as NextFunction);

    expect(req.user).toBeDefined();
    expect(req.user!.id).toBe(userId);
    expect(req.user!.email).toBe('test@example.com');
    expect(mockNext).toHaveBeenCalled();
  });

  it('throws UnauthorizedError when Bearer header is missing', () => {
    const req = createMockReq({}) as Request;

    expect(() => authenticate(req, mockRes as Response, mockNext as NextFunction)).toThrow(
      UnauthorizedError,
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('throws UnauthorizedError when header is malformed', () => {
    const req = createMockReq({ authorization: 'Basic token123' }) as Request;

    expect(() => authenticate(req, mockRes as Response, mockNext as NextFunction)).toThrow(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError when token is expired', () => {
    const token = generateExpiredToken('user-id');
    const req = createMockReq({ authorization: `Bearer ${token}` }) as Request;

    expect(() => authenticate(req, mockRes as Response, mockNext as NextFunction)).toThrow(
      UnauthorizedError,
    );
  });

  it('throws UnauthorizedError when token is invalid', () => {
    const req = createMockReq({ authorization: 'Bearer totally-invalid-token' }) as Request;

    expect(() => authenticate(req, mockRes as Response, mockNext as NextFunction)).toThrow(
      UnauthorizedError,
    );
  });
});
