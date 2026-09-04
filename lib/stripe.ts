import Stripe from 'stripe'

let stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('Stripe is not configured.')
  }
  if (!stripe) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  }
  return stripe
}
