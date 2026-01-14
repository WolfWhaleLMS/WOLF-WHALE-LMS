import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// Disable body parsing for webhooks - we need the raw body for signature verification
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  if (!stripe) {
    console.error('Stripe is not configured');
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature) {
    console.error('Missing stripe-signature header');
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  if (!webhookSecret) {
    console.error('Missing STRIPE_WEBHOOK_SECRET');
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook signature verification failed: ${errorMessage}`);
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${errorMessage}` },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      }

      case 'customer.subscription.updated': {
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Error processing webhook' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const schoolId = session.metadata?.schoolId;
  const quantityStr = session.metadata?.quantity;
  const isNewSignup = session.metadata?.isNewSignup === 'true';

  // Parse quantity from metadata
  const quantity = quantityStr ? parseInt(quantityStr, 10) : 1;

  const customerId = typeof session.customer === 'string'
    ? session.customer
    : session.customer?.id;
  const subscriptionId = typeof session.subscription === 'string'
    ? session.subscription
    : session.subscription?.id;

  // For new signups, the school will be created during registration
  // Just log the event - the session_id will be used to verify payment
  if (isNewSignup && !schoolId) {
    console.log(`New signup checkout completed. Session: ${session.id}, Quantity: ${quantity}`);
    return;
  }

  // For existing schools, update the subscription
  if (!schoolId) {
    console.error('No schoolId in session metadata for non-signup checkout');
    return;
  }

  console.log(`Checkout completed for school ${schoolId}, quantity ${quantity}`);

  await prisma.school.update({
    where: { id: schoolId },
    data: {
      stripeCustomerId: customerId || null,
      stripeSubscriptionId: subscriptionId || null,
      subscriptionTier: 'PAID',
      maxUsers: quantity,
      maxCourses: 999999, // Unlimited courses for paid plans
    },
  });

  console.log(`School ${schoolId} updated to PAID with ${quantity} users`);
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const schoolId = subscription.metadata?.schoolId;

  // Get quantity from subscription items
  const quantity = subscription.items.data[0]?.quantity || 1;

  let targetSchoolId: string | undefined = schoolId;

  if (!targetSchoolId) {
    // Try to find school by customer ID
    const customerId = typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer?.id;

    if (customerId) {
      const school = await prisma.school.findFirst({
        where: { stripeCustomerId: customerId },
      });
      targetSchoolId = school?.id;
    }
  }

  if (!targetSchoolId) {
    console.error('No schoolId in subscription metadata and could not find by customer ID');
    return;
  }

  const subscriptionStatus = subscription.status;

  // Only update if subscription is active or trialing
  if (subscriptionStatus === 'active' || subscriptionStatus === 'trialing') {
    await prisma.school.update({
      where: { id: targetSchoolId },
      data: {
        subscriptionTier: 'PAID',
        maxUsers: quantity,
        maxCourses: 999999,
      },
    });
    console.log(`School ${targetSchoolId} subscription updated to ${quantity} users`);
  } else if (subscriptionStatus === 'canceled' || subscriptionStatus === 'unpaid' || subscriptionStatus === 'past_due') {
    console.log(`School ${targetSchoolId} subscription status: ${subscriptionStatus}`);
    // Optionally restrict access for unpaid subscriptions
    if (subscriptionStatus === 'canceled') {
      await prisma.school.update({
        where: { id: targetSchoolId },
        data: {
          subscriptionTier: 'CANCELED',
          maxUsers: 0,
        },
      });
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const schoolId = subscription.metadata?.schoolId;
  const customerId = typeof subscription.customer === 'string'
    ? subscription.customer
    : subscription.customer?.id;

  let targetSchoolId: string | undefined = schoolId;

  if (!targetSchoolId && customerId) {
    const school = await prisma.school.findFirst({
      where: { stripeCustomerId: customerId },
    });
    targetSchoolId = school?.id;
  }

  if (!targetSchoolId) {
    console.error('Could not find school for deleted subscription');
    return;
  }

  // Set to canceled state - no users allowed
  await prisma.school.update({
    where: { id: targetSchoolId },
    data: {
      subscriptionTier: 'CANCELED',
      stripeSubscriptionId: null,
      maxUsers: 0,
      maxCourses: 0,
    },
  });

  console.log(`School ${targetSchoolId} subscription canceled - access restricted`);
}
