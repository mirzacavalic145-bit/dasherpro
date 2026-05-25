import Stripe from 'stripe'

// Lazy singleton — only created at runtime, not at build time
let _stripe = null

export function getStripe() {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    })
  }
  return _stripe
}

export const PLANS = {
  hustler: {
    name: 'Hustler',
    price: 7.99,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_HUSTLER,
    features: [
      'Zone map & peak time guide',
      'Earnings calculator',
      'Order grader',
      'Weekly schedule builder',
      '10 AI coach queries/month',
      'Your city market guide',
    ],
  },
  pro: {
    name: 'Pro Dasher',
    price: 14.99,
    interval: 'month',
    priceId: process.env.STRIPE_PRICE_PRO,
    popular: true,
    features: [
      'Everything in Hustler',
      'Unlimited AI coach queries',
      'Tax dashboard & mileage log',
      'All cities nationwide',
      'Earnings trend tracking',
      'Priority support',
    ],
  },
  annual: {
    name: 'Pro Annual',
    price: 99,
    interval: 'year',
    priceId: process.env.STRIPE_PRICE_ANNUAL,
    features: [
      'Everything in Pro Dasher',
      'Founding member price locked',
      'Early access to new features',
      'Founding member badge',
      'Direct feedback line to founder',
    ],
  },
}
