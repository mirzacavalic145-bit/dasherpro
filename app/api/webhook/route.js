// POST /api/webhook
// Handles Stripe webhook events — links subscriptions to Supabase users

export const dynamic = 'force-dynamic'

import { getStripe } from '../../../lib/stripe'
import { getSupabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  const supabaseAdmin = getSupabaseAdmin()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { planKey, userId } = session.metadata

        if (userId) {
          const customerEmail =
            session.customer_email || session.customer_details?.email || null

          // Link Stripe customer to user profile
          await supabaseAdmin.from('profiles').upsert(
            {
              id: userId,
              email: customerEmail,
              stripe_customer_id: session.customer,
            },
            { onConflict: 'id' }
          )

          // Create subscription record linked to user
          await supabaseAdmin.from('subscriptions').upsert(
            {
              stripe_customer_id: session.customer,
              stripe_subscription_id: session.subscription,
              plan: planKey,
              status: 'trialing',
              user_id: userId,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'stripe_subscription_id' }
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: sub.status, updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('stripe_subscription_id', sub.id)
        break
      }
    }

    return Response.json({ received: true })
  } catch (err) {
    console.error('Webhook handler error:', err)
    return new Response('Webhook error', { status: 500 })
  }
}
