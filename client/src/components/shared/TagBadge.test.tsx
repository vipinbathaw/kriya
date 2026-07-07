import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagBadge } from './TagBadge';

describe('TagBadge', () => {
  it('renders tag text', () => {
    render(<TagBadge tag="test-tag" />);
    expect(screen.getByText('test-tag')).toBeInTheDocument();
  });

  it('shows remove button when onRemove provided', () => {
    render(<TagBadge tag="test" onRemove={vi.fn()} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('calls onRemove when remove button clicked', async () => {
    const onRemove = vi.fn();
    render(<TagBadge tag="test" onRemove={onRemove} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not show remove button when onRemove not provided', () => {
    render(<TagBadge tag="test" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
