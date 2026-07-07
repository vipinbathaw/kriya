import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileNav } from './MobileNav';

describe('MobileNav', () => {
  it('renders all navigation items', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    );
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Finance')).toBeInTheDocument();
    expect(screen.getByText('Nutrition')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('uses nav element', () => {
    render(
      <MemoryRouter>
        <MobileNav />
      </MemoryRouter>,
    );
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
