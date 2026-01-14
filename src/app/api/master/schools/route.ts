import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - List all schools (MASTER only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const schools = await prisma.school.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    return NextResponse.json(schools);
  } catch (error) {
    console.error('Error fetching schools:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Create a new school (MASTER only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'MASTER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      slug,
      domain,
      primaryColor,
      subscriptionTier,
      maxUsers,
      maxCourses,
    } = body;

    // Validate required fields
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug is unique
    const existingSchool = await prisma.school.findUnique({
      where: { slug }
    });

    if (existingSchool) {
      return NextResponse.json(
        { error: 'A school with this slug already exists' },
        { status: 400 }
      );
    }

    // Create the school
    const school = await prisma.school.create({
      data: {
        name,
        slug: slug.toLowerCase(),
        domain: domain || null,
        primaryColor: primaryColor || '#3b82f6',
        subscriptionTier: subscriptionTier || 'FREE',
        maxUsers: parseInt(maxUsers) || 50,
        maxCourses: parseInt(maxCourses) || 10,
        isActive: true,
      }
    });

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
