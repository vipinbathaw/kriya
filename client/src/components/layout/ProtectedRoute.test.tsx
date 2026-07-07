import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuthStore } from '../../stores/auth.store';

describe('ProtectedRoute', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: true,
    });
  });

  it('shows loading spinner when auth is loading', () => {
    render(
      <MemoryRouter>
        <ProtectedRoute>content</ProtectedRoute>
      </MemoryRouter>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
