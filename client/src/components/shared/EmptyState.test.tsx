import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptyState } from './EmptyState';
import { FileText } from 'lucide-react';

describe('EmptyState', () => {
  it('renders icon, title, and description', () => {
    render(
      <EmptyState
        icon={FileText}
        title="No notes"
        description="Create your first note"
      />,
    );
    expect(screen.getByText('No notes')).toBeInTheDocument();
    expect(screen.getByText('Create your first note')).toBeInTheDocument();
  });

  it('renders action button when provided', () => {
    render(
      <EmptyState
        icon={FileText}
        title="Empty"
        action={<button>Create</button>}
      />,
    );
    expect(screen.getByText('Create')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(<EmptyState icon={FileText} title="Empty" />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
