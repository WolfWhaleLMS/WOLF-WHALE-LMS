import { NextRequest, NextResponse } from 'next/server';
import { createPublicCheckoutSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { quantity, email } = body as { quantity: number; email?: string };

    // Validate quantity
    if (!quantity || quantity < 1 || quantity > 10000) {
      return NextResponse.json(
        { error: 'Quantity must be between 1 and 10,000 users' },
        { status: 400 }
      );
    }

    // Get the origin from request headers
    const origin = request.headers.get('origin') || 'https://wolfwhale.ca';

    // Create checkout session for new signup
    const checkoutSession = await createPublicCheckoutSession({
      quantity,
      successUrl: `${origin}/register?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${origin}/?canceled=true`,
      customerEmail: email,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating public checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
