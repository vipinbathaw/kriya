import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiRequest, setAccessToken, getAccessToken, ApiClientError } from './api-client';

function mockFetchResponse(data: unknown, status: number) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    headers: new Headers({ 'Content-Type': 'application/json' }),
  } as unknown as Response;
}

describe('api-client', () => {
  beforeEach(() => {
    setAccessToken(null);
    vi.restoreAllMocks();
  });

  it('sets and gets access token', () => {
    setAccessToken('test-token');
    expect(getAccessToken()).toBe('test-token');
  });

  it('sends request with authorization header when token exists', async () => {
    setAccessToken('my-token');
    const mockFetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({ data: 'ok' }, 200),
    );

    await apiRequest('/test');

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer my-token',
          'Content-Type': 'application/json',
        }),
        credentials: 'include',
      }),
    );
  });

  it('throws ApiClientError on error response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse({ error: { code: 'NOT_FOUND', message: 'Not found' } }, 404),
    );

    await expect(apiRequest('/missing')).rejects.toThrow(ApiClientError);
    await expect(apiRequest('/missing')).rejects.toThrow('Not found');
  });

  it('returns undefined for 204 status', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      mockFetchResponse(null, 204),
    );

    const result = await apiRequest('/delete');
    expect(result).toBeUndefined();
  });
});
