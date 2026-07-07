import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders a spinner', () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('applies custom size', () => {
    const { container } = render(<LoadingSpinner size={48} />);
    const spinner = container.querySelector('.animate-spin') as HTMLElement;
    expect(spinner.style.width).toBe('48px');
    expect(spinner.style.height).toBe('48px');
  });

  it('applies additional className', () => {
    const { container } = render(<LoadingSpinner className="my-4" />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('my-4');
  });
});
