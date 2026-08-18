// Vercel Serverless Function — creates a Stripe Customer Portal session.
// Allows Pro users to manage/cancel their subscription.
// TODO: connect Stripe — add STRIPE_SECRET_KEY to Vercel environment variables.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
});

// Use the service-role key SERVER-SIDE ONLY (never in frontend)
const supabase = createClient(
  process.env.SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId } = req.body as { userId?: string };
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(500).json({ error: 'Stripe is not configured on this server.' });
  }

  try {
    // Look up stripe_customer_id from subscriptions table
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single();

    if (!sub?.stripe_customer_id) {
      return res.status(404).json({ error: 'No active subscription found.' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/account`,
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
