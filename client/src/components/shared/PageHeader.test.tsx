import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PageHeader } from './PageHeader';

describe('PageHeader', () => {
  it('renders title', () => {
    render(<PageHeader title="Notes" />);
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });

  it('renders action when provided', () => {
    render(<PageHeader title="Notes" action={<button>Add</button>} />);
    expect(screen.getByText('Add')).toBeInTheDocument();
  });

  it('uses semantic header element', () => {
    render(<PageHeader title="Test" />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });
});
