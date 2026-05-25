# DasherPro — Setup & Deployment Guide

## What this is
A full Next.js SaaS application for DoorDash dashers. AI-powered market intelligence for every US city, earnings tracking, order grader, and subscription billing via Stripe.

---

## Stack
- **Next.js 14** — full-stack framework (frontend + API routes)
- **Supabase** — database (PostgreSQL) + authentication
- **Stripe** — subscription billing ($7.99 / $14.99 / $99/yr)
- **Anthropic Claude API** — AI coach + city market guide generation
- **Vercel** — free hosting with automatic deployments

---

## 1. Local setup

```bash
# Clone or copy this project folder
cd dasherpro
npm install
cp .env.local.example .env.local
# Fill in your keys (see steps below)
npm run dev
# Open http://localhost:3000
```

---

## 2. Supabase setup (free)

1. Go to https://supabase.com → "New project"
2. Choose a name (e.g. "dasherpro") and a strong password
3. Once created, go to **Settings → API**
4. Copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`
5. Go to **SQL Editor → New Query**
6. Paste the entire contents of `supabase-schema.sql` and click **Run**
7. Enable **Email auth** in Authentication → Providers

---

## 3. Anthropic API key

1. Go to https://console.anthropic.com
2. Create an API key
3. Copy it → `ANTHROPIC_API_KEY`

**Cost estimate:**
- Market guide generation: ~$0.002 per city (cached 7 days)
- AI coach: ~$0.001 per message
- At 1,000 active users: ~$20–40/month total

---

## 4. Stripe setup (free until you earn)

1. Go to https://dashboard.stripe.com → Create account
2. **API Keys** (Developers → API keys):
   - Secret key → `STRIPE_SECRET_KEY`
   - Publishable key → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

3. **Create products** (Products → Add product):

   **Hustler — $7.99/month**
   - Name: DasherPro Hustler
   - Pricing: $7.99, recurring, monthly
   - Copy the Price ID → `STRIPE_PRICE_HUSTLER`

   **Pro Dasher — $14.99/month**
   - Name: DasherPro Pro Dasher
   - Pricing: $14.99, recurring, monthly
   - Copy the Price ID → `STRIPE_PRICE_PRO`

   **Pro Annual — $99/year**
   - Name: DasherPro Pro Annual
   - Pricing: $99.00, recurring, yearly
   - Copy the Price ID → `STRIPE_PRICE_ANNUAL`

4. **Webhook** (Developers → Webhooks → Add endpoint):
   - URL: `https://your-vercel-domain.vercel.app/api/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.deleted`, `customer.subscription.updated`
   - Copy signing secret → `STRIPE_WEBHOOK_SECRET`

---

## 5. Deploy to Vercel (free)

1. Go to https://vercel.com → "Add New Project"
2. Import this project folder (push to GitHub first, or drag/drop)
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Click **Deploy**
5. Update `NEXT_PUBLIC_APP_URL` to your Vercel URL
6. Update your Stripe webhook URL to your Vercel domain

**Your app is live.** 🎉

---

## 6. Go-to-market — first 20 customers

### Week 1: Soft launch
Post in these communities with: *"I built a free tool for DoorDash dashers — it generates local zone guides for any US city using AI. Would love feedback from real dashers."*

- r/doordash_drivers (800k members)
- r/gigworkers  
- DoorDash Drivers Facebook groups (search "DoorDash drivers [your city]")
- NextDoor in your local area

### Week 2: Founding member offer
Email or DM anyone who signed up:
*"I'm offering founding member pricing — $6.99/month locked forever (vs $14.99 regular price) for the first 20 people who subscribe this week."*

Create a Stripe coupon for 53% off applied forever.

### Week 3+: Content engine
- TikTok/Reels: "I made $X in Y hours using this strategy" → link to DasherPro
- Reddit posts showing your actual earnings with zones highlighted
- YouTube shorts of the AI coach answering common dasher questions

---

## Project structure

```
dasherpro/
├── app/
│   ├── page.js              ← Landing page
│   ├── dashboard/
│   │   └── page.js          ← Full dashboard app
│   ├── api/
│   │   ├── market-guide/    ← AI city guide generator
│   │   │   └── route.js
│   │   ├── coach/           ← AI coach chat
│   │   │   └── route.js
│   │   ├── create-checkout/ ← Stripe checkout
│   │   │   └── route.js
│   │   └── webhook/         ← Stripe webhook handler
│   │       └── route.js
│   ├── layout.js
│   └── globals.css
├── lib/
│   ├── supabase.js          ← Supabase client
│   └── stripe.js            ← Stripe client + plan config
├── supabase-schema.sql      ← Run this in Supabase SQL editor
├── .env.local.example       ← Copy to .env.local and fill in keys
└── next.config.js
```

---

## Revenue milestones
| Users | Monthly Revenue |
|-------|----------------|
| 20    | $300           |
| 100   | $1,499         |
| 500   | $7,495         |
| 1,000 | $14,990        |
| 5,000 | $74,950        |

**Break-even on Pro plan:** 1 paying user covers ~1 month of API costs.

---

## Questions?
The AI coach system prompt in `/app/api/coach/route.js` is where you customize the coaching logic. The market guide prompt in `/app/api/market-guide/route.js` controls the JSON output structure. Both are plain English — edit them freely.
