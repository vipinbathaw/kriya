import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from './toast.store';

describe('toast.store', () => {
  beforeEach(() => {
    useToastStore.setState({ toasts: [] });
  });

  it('starts with empty toasts', () => {
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('addToast adds a toast with id', () => {
    useToastStore.getState().addToast('Hello', 'info');
    const toasts = useToastStore.getState().toasts;
    expect(toasts).toHaveLength(1);
    expect(toasts[0].message).toBe('Hello');
    expect(toasts[0].variant).toBe('info');
    expect(toasts[0].id).toBeTruthy();
  });

  it('addToast defaults to info variant', () => {
    useToastStore.getState().addToast('Default');
    expect(useToastStore.getState().toasts[0].variant).toBe('info');
  });

  it('removeToast removes a toast by id', () => {
    useToastStore.getState().addToast('Test', 'success');
    const id = useToastStore.getState().toasts[0].id;
    useToastStore.getState().removeToast(id);
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('supports multiple toasts', () => {
    useToastStore.getState().addToast('First', 'info');
    useToastStore.getState().addToast('Second', 'error');
    expect(useToastStore.getState().toasts).toHaveLength(2);
  });
});
