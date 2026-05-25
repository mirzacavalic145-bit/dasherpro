// POST /api/create-checkout
// Creates a Stripe Checkout session for subscription plans

export const dynamic = 'force-dynamic'

import { getStripe, PLANS } from '../../../lib/stripe'

export async function POST(req) {
  try {
    const { planKey } = await req.json()
    const plan = PLANS[planKey]

    if (!plan) {
      return Response.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const session = await getStripe().checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: plan.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?subscribed=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/#pricing`,
      allow_promotion_codes: true,
      subscription_data: planKey === 'pro' ? { trial_period_days: 7 } : undefined,
      metadata: { planKey },
    })

    return Response.json({ url: session.url })

  } catch (err) {
    console.error('Checkout error:', err)
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
