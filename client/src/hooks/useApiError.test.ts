import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApiError } from './useApiError';
import { ApiClientError } from '../services/api-client';

describe('useApiError', () => {
  it('initializes with null error', () => {
    const { result } = renderHook(() => useApiError());
    expect(result.current.error).toBeNull();
  });

  it('sets error from ApiClientError', () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError(new ApiClientError(400, 'BAD_REQUEST', 'Invalid input'));
    });
    expect(result.current.error).toBe('Invalid input');
  });

  it('sets error from generic Error', () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError(new Error('Generic error'));
    });
    expect(result.current.error).toBe('Generic error');
  });

  it('sets error from unknown type', () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError('some string');
    });
    expect(result.current.error).toBe('An unexpected error occurred');
  });

  it('clearError resets error to null', () => {
    const { result } = renderHook(() => useApiError());
    act(() => {
      result.current.setError(new Error('test'));
    });
    expect(result.current.error).toBe('test');
    act(() => {
      result.current.clearError();
    });
    expect(result.current.error).toBeNull();
  });
});
