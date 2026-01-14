import Stripe from 'stripe';

// Server-side Stripe instance - only initialize if key is present
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Subscription tiers and their Stripe price IDs
// These should be configured in your Stripe dashboard
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    priceId: null, // No payment required
    maxUsers: 50,
    maxCourses: 10,
    features: [
      'Up to 50 users',
      'Up to 10 courses',
      'Basic analytics',
      'Email support',
    ],
  },
  STARTER: {
    name: 'Starter',
    priceId: process.env.STRIPE_STARTER_PRICE_ID || 'price_starter',
    maxUsers: 200,
    maxCourses: 50,
    monthlyPrice: 49,
    features: [
      'Up to 200 users',
      'Up to 50 courses',
      'Advanced analytics',
      'Priority support',
      'Custom branding',
    ],
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
    maxUsers: 1000,
    maxCourses: -1, // Unlimited
    monthlyPrice: 149,
    features: [
      'Up to 1,000 users',
      'Unlimited courses',
      'Advanced analytics & reports',
      '24/7 priority support',
      'Custom branding',
      'API access',
      'SSO integration',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
    maxUsers: -1, // Unlimited
    maxCourses: -1, // Unlimited
    monthlyPrice: 499,
    features: [
      'Unlimited users',
      'Unlimited courses',
      'Full analytics suite',
      'Dedicated support manager',
      'Custom branding',
      'Full API access',
      'SSO integration',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
} as const;

export type SubscriptionTier = keyof typeof SUBSCRIPTION_TIERS;

// Helper to get tier from price ID
export function getTierFromPriceId(priceId: string): SubscriptionTier | null {
  for (const [tier, config] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (config.priceId === priceId) {
      return tier as SubscriptionTier;
    }
  }
  return null;
}

// Create checkout session for subscription
export async function createCheckoutSession({
  schoolId,
  tier,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  schoolId: string;
  tier: SubscriptionTier;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  const tierConfig = SUBSCRIPTION_TIERS[tier];

  if (!tierConfig.priceId) {
    throw new Error('Cannot create checkout for free tier');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: tierConfig.priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      schoolId,
      tier,
    },
    subscription_data: {
      metadata: {
        schoolId,
        tier,
      },
    },
  });

  return session;
}

// Create customer portal session
export async function createPortalSession({
  customerId,
  returnUrl,
}: {
  customerId: string;
  returnUrl: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return session;
}
