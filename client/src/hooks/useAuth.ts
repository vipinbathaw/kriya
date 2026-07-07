import { useAuthStore, type AuthState } from '../stores/auth.store';
import { useEffect } from 'react';

export function useAuth(): AuthState {
  const store = useAuthStore();

  useEffect(() => {
    if (store.isLoading) {
      store.loadUser();
    }
  }, []);

  return store;
}
