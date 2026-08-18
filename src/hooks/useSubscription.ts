// useSubscription — returns current user plan status for gating checks.

import { useAuth } from './useAuth';
import type { Plan } from '../types';
import { FREE_PROJECT_LIMIT } from '../types';

export function useSubscription() {
  const { user } = useAuth();

  const plan: Plan = user?.plan ?? 'free';
  const isPro = plan === 'pro';
  const isFree = plan === 'free';

  return {
    plan,
    isPro,
    isFree,
    projectLimit: isPro ? Infinity : FREE_PROJECT_LIMIT,
  };
}
