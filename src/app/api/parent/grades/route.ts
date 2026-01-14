import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch grades for a parent's child
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Only parents can access this' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const childId = searchParams.get('childId');

    if (!childId) {
      return NextResponse.json({ error: 'Child ID is required' }, { status: 400 });
    }

    // Verify the child belongs to this parent
    const parentChild = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: session.user.id,
          childId,
        },
      },
    });

    if (!parentChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    // Fetch graded submissions for the child
    const submissions = await prisma.submission.findMany({
      where: {
        studentId: childId,
        grade: {
          isNot: null,
        },
      },
      include: {
        grade: true,
        assignment: {
          include: {
            moduleItem: {
              include: {
                module: {
                  include: {
                    course: {
                      select: {
                        name: true,
                        code: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        grade: {
          gradedAt: 'desc',
        },
      },
    });

    const grades = submissions
      .filter((s) => s.grade)
      .map((s) => ({
        id: s.id,
        assignmentTitle: s.assignment.moduleItem.title,
        courseName: s.assignment.moduleItem.module.course.name,
        courseCode: s.assignment.moduleItem.module.course.code,
        score: s.grade!.score,
        maxScore: s.assignment.pointsPossible,
        submittedAt: s.submittedAt.toISOString(),
        gradedAt: s.grade!.gradedAt.toISOString(),
        feedback: s.grade!.feedback,
      }));

    return NextResponse.json({ grades });
  } catch (error) {
    console.error('Error fetching grades:', error);
    return NextResponse.json({ error: 'Failed to fetch grades' }, { status: 500 });
  }
}
