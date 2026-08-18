// Stripe client-side helpers
// NOTE: Stripe secret key is NEVER used here — only the publishable key.
// All secret-key operations happen in /api/* Vercel Serverless Functions.
// TODO: connect Stripe — add VITE_STRIPE_PUBLISHABLE_KEY to .env.local

import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ?? '';

// Lazy-load Stripe only when needed
let stripePromise: ReturnType<typeof loadStripe> | null = null;

export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};
