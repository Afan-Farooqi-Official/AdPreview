// Vercel Serverless Function — creates a Stripe Checkout session for the Pro plan.
// This is the ONLY place the Stripe secret key is used — never in frontend code.
// TODO: connect Stripe — add STRIPE_SECRET_KEY and STRIPE_PRO_PRICE_ID to Vercel environment variables.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
  apiVersion: '2025-01-27.acacia',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userId, email } = req.body as { userId?: string; email?: string };

  if (!userId || !email) {
    return res.status(400).json({ error: 'Missing userId or email' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRO_PRICE_ID) {
    return res.status(500).json({ error: 'Stripe is not configured on this server.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRO_PRICE_ID,
          quantity: 1,
        },
      ],
      success_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/account?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.APP_URL ?? 'http://localhost:5173'}/pricing`,
      metadata: { userId },
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
