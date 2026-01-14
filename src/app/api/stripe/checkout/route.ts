import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createCheckoutSession, SUBSCRIPTION_TIERS, SubscriptionTier } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schoolId, tier } = body as { schoolId: string; tier: SubscriptionTier };

    // Validate tier
    if (!tier || !SUBSCRIPTION_TIERS[tier]) {
      return NextResponse.json(
        { error: 'Invalid subscription tier' },
        { status: 400 }
      );
    }

    // Check if it's a paid tier
    if (tier === 'FREE') {
      return NextResponse.json(
        { error: 'Cannot checkout for free tier' },
        { status: 400 }
      );
    }

    // Get the school
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Verify user has permission (MASTER or ADMIN of this school)
    if (session.user.role !== 'MASTER') {
      // Get user's school from database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolId: true }
      });
      const isAdmin = session.user.role === 'ADMIN' && user?.schoolId === schoolId;
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'You do not have permission to manage this school\'s subscription' },
          { status: 403 }
        );
      }
    }

    // Get the origin from request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe checkout session
    const checkoutSession = await createCheckoutSession({
      schoolId,
      tier,
      successUrl: `${origin}/master/schools/${schoolId}?success=true`,
      cancelUrl: `${origin}/master/schools/${schoolId}?canceled=true`,
      customerEmail: session.user.email || undefined,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
