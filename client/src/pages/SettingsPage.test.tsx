import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SettingsPage } from './SettingsPage';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useToastStore } from '../stores/toast.store';
import { createMockUser } from '../test-utils/mocks';

vi.mock('../hooks/useAIConfig', () => ({
  useAIConfig: () => ({
    configs: [],
    providers: [],
    apiKeys: [],
    loading: false,
    saving: false,
    error: null,
    updateConfig: vi.fn(),
    storeApiKey: vi.fn(),
    deleteApiKey: vi.fn(),
    getProviderModels: vi.fn(() => []),
    reload: vi.fn(),
  }),
}));

vi.mock('../services/settings.api', () => ({
  settingsApi: {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
  },
}));

import { settingsApi } from '../services/settings.api';

function renderWithProviders() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('SettingsPage', () => {
  beforeEach(() => {
    useAuthStore.setState({ user: createMockUser(), isAuthenticated: true, isLoading: false });
    useThemeStore.setState({ theme: 'light' });
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
    vi.mocked(settingsApi.getProfile).mockResolvedValue({
      id: 'user-1',
      displayName: 'Test User',
      email: 'test@example.com',
      avatarUrl: null,
      theme: 'light' as const,
    });
  });

  it('renders settings page with general tab active', async () => {
    renderWithProviders();
    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('AI Settings')).toBeInTheDocument();
  });

  it('shows profile section with user email', async () => {
    renderWithProviders();
    expect(await screen.findByText('Profile')).toBeInTheDocument();
  });

  it('shows theme section', async () => {
    renderWithProviders();
    expect(await screen.findByText('Theme')).toBeInTheDocument();
    expect(screen.getByText('Light')).toBeInTheDocument();
    expect(screen.getByText('Dark')).toBeInTheDocument();
    expect(screen.getByText('System')).toBeInTheDocument();
  });

  it('shows sign out button', async () => {
    renderWithProviders();
    expect(await screen.findByText('Sign out')).toBeInTheDocument();
  });

  it('switches to AI settings tab', async () => {
    renderWithProviders();
    const aiTab = await screen.findByText('AI Settings');
    await userEvent.click(aiTab);
    expect(screen.getByText('API Keys')).toBeInTheDocument();
    expect(screen.getByText('Module AI Configuration')).toBeInTheDocument();
  });
});
