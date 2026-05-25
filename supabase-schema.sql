-- ══════════════════════════════════════════════════════════════
-- DasherPro — Supabase Database Schema
-- Run this in your Supabase project: SQL Editor → New Query → Run
-- ══════════════════════════════════════════════════════════════

-- ── Market guides cache ────────────────────────────────────────
-- Caches AI-generated city guides for 7 days to minimize API costs
CREATE TABLE IF NOT EXISTS market_guides (
  id          BIGSERIAL PRIMARY KEY,
  city_key    TEXT UNIQUE NOT NULL,   -- e.g. "dallas-tx"
  city_name   TEXT NOT NULL,          -- e.g. "Dallas TX"
  guide       JSONB NOT NULL,         -- Full AI-generated guide object
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_guides_city_key ON market_guides(city_key);

-- ── Subscriptions ──────────────────────────────────────────────
-- Synced from Stripe via webhook
CREATE TABLE IF NOT EXISTS subscriptions (
  id                      BIGSERIAL PRIMARY KEY,
  user_id                 UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id      TEXT,
  stripe_subscription_id  TEXT UNIQUE,
  plan                    TEXT,        -- 'hustler' | 'pro' | 'annual'
  status                  TEXT,        -- 'active' | 'cancelled' | 'past_due'
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON subscriptions(stripe_subscription_id);

-- ── Order log ─────────────────────────────────────────────────
-- Users log their orders for earnings tracking and market data
CREATE TABLE IF NOT EXISTS orders (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  city_key    TEXT,
  pay         DECIMAL(8,2) NOT NULL,
  miles       DECIMAL(6,2) NOT NULL,
  tip         DECIMAL(8,2) DEFAULT 0,
  accepted    BOOLEAN DEFAULT TRUE,
  shift_time  TEXT,   -- 'lunch' | 'dinner' | 'late' | 'morning'
  notes       TEXT,
  dashed_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_city ON orders(city_key);

-- ── User profiles ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  city        TEXT,
  city_key    TEXT,
  plan        TEXT DEFAULT 'free',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Row Level Security ────────────────────────────────────────
-- Users can only read/write their own data

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;

-- Subscriptions
CREATE POLICY "Users read own subscription"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Orders
CREATE POLICY "Users manage own orders"
  ON orders FOR ALL USING (auth.uid() = user_id);

-- Profiles
CREATE POLICY "Users manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

-- Market guides are public (cached, no user data)
ALTER TABLE market_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Market guides are public"
  ON market_guides FOR SELECT USING (true);

-- Service role can write market guides (from API route)
CREATE POLICY "Service role writes market guides"
  ON market_guides FOR ALL USING (true);
