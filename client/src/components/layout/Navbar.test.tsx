import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { useAuthStore } from '../../stores/auth.store';
import { useThemeStore } from '../../stores/theme.store';
import { createMockUser } from '../../test-utils/mocks';

describe('Navbar', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: createMockUser(),
      isAuthenticated: true,
      isLoading: false,
    });
    useThemeStore.setState({ theme: 'light' });
  });

  it('renders brand name', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText('Kriya')).toBeInTheDocument();
  });

  it('shows user initial in avatar', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByText('T')).toBeInTheDocument();
  });

  it('toggles user menu on avatar click', async () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    const avatarBtn = screen.getByLabelText('User menu');
    await userEvent.click(avatarBtn);
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Sign out')).toBeInTheDocument();
  });

  it('shows theme toggle button', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
    );
    expect(screen.getByLabelText(/switch theme/i)).toBeInTheDocument();
  });
});
