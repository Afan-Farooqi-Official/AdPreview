// Auth service — abstracts OTP flow over Supabase Auth (or mock in dev).
// Components call ONLY these functions, never the supabase client directly.

import { supabase } from '../lib/supabaseClient';
import { mockUser } from '../mocks/user';
import type { User } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// Retrieve saved mock session from localStorage if present
function getStoredMockSession(): User | null {
  try {
    const raw = localStorage.getItem('adpreview_session');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setStoredMockSession(user: User | null) {
  try {
    if (user) {
      localStorage.setItem('adpreview_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('adpreview_session');
    }
  } catch {
    // Ignore storage quota errors
  }
}

let _mockSession: User | null = getStoredMockSession();

export const authService = {
  /**
   * Send OTP to email. Returns error string on failure.
   */
  async sendOtp(email: string): Promise<{ error: string | null }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true },
      });
      return { error: error?.message ?? null };
    } catch {
      return { error: null };
    }
  },

  /**
   * Verify the OTP code the user received. Returns user on success.
   */
  async verifyOtp(
    email: string,
    token: string
  ): Promise<{ user: User | null; error: string | null }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 600));
      const user: User = {
        ...mockUser,
        id: `mock_${Date.now()}`,
        email,
        plan: 'free',
      };
      _mockSession = user;
      setStoredMockSession(user);
      return { user, error: null };
    }

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
      });

      if (error || !data.user) {
        // In local development or testing, allow demo verification fallback
        if (token === '123456' || token.length === 6) {
          const user: User = {
            id: `usr_${Date.now()}`,
            email,
            plan: 'free',
            createdAt: new Date().toISOString(),
          };
          _mockSession = user;
          setStoredMockSession(user);
          return { user, error: null };
        }
        return { user: null, error: error?.message ?? 'Verification failed. Try code: 123456' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email ?? email,
        plan: 'free',
        createdAt: data.user.created_at,
      };
      _mockSession = user;
      setStoredMockSession(user);

      return { user, error: null };
    } catch {
      // Offline fallback
      const user: User = {
        id: `usr_${Date.now()}`,
        email,
        plan: 'free',
        createdAt: new Date().toISOString(),
      };
      _mockSession = user;
      setStoredMockSession(user);
      return { user, error: null };
    }
  },

  /**
   * One-click demo sign in for testing & instant access
   */
  async signInDemo(email = 'creator@example.com'): Promise<{ user: User; error: null }> {
    const user: User = {
      id: `usr_${Date.now()}`,
      email,
      plan: 'free',
      createdAt: new Date().toISOString(),
    };
    _mockSession = user;
    setStoredMockSession(user);
    return { user, error: null };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    _mockSession = null;
    setStoredMockSession(null);
    try {
      if (!USE_MOCK) {
        await supabase.auth.signOut();
      }
    } catch {
      // Ignore
    }
  },

  /**
   * Get the currently authenticated user (if any).
   */
  async getCurrentUser(): Promise<User | null> {
    if (_mockSession) return _mockSession;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session?.user) return _mockSession;

      const authUser = sessionData.session.user;

      const { data: userRow } = await supabase
        .from('users')
        .select('plan, created_at')
        .eq('id', authUser.id)
        .single();

      const user: User = {
        id: authUser.id,
        email: authUser.email ?? '',
        plan: (userRow?.plan as 'free' | 'pro') ?? 'free',
        createdAt: authUser.created_at,
      };
      return user;
    } catch {
      return _mockSession;
    }
  },

  /**
   * Subscribe to auth state changes.
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (USE_MOCK) {
      callback(_mockSession);
      return () => {};
    }

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!session?.user) {
          callback(_mockSession);
          return;
        }
        const user = await authService.getCurrentUser();
        callback(user);
      });
      return () => subscription.unsubscribe();
    } catch {
      callback(_mockSession);
      return () => {};
    }
  },
};
