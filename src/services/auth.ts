// Auth service — abstracts OTP flow over Supabase Auth (or mock in dev).
// Components call ONLY these functions, never the supabase client directly.

import { supabase } from '../lib/supabaseClient';
import { mockUser } from '../mocks/user';
import type { User } from '../types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

// In-memory mock session (resets on page reload — intentional for mock mode)
let _mockSession: User | null = null;

export const authService = {
  /**
   * Send OTP to email. Returns error string on failure.
   */
  async sendOtp(email: string): Promise<{ error: string | null }> {
    if (USE_MOCK) {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 800));
      return { error: null };
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    return { error: error?.message ?? null };
  },

  /**
   * Verify the OTP code the user received. Returns user on success.
   */
  async verifyOtp(
    email: string,
    token: string
  ): Promise<{ user: User | null; error: string | null }> {
    if (USE_MOCK) {
      await new Promise((r) => setTimeout(r, 800));
      if (token === '123456') {
        _mockSession = { ...mockUser, email };
        return { user: _mockSession, error: null };
      }
      return { user: null, error: 'Invalid verification code. Please try again.' };
    }

    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error || !data.user) {
      return { user: null, error: error?.message ?? 'Verification failed.' };
    }

    // Map Supabase user to our internal User type
    // The full user row (with plan) is fetched separately in useAuth
    return {
      user: {
        id: data.user.id,
        email: data.user.email ?? email,
        plan: 'free',
        createdAt: data.user.created_at,
      },
      error: null,
    };
  },

  /**
   * Sign out the current user.
   */
  async signOut(): Promise<void> {
    if (USE_MOCK) {
      _mockSession = null;
      return;
    }
    await supabase.auth.signOut();
  },

  /**
   * Get the currently authenticated user (if any).
   */
  async getCurrentUser(): Promise<User | null> {
    if (USE_MOCK) {
      return _mockSession;
    }

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session?.user) return null;

    const authUser = sessionData.session.user;

    // Fetch plan from our users table
    const { data: userRow } = await supabase
      .from('users')
      .select('plan, created_at')
      .eq('id', authUser.id)
      .single();

    return {
      id: authUser.id,
      email: authUser.email ?? '',
      plan: (userRow?.plan as 'free' | 'pro') ?? 'free',
      createdAt: authUser.created_at,
    };
  },

  /**
   * Subscribe to auth state changes (Supabase real-time session).
   * Returns an unsubscribe function.
   */
  onAuthStateChange(callback: (user: User | null) => void): () => void {
    if (USE_MOCK) {
      // Immediately call with current mock state
      callback(_mockSession);
      return () => {};
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const user = await authService.getCurrentUser();
      callback(user);
    });

    return () => subscription.unsubscribe();
  },
};
