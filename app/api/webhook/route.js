// POST /api/webhook
// Handles Stripe webhook events to update user subscription status in Supabase
// Set up at: https://dashboard.stripe.com/webhooks
// Events to listen for: checkout.session.completed, customer.subscription.deleted

import { stripe } from '../../../lib/stripe'
import { supabaseAdmin } from '../../../lib/supabase'

export async function POST(req) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
    return new Response('Invalid signature', { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const { planKey } = session.metadata

        // Update or create user subscription record
        await supabaseAdmin.from('subscriptions').upsert({
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          plan: planKey,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
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

      case 'customer.subscription.updated': {
        const sub = event.data.object
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: sub.status, updated_at: new Date().toISOString() })
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
