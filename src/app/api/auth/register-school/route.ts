import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { getCheckoutSession, stripe } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, schoolName, email, password, firstName, lastName } = body;

    // Validate required fields
    if (!sessionId || !schoolName || !email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Verify the Stripe session
    const session = await getCheckoutSession(sessionId);

    if (session.status !== 'complete') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      );
    }

    // Check if this session has already been used
    const existingSchoolWithSession = await prisma.school.findFirst({
      where: {
        stripeSubscriptionId: typeof session.subscription === 'string'
          ? session.subscription
          : (session.subscription as { id: string } | null)?.id,
      },
    });

    if (existingSchoolWithSession) {
      return NextResponse.json(
        { error: 'This payment has already been used to create a school' },
        { status: 400 }
      );
    }

    // Get quantity from session metadata
    const quantity = session.metadata?.quantity ? parseInt(session.metadata.quantity, 10) : 1;
    const customerId = typeof session.customer === 'string'
      ? session.customer
      : session.customer?.id;
    const subscriptionId = typeof session.subscription === 'string'
      ? session.subscription
      : (session.subscription as { id: string } | null)?.id;

    // Generate a URL-friendly slug from school name
    const baseSlug = schoolName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists and make it unique if needed
    let slug = baseSlug;
    let slugCounter = 1;
    while (await prisma.school.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${slugCounter}`;
      slugCounter++;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create school and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the school
      const school = await tx.school.create({
        data: {
          name: schoolName,
          slug,
          subscriptionTier: 'PAID',
          stripeCustomerId: customerId || null,
          stripeSubscriptionId: subscriptionId || null,
          maxUsers: quantity,
          maxCourses: 999999, // Unlimited courses
          isActive: true,
        },
      });

      // Create the MASTER user (school owner/admin)
      const user = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          role: 'MASTER',
          schoolId: school.id,
        },
      });

      return { school, user };
    });

    // Update Stripe subscription metadata with schoolId
    if (stripe && subscriptionId) {
      try {
        await stripe.subscriptions.update(subscriptionId, {
          metadata: {
            schoolId: result.school.id,
            quantity: quantity.toString(),
          },
        });
      } catch (stripeError) {
        console.error('Failed to update Stripe subscription metadata:', stripeError);
        // Don't fail the registration if this fails
      }
    }

    return NextResponse.json({
      success: true,
      schoolId: result.school.id,
      userId: result.user.id,
    });
  } catch (error) {
    console.error('Error registering school:', error);
    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    );
  }
}
