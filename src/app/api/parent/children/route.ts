import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch parent's children
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Only parents can access this' }, { status: 403 });
    }

    const parentChildren = await prisma.parentChild.findMany({
      where: { parentId: session.user.id },
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    const children = parentChildren.map((pc) => ({
      id: pc.child.id,
      name: `${pc.child.firstName} ${pc.child.lastName}`,
      avatar: pc.child.avatar,
      xp: pc.child.xp,
      level: pc.child.level,
    }));

    return NextResponse.json({ children });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json({ error: 'Failed to fetch children' }, { status: 500 });
  }
}
