// POST /api/create-checkout
// Creates a Stripe Checkout session — requires authenticated user
// Accepts Bearer token in Authorization header (more reliable than cookies)

export const dynamic = 'force-dynamic'

import { getStripe, PLANS } from '../../../lib/stripe'
import { getSupabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  try {
    const { planKey } = await req.json()
    const ALLOWED_PLANS = ['hustler', 'pro', 'annual']
    if (!planKey || !ALLOWED_PLANS.includes(planKey)) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Verify user via Bearer token passed from client
    const authHeader = req.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const { data: { user }, error: userError } = await admin.auth.getUser(token)

    if (userError || !user) {
      return Response.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const plan = PLANS[planKey]

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

    const session = await getStripe().checkout.sessions.create(sessionParams)
    return Response.json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
