import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only ADMIN users can access this
    if (session.user.role !== 'ADMIN' && session.user.role !== 'MASTER') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Get the user's school
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { schoolId: true },
    });

    if (!user?.schoolId) {
      return NextResponse.json(
        { error: 'No school associated with this user' },
        { status: 404 }
      );
    }

    // Get the school with user count
    const school = await prisma.school.findUnique({
      where: { id: user.schoolId },
      select: {
        id: true,
        name: true,
        slug: true,
        logoUrl: true,
        subscriptionTier: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        maxUsers: true,
        maxCourses: true,
        isActive: true,
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json(
      { error: 'Failed to fetch school data' },
      { status: 500 }
    );
  }
}
