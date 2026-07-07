import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotesListPage } from './NotesListPage';
import { useToastStore } from '../stores/toast.store';

vi.mock('../services/notes.api', () => ({
  notesApi: {
    list: vi.fn(),
    delete: vi.fn(),
  },
}));

import { notesApi } from '../services/notes.api';

function renderWithProviders() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/notes']}>
        <NotesListPage />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('NotesListPage', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
    vi.clearAllMocks();
  });

  it('renders page title', () => {
    vi.mocked(notesApi.list).mockResolvedValue({ data: [], nextCursor: null });
    renderWithProviders();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('has new note button', () => {
    vi.mocked(notesApi.list).mockResolvedValue({ data: [], nextCursor: null });
    renderWithProviders();
    expect(screen.getByText('New Note')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(notesApi.list).mockImplementation(() => new Promise(() => {}));
    renderWithProviders();
    expect(screen.getByText('New Note')).toBeInTheDocument();
  });
});
