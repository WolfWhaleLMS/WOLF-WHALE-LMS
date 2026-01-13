import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Role hierarchy: MASTER > ADMIN > TEACHER/STUDENT/PARENT
const ROLE_HIERARCHY: Record<string, string[]> = {
  MASTER: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  ADMIN: ['TEACHER', 'STUDENT', 'PARENT'],
  TEACHER: [],
  STUDENT: [],
  PARENT: [],
};

// GET - List all users (for MASTER and ADMIN)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = session.user.role;
    if (currentUserRole !== 'MASTER' && currentUserRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        createdById: true,
        xp: true,
        level: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = session.user.role;
    const allowedRoles = ROLE_HIERARCHY[currentUserRole] || [];

    if (allowedRoles.length === 0) {
      return NextResponse.json(
        { error: 'You do not have permission to create users' },
        { status: 403 }
      );
    }

    const { firstName, lastName, email, password, role } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Validate role hierarchy
    if (!allowedRoles.includes(role)) {
      return NextResponse.json(
        { error: `You can only create users with roles: ${allowedRoles.join(', ')}` },
        { status: 403 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role,
        createdById: session.user.id,
        xp: role === 'STUDENT' ? 0 : undefined,
        level: role === 'STUDENT' ? 1 : undefined,
        streak: role === 'STUDENT' ? 0 : undefined,
      },
    });

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}

// DELETE - Delete a user
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserRole = session.user.role;
    if (currentUserRole !== 'MASTER' && currentUserRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent deleting yourself
    if (userId === session.user.id) {
      return NextResponse.json({ error: 'You cannot delete your own account' }, { status: 400 });
    }

    // Get the user to be deleted
    const userToDelete = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToDelete) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // ADMIN cannot delete MASTER or other ADMINs
    if (currentUserRole === 'ADMIN' && (userToDelete.role === 'MASTER' || userToDelete.role === 'ADMIN')) {
      return NextResponse.json(
        { error: 'You cannot delete MASTER or ADMIN accounts' },
        { status: 403 }
      );
    }

    // MASTER cannot delete other MASTER accounts
    if (currentUserRole === 'MASTER' && userToDelete.role === 'MASTER') {
      return NextResponse.json(
        { error: 'You cannot delete another MASTER account' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
