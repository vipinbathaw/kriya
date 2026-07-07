import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DatePicker } from './DatePicker';

describe('DatePicker', () => {
  it('renders with value and label', () => {
    render(<DatePicker value="2025-06-01" onChange={vi.fn()} label="Date" />);
    expect(screen.getByText('Date')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-06-01')).toBeInTheDocument();
  });

  it('calls onChange when date changes', async () => {
    const onChange = vi.fn();
    render(<DatePicker value="2025-06-01" onChange={onChange} />);
    const input = screen.getByDisplayValue('2025-06-01');
    await userEvent.clear(input);
    await userEvent.type(input, '2025-06-15');
    expect(onChange).toHaveBeenCalled();
  });
});
