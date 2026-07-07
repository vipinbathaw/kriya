import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';
import { useThemeStore } from '../stores/theme.store';

describe('useTheme', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'light' });
  });

  it('returns current theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('returns isDark false for light theme', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.isDark).toBe(false);
  });

  it('returns setTheme function', () => {
    const { result } = renderHook(() => useTheme());
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('updates when theme changes', () => {
    const { result, rerender } = renderHook(() => useTheme());
    act(() => {
      useThemeStore.getState().setTheme('dark');
    });
    rerender();
    expect(result.current.theme).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });
});
