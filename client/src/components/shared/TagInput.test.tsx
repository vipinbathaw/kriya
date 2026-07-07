import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TagInput } from './TagInput';

describe('TagInput', () => {
  it('renders existing tags', () => {
    render(<TagInput tags={['tag1', 'tag2']} onChange={vi.fn()} />);
    expect(screen.getByText('tag1')).toBeInTheDocument();
    expect(screen.getByText('tag2')).toBeInTheDocument();
  });

  it('adds a tag on Enter', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    await userEvent.type(input, 'newtag{Enter}');
    expect(onChange).toHaveBeenCalledWith(['newtag']);
  });

  it('adds a tag on comma', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    await userEvent.type(input, 'tag1,');
    expect(onChange).toHaveBeenCalledWith(['tag1']);
  });

  it('trims and lowercases new tags', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={[]} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Add tag...');
    await userEvent.type(input, '  Hello-World {Enter}');
    expect(onChange).toHaveBeenCalledWith(['hello-world']);
  });

  it('does not add duplicate tags', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={['existing']} onChange={onChange} />);
    const input = screen.getByDisplayValue('');
    await userEvent.type(input, 'existing{Enter}');
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes last tag on Backspace with empty input', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={['tag1', 'tag2']} onChange={onChange} />);
    const input = screen.getByPlaceholderText('');
    await userEvent.type(input, '{Backspace}');
    expect(onChange).toHaveBeenCalledWith(['tag1']);
  });

  it('removes a tag by clicking remove button', async () => {
    const onChange = vi.fn();
    render(<TagInput tags={['remove-me']} onChange={onChange} />);
    const removeBtn = screen.getByRole('button');
    await userEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith([]);
  });
});
