import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { createPortalSession } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { schoolId } = body as { schoolId: string };

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
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
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { schoolId: true },
      });
      const isAdmin = session.user.role === 'ADMIN' && user?.schoolId === schoolId;
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'You do not have permission to manage this school\'s subscription' },
          { status: 403 }
        );
      }
    }

    // Check if the school has a Stripe customer ID
    if (!school.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No subscription found. Please subscribe to a plan first.' },
        { status: 400 }
      );
    }

    // Get the origin from request headers
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const returnUrl = session.user.role === 'MASTER'
      ? `${origin}/master/schools/${schoolId}`
      : `${origin}/admin/subscription`;

    // Create Stripe portal session
    const portalSession = await createPortalSession({
      customerId: school.stripeCustomerId,
      returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
