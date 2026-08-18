// Vercel Serverless Function — Stripe webhook handler.
// Listens for subscription lifecycle events and updates Supabase accordingly.
// TODO: connect Stripe — add STRIPE_WEBHOOK_SECRET to Vercel environment variables.

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

// Required for Vercel to parse raw body for signature verification
export const config = { api: { bodyParser: false } };

async function getRawBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Uint8Array[] = [];
    req.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return res.status(400).json({ error: 'Missing stripe-signature or webhook secret' });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await getRawBody(req);
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed';
    return res.status(400).json({ error: message });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (!userId) break;

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const periodEnd = new Date(sub.current_period_end * 1000).toISOString();

        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscriptionId,
          status: sub.status,
          plan: 'pro',
          started_at: new Date().toISOString(),
          current_period_end: periodEnd,
        });

        await supabase.from('users').update({ plan: 'pro' }).eq('id', userId);
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;
        const newPlan = sub.status === 'active' ? 'pro' : 'free';

        await supabase
          .from('subscriptions')
          .update({
            status: sub.status,
            current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', sub.id);

        if (userId) {
          await supabase.from('users').update({ plan: newPlan }).eq('id', userId);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const userId = sub.metadata?.userId;

        await supabase
          .from('subscriptions')
          .update({ status: 'canceled' })
          .eq('stripe_subscription_id', sub.id);

        if (userId) {
          await supabase.from('users').update({ plan: 'free' }).eq('id', userId);
        }
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Handler error';
    console.error('Webhook handler error:', message);
    return res.status(500).json({ error: message });
  }

  return res.status(200).json({ received: true });
}
