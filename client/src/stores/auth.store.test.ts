import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from './auth.store';

vi.mock('../services/api-client', () => ({
  apiRequest: vi.fn(),
  setAccessToken: vi.fn(),
  setSessionExpiredHandler: vi.fn(),
}));

import { apiRequest } from '../services/api-client';

describe('auth.store', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: true });
    vi.clearAllMocks();
  });

  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(true);
  });

  it('setUser updates user and auth status', () => {
    const user = { id: '1', email: 'test@test.com', displayName: 'Test', avatarUrl: undefined, createdAt: '', updatedAt: '' };
    useAuthStore.getState().setUser(user);
    const state = useAuthStore.getState();
    expect(state.user).toEqual(user);
    expect(state.isAuthenticated).toBe(true);
  });

  it('setUser with null clears auth', () => {
    useAuthStore.getState().setUser(null);
    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('login calls apiRequest and updates state', async () => {
    const mockResponse = {
      user: { id: '1', email: 'test@test.com', displayName: 'Test', avatarUrl: undefined, createdAt: '', updatedAt: '' },
      accessToken: 'token-123',
    };
    vi.mocked(apiRequest).mockResolvedValue(mockResponse);

    await useAuthStore.getState().login('test@test.com', 'password');

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('test@test.com');
    expect(state.isAuthenticated).toBe(true);
  });

  it('loadUser refreshes token on mount', async () => {
    vi.mocked(apiRequest)
      .mockResolvedValueOnce({ accessToken: 'new-token' })
      .mockResolvedValueOnce({ id: '1', email: 'a@b.com', displayName: 'A', avatarUrl: undefined, createdAt: '', updatedAt: '' });

    await useAuthStore.getState().loadUser();

    const state = useAuthStore.getState();
    expect(state.user?.email).toBe('a@b.com');
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  it('logout clears user and token', async () => {
    useAuthStore.setState({ user: { id: '1', email: 'a@b.com', displayName: 'A', avatarUrl: undefined, createdAt: '', updatedAt: '' }, isAuthenticated: true });
    vi.mocked(apiRequest).mockRejectedValue(new Error('no-op'));

    await useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
