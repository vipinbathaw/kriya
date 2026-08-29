import { useAuthStore } from '../stores/auth.store';
import { useEffect, useRef } from 'react';

export function useAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const loadUser = useAuthStore((s) => s.loadUser);
  const loadStarted = useRef(false);

  useEffect(() => {
    if (isLoading && !loadStarted.current) {
      loadStarted.current = true;
      loadUser();
    }
  }, [isLoading, loadUser]);

  return { isAuthenticated, isLoading };
}
