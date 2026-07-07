import { apiRequest } from './api-client';

export interface Profile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateProfileInput {
  displayName?: string;
  theme?: 'light' | 'dark' | 'system';
}

export const settingsApi = {
  getProfile: () => apiRequest<Profile>('/settings/profile'),

  updateProfile: (data: UpdateProfileInput) =>
    apiRequest<Profile>('/settings/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};
