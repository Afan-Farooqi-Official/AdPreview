# AdViz — Advertising Visualization SaaS (MVP)

A modern full-stack web application that lets users upload an advertisement image and preview it placed onto realistic billboard scenes in under 60 seconds.

Built with **React 18 + Vite + TypeScript**, **Tailwind CSS**, **react-konva**, **Supabase** (Auth, Postgres, Storage), and **Stripe**.

---

## Features

- **Landing Page**: Explains value proposition with live preview mockup, "How it works" 3-step guide, and Free vs. Pro comparison.
- **Email OTP Authentication**: Passwordless login/signup with 6-digit one-time code via Supabase Auth (or simulated in mock mode).
- **Interactive Canvas Editor**: Drag, resize, and rotate uploaded ads on top of billboard scenes using Konva.js with transformer handles and sliders.
- **Billboard Scene Library**: 10 billboard scenes (Highway, City Street, Building-Mounted, Shopping Center, Bus Stop, Transit Station, Downtown, etc.) with Free vs. Pro gating.
- **Export / Download**: Standard resolution (≤1280px) for Free users; HD full-resolution export without watermarks for Pro users.
- **Project Persistence**: "My Projects" dashboard for logged-in users to view, reload into the editor, or delete saved previews (capped at 3 for Free tier, unlimited for Pro).
- **Plan Gating & Stripe Integration**: Free vs. Pro ($4.99/month) plan gating with upgrade modal, Stripe Checkout redirect, and Customer Portal integration.
- **Vercel Ready**: Static Vite SPA frontend + Vercel Serverless Functions for Stripe checkout, portal, and webhook handling.

---

## Quick Start (Local Development)

The app comes pre-configured to run out of the box in **Mock Mode** without requiring any external accounts or API keys.

### 1. Install Dependencies
```bash
cd ad-viz-saas
npm install
```

### 2. Start Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Testing in Mock Mode
- **Login / Signup**: On `/signup`, enter any email (e.g. `you@example.com`). Enter verification code **`123456`**.
- **Try With a Sample**: Click "Try With a Sample" on the landing page or visit `/editor?sample=true` to test the canvas without logging in.
- **Upload Your Own Ad**: Log in and drop any JPG/PNG/WebP (under 10MB) onto the dropzone.
- **Pro Gating**: Free accounts are limited to the first 5 scenes, standard export, and up to 3 saved projects. Trying locked scenes or HD download triggers the Upgrade modal.

---

## Production Build

```bash
npm run build
```
Generates a static production bundle in `/dist`.

---

## How to Connect Live Services (Supabase & Stripe)

When you are ready to connect real databases, authentication, storage, and payment processing, follow the steps below.

### 1. Supabase Setup

1. Create a project on [supabase.com](https://supabase.com).
2. Go to **SQL Editor** and run the schema migration below:

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS subscriptions ENABLE ROW LEVEL SECURITY;

-- 1. Users table (denormalized profile for plan checks)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Scenes table (billboard scenes)
CREATE TABLE IF NOT EXISTS scenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'billboard',
  preview_image_url TEXT NOT NULL,
  source_image_url TEXT NOT NULL,
  default_bounding_box JSONB NOT NULL,
  is_pro_only BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true
);

-- 3. Projects table (user saved projects)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  scene_id UUID NOT NULL REFERENCES scenes(id),
  ad_image_url TEXT NOT NULL,
  transform JSONB NOT NULL,
  result_thumbnail_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Subscriptions table (Stripe sync)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  status TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'pro',
  started_at TIMESTAMPTZ DEFAULT NOW(),
  current_period_end TIMESTAMPTZ
);

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Scenes are viewable by everyone" ON scenes FOR SELECT USING (active = true);

CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Auto-create user profile row on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, plan)
  VALUES (new.id, new.email, 'free')
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

3. **Storage Buckets**:
   - In Supabase Dashboard → **Storage**, create a bucket named `ads` (set to Public or configure access policies for authenticated uploads).
