import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FinanceListPage } from './FinanceListPage';
import { useToastStore } from '../stores/toast.store';

vi.mock('../services/finance.api', () => ({
  financeApi: {
    list: vi.fn(),
    summary: vi.fn(),
    delete: vi.fn(),
  },
}));

import { financeApi } from '../services/finance.api';

function renderWithProviders() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/finance']}>
        <FinanceListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('FinanceListPage', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    vi.mocked(financeApi.list).mockResolvedValue({ data: [], nextCursor: null });
    vi.mocked(financeApi.summary).mockResolvedValue({ totalCredits: 0, totalDebits: 0, balance: 0, currency: 'INR' });
    renderWithProviders();
    expect(screen.getByText('Finance')).toBeInTheDocument();
  });

  it('has add button', () => {
    vi.mocked(financeApi.list).mockResolvedValue({ data: [], nextCursor: null });
    vi.mocked(financeApi.summary).mockResolvedValue({ totalCredits: 0, totalDebits: 0, balance: 0, currency: 'INR' });
    renderWithProviders();
    expect(screen.getByText('Add')).toBeInTheDocument();
  });
});
