// GET /api/start-checkout?plan=pro
// Server-side redirect to Stripe — called via window.location so cookies are fully set

export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { getStripe, PLANS } from '../../../lib/stripe'
import { createSupabaseServerClient } from '../../../lib/supabase-server'
import { getSupabaseAdmin } from '../../../lib/supabase'

export async function GET(req) {
  const { searchParams } = new URL(req.url)
  const planKey = searchParams.get('plan')

  const ALLOWED_PLANS = ['hustler', 'pro', 'annual']
  if (!planKey || !ALLOWED_PLANS.includes(planKey)) {
    return NextResponse.redirect(new URL('/#pricing', req.url))
  }

  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL(`/login?plan=${planKey}`, req.url))
  }

  const plan = PLANS[planKey]
  const admin = getSupabaseAdmin()

  const { data: profile } = await admin
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single()

  const sessionParams = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
    allow_promotion_codes: true,
    subscription_data: { trial_period_days: 3 },
    metadata: { planKey, userId: user.id },
  }

  if (profile?.stripe_customer_id) {
    sessionParams.customer = profile.stripe_customer_id
  } else {
    sessionParams.customer_email = user.email
  }

  try {
    const session = await getStripe().checkout.sessions.create(sessionParams)
    return NextResponse.redirect(session.url)
  } catch (err) {
    console.error('Checkout error:', err)
    return NextResponse.redirect(new URL('/#pricing', req.url))
  }
}
