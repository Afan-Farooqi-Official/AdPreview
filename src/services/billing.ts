// Billing service — Stripe Checkout and Customer Portal session creation.
// Secret key operations happen ONLY in /api/* Vercel Serverless Functions.

const USE_MOCK = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const billingService = {
  /**
   * Redirect to Stripe Checkout for the Pro plan.
   */
  async createCheckoutSession(userId: string, email: string): Promise<{ error: string | null }> {
    if (USE_MOCK) {
      // TODO: connect Stripe — in mock mode, simulate upgrade by redirecting to pricing
      alert(
        'Stripe Checkout is not configured in mock mode.\n\nSet VITE_USE_MOCK_DATA=false and add your Stripe keys to enable real payments.'
      );
      return { error: null };
    }

    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body.error ?? 'Failed to create checkout session.' };
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
    return { error: null };
  },

  /**
   * Open the Stripe Customer Portal for subscription management.
   */
  async createPortalSession(userId: string): Promise<{ error: string | null }> {
    if (USE_MOCK) {
      alert(
        'Stripe Customer Portal is not configured in mock mode.\n\nSet VITE_USE_MOCK_DATA=false and add your Stripe keys to enable subscription management.'
      );
      return { error: null };
    }

    const response = await fetch('/api/create-portal-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return { error: body.error ?? 'Failed to create portal session.' };
    }

    const { url } = await response.json();
    if (url) {
      window.location.href = url;
    }
    return { error: null };
  },
};
