import Stripe from 'stripe';

// Server-side Stripe instance - only initialize if key is present
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2025-12-15.clover',
      typescript: true,
    })
  : null;

// Usage-based pricing: $7 CAD per user per month
export const PRICE_PER_USER_CAD = 7;
export const PER_USER_PRICE_ID = process.env.STRIPE_PER_USER_PRICE_ID || 'price_per_user';

// Create checkout session for per-user subscription
export async function createCheckoutSession({
  schoolId,
  quantity,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  schoolId?: string;
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  if (quantity < 1 || quantity > 10000) {
    throw new Error('Quantity must be between 1 and 10,000 users');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PER_USER_PRICE_ID,
        quantity: quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      schoolId: schoolId || '',
      quantity: quantity.toString(),
    },
    subscription_data: {
      metadata: {
        schoolId: schoolId || '',
        quantity: quantity.toString(),
      },
    },
  });

  return session;
}

// Create checkout session for public signup (no existing school)
export async function createPublicCheckoutSession({
  quantity,
  successUrl,
  cancelUrl,
  customerEmail,
}: {
  quantity: number;
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
}) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  if (quantity < 1 || quantity > 10000) {
    throw new Error('Quantity must be between 1 and 10,000 users');
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: PER_USER_PRICE_ID,
        quantity: quantity,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: customerEmail,
    metadata: {
      quantity: quantity.toString(),
      isNewSignup: 'true',
    },
    subscription_data: {
      metadata: {
        quantity: quantity.toString(),
        isNewSignup: 'true',
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

// Retrieve checkout session (for verifying payment after redirect)
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY.');
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['subscription', 'customer'],
  });

  return session;
}
