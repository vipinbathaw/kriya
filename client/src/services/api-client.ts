const BASE_URL = '/api';

let accessToken: string | null = null;
let sessionExpiredHandler: (() => void) | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setSessionExpiredHandler(handler: (() => void) | null) {
  sessionExpiredHandler = handler;
}

interface ApiError {
  code: string;
  message: string;
  details?: unknown;
}

export class ApiClientError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!res.ok) {
      notifySessionExpired();
      return null;
    }
    const data = await res.json();
    setAccessToken(data.accessToken);
    return data.accessToken;
  } catch {
    notifySessionExpired();
    return null;
  }
}

function notifySessionExpired(): void {
  sessionExpiredHandler?.();
}

const AUTH_PATHS = new Set(['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/verify-email', '/auth/resend-verification']);

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401 && accessToken && !AUTH_PATHS.has(path)) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers['Authorization'] = `Bearer ${newToken}`;
      res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  if (!res.ok) {
    let error: ApiError = { code: 'UNKNOWN', message: 'An error occurred' };
    try {
      const body = await res.json();
      error = body.error || error;
    } catch {
      // ignore parse error
    }
    throw new ApiClientError(res.status, error.code, error.message, error.details);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}
