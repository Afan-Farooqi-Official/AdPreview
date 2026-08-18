// useAuth — provides current user and session state throughout the app.
// Subscribes to Supabase auth changes (or mock session in dev mode).

import { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/auth';
import type { User } from '../types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

export function useAuthProvider(): AuthContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    const u = await authService.getCurrentUser();
    setUser(u);
  };

  useEffect(() => {
    let mounted = true;

    const unsubscribe = authService.onAuthStateChange((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });

    // Initial load
    authService.getCurrentUser().then((u) => {
      if (mounted) {
        setUser(u);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
  };

  return { user, loading, signOut, refreshUser };
}