4. **Auth Settings**:
   - In Supabase Dashboard → **Authentication** → **Providers** → **Email**, ensure email OTP is enabled.

---

### 2. Stripe Setup

1. Create an account at [stripe.com](https://stripe.com).
2. Create a Product named **AdViz Pro** with a recurring monthly price of **$4.99/month**.
3. Note the **Price ID** (starts with `price_...`).
4. In Stripe Dashboard → **Developers** → **Webhooks**, add an endpoint pointing to `https://your-domain.vercel.app/api/stripe-webhook` listening for:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

---

### 3. Environment Variables Configuration

Create or edit `.env.local`:

```ini
# Switch to false for live backend
VITE_USE_MOCK_DATA=false

# Supabase Keys (from Supabase Dashboard -> Settings -> API)
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...

# Stripe Publishable Key (from Stripe Dashboard -> Developers -> API keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Optional Watermark Flag
VITE_ENABLE_WATERMARK=false
```

#### For Vercel Serverless Functions (Vercel Project Settings → Environment Variables):
- `STRIPE_SECRET_KEY` = `sk_test_...`
- `STRIPE_PRO_PRICE_ID` = `price_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...`
- `SUPABASE_URL` = `https://xxxxxxxxxxxx.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `eyJhbGciOi...` *(Secret service-role key for backend functions only)*
- `APP_URL` = `https://your-domain.vercel.app`

---

## Project Structure

```
ad-viz-saas/
├── api/                           # Vercel Serverless Functions
│   ├── create-checkout-session.ts # Stripe Checkout creation
│   ├── create-portal-session.ts   # Stripe Customer Portal creation
│   └── stripe-webhook.ts          # Stripe Webhook subscription sync
├── public/
│   └── mock/                      # Bundled sample ad & billboard scene images
│       ├── ads/
│       └── scenes/
├── src/
│   ├── components/
│   │   ├── auth/                  # EmailStep, OtpStep
│   │   ├── editor/                # Canvas, SceneGallery, TransformControls, Dropzone, etc.
│   │   ├── landing/               # Hero, HowItWorks, PricingPreview
│   │   ├── layout/                # Header, Footer
│   │   ├── pricing/               # Full comparison PricingTable
│   │   ├── projects/              # ProjectCard, ProjectGrid, DeleteConfirmDialog
│   │   └── shared/                # Button, Input, Spinner, Skeleton, Toast, Badge
│   ├── hooks/
│   │   ├── useAuth.ts             # Auth context & session
│   │   └── useSubscription.ts     # Plan & usage limits
│   ├── lib/
│   │   ├── stripe.ts              # Stripe loader helper
│   │   └── supabaseClient.ts      # Supabase client initialization
│   ├── mocks/                     # Typed mock scenes, projects, user
│   ├── pages/                     # Landing, Signup, Editor, Projects, Pricing, Account, 404
│   ├── services/                  # Data access layer (auth, billing, projects, scenes)
│   ├── types/                     # TypeScript models (Scene, Project, User, Subscription)
│   ├── App.tsx                    # Route definitions & auth guards
│   ├── index.css                  # Design system tokens & layout styling
│   └── main.tsx                   # React root entry
├── .env.example
├── vercel.json
└── package.json
```

---

## Architectural Principles

1. **Services Layer Isolation**: Components never directly invoke the Supabase client or Stripe SDK. All data operations pass through `src/services/` (`auth.ts`, `billing.ts`, `projects.ts`, `scenes.ts`). This ensures seamless swapping between mock data and production APIs.
2. **Security & Secrets**: Stripe secret keys and Supabase service-role keys are isolated strictly within `/api/` Vercel Serverless Functions and never included in frontend client bundles.
3. **Responsive Design**: Mobile-first layout for landing/pricing/account; compact 3-panel workflow for desktop with stacked drawer support on smaller viewports.
