import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NutritionListPage } from './NutritionListPage';
import { useToastStore } from '../stores/toast.store';

vi.mock('../services/nutrition.api', () => ({
  nutritionApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

import { nutritionApi } from '../services/nutrition.api';

function renderWithProviders() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/nutrition']}>
        <NutritionListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NutritionListPage', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    vi.mocked(nutritionApi.list).mockResolvedValue({ data: [], nextCursor: null });
    renderWithProviders();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
  });

  it('has log meal button', async () => {
    vi.mocked(nutritionApi.list).mockResolvedValue({ data: [], nextCursor: null });
    renderWithProviders();
    expect(await screen.findByText('Log Meal')).toBeInTheDocument();
  });

  it('shows loading spinner when loading', () => {
    vi.mocked(nutritionApi.list).mockImplementation(() => new Promise(() => {}));
    renderWithProviders();
    const spinner = document.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });
});
