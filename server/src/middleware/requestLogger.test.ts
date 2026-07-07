import { describe, it, expect, vi, beforeEach } from 'vitest';
import { requestLogger } from './requestLogger.js';
import type { Request, Response } from 'express';

vi.mock('../utils/logger.js', () => ({
  logger: {
    info: vi.fn(),
  },
}));

describe('requestLogger middleware', () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let mockNext: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockReq = {
      method: 'GET',
      originalUrl: '/api/notes',
      url: '/api/notes',
      ip: '127.0.0.1',
      user: { id: 'user-1', email: 'test@test.com' },
    } as Partial<Request>;

    mockRes = {
      statusCode: 200,
      on: vi.fn((_event: string, cb: () => void) => {
        cb();
        return mockRes as Response;
      }),
    } as Partial<Response>;

    mockNext = vi.fn();
  });

  it('calls next to continue processing', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('calls the finish callback', () => {
    requestLogger(mockReq as Request, mockRes as Response, mockNext);
    expect(mockRes.on).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('handles request without user', () => {
    const reqWithoutUser = { ...mockReq, user: undefined } as Request;
    requestLogger(reqWithoutUser as Request, mockRes as Response, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
