import { create } from 'zustand';
import type { User, RegisterResponse } from '@kriya/shared';
import { setAccessToken, setSessionExpiredHandler, apiRequest } from '../services/api-client';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<RegisterResponse>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email: string, password: string) => {
    const res = await apiRequest<{ user: User; accessToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAccessToken(res.accessToken);
    set({ user: res.user, isAuthenticated: true });
  },

  register: async (email: string, password: string, displayName: string) => {
    const res = await apiRequest<RegisterResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    if (res.accessToken) {
      setAccessToken(res.accessToken);
      set({ user: res.user, isAuthenticated: true });
    }
    return res;
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore logout errors
    }
    setAccessToken(null);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const res = await apiRequest<{ accessToken: string }>('/auth/refresh', { method: 'POST' });
      setAccessToken(res.accessToken);
      const user = await apiRequest<User>('/auth/me');
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => {
    set({ user, isAuthenticated: !!user });
  },
}));

setSessionExpiredHandler(() => {
  setAccessToken(null);
  useAuthStore.setState({ user: null, isAuthenticated: false, isLoading: false });
});
