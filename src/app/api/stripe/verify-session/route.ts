import { NextRequest, NextResponse } from 'next/server';
import { getCheckoutSession } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const session = await getCheckoutSession(sessionId);

    // Return relevant session data
    return NextResponse.json({
      id: session.id,
      status: session.status,
      customer_email: session.customer_email,
      metadata: session.metadata,
      customer: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      subscription: typeof session.subscription === 'string' ? session.subscription : (session.subscription as { id: string } | null)?.id,
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    return NextResponse.json(
      { error: 'Failed to verify session' },
      { status: 500 }
    );
  }
}
