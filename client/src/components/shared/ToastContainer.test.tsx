import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ToastContainer } from './ToastContainer';
import { useToastStore } from '../../stores/toast.store';

describe('ToastContainer', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('renders nothing when no toasts', () => {
    const { container } = render(<ToastContainer />);
    expect(container.innerHTML).toBe('');
  });

  it('renders toasts from store', () => {
    useToastStore.getState().addToast('Success message', 'success');
    render(<ToastContainer />);
    expect(screen.getByText('Success message')).toBeInTheDocument();
  });

  it('renders multiple toasts', () => {
    useToastStore.getState().addToast('First', 'info');
    useToastStore.getState().addToast('Second', 'error');
    render(<ToastContainer />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('removes toast when close button clicked', async () => {
    useToastStore.getState().addToast('Dismiss me', 'info');
    render(<ToastContainer />);
    const closeBtn = screen.getByRole('button');
    await userEvent.click(closeBtn);
    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('sets alert role on toasts', () => {
    useToastStore.getState().addToast('Alert', 'error');
    render(<ToastContainer />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});
