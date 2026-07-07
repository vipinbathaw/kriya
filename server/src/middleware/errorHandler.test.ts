import { describe, it, expect, vi } from 'vitest';
import { AppError, NotFoundError, UnauthorizedError, ValidationError, ConflictError, errorHandler } from './errorHandler.js';
import type { Request, Response, NextFunction } from 'express';

describe('AppError', () => {
  it('creates an error with status, code, and message', () => {
    const err = new AppError(400, 'TEST_ERROR', 'Something went wrong', { field: 'test' });
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('TEST_ERROR');
    expect(err.message).toBe('Something went wrong');
    expect(err.details).toEqual({ field: 'test' });
  });
});

describe('NotFoundError', () => {
  it('creates a 404 error for a resource', () => {
    const err = new NotFoundError('Note');
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('NOTE_NOT_FOUND');
    expect(err.message).toBe('Note not found');
  });
});

describe('UnauthorizedError', () => {
  it('creates a 401 error', () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe('UNAUTHORIZED');
    expect(err.message).toBe('Unauthorized');
  });

  it('accepts custom message', () => {
    const err = new UnauthorizedError('Custom message');
    expect(err.message).toBe('Custom message');
  });
});

describe('ValidationError', () => {
  it('creates a 400 error with details', () => {
    const details = [{ field: 'email', message: 'Invalid email' }];
    const err = new ValidationError(details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details).toEqual(details);
  });
});

describe('ConflictError', () => {
  it('creates a 409 error', () => {
    const err = new ConflictError('Email already registered');
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('CONFLICT');
    expect(err.message).toBe('Email already registered');
  });
});

describe('errorHandler middleware', () => {
  function createMockRes() {
  const json = vi.fn();
  const status = vi.fn(() => ({ json }) as unknown as Response);
  return { status, json } as unknown as Response;
}

  const mockReq = {} as Request;
  const mockNext = vi.fn() as NextFunction;

  it('handles AppError with status and JSON body', () => {
    const mockRes = createMockRes();
    const err = new AppError(400, 'VALIDATION_ERROR', 'Invalid input', [{ field: 'name' }]);

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect((mockRes.status(400) as any).json).toHaveBeenCalledWith({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid input',
        details: [{ field: 'name' }],
      },
    });
  });

  it('handles AppError without details', () => {
    const mockRes = createMockRes();
    const err = new NotFoundError('Note');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect((mockRes.status(404) as any).json).toHaveBeenCalledWith({
      error: {
        code: 'NOTE_NOT_FOUND',
        message: 'Note not found',
      },
    });
  });

  it('handles non-AppError as 500', () => {
    const mockRes = createMockRes();
    const err = new Error('Unexpected crash');

    errorHandler(err, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect((mockRes.status(500) as any).json).toHaveBeenCalledWith({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred',
      },
    });
  });
});
