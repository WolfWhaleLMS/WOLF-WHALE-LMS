import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch submissions for a student
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const courseId = searchParams.get('courseId');

    // If assignmentId provided, get submission for specific assignment
    if (assignmentId) {
      const submission = await prisma.submission.findFirst({
        where: {
          assignmentId,
          studentId: userId,
        },
        include: {
          grade: true,
          assignment: {
            include: {
              moduleItem: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json({ submission });
    }

    // If courseId provided, get all submissions for that course
    if (courseId) {
      const submissions = await prisma.submission.findMany({
        where: {
          studentId: userId,
          assignment: {
            moduleItem: {
              module: {
                courseId,
              },
            },
          },
        },
        include: {
          grade: true,
          assignment: {
            include: {
              moduleItem: true,
            },
          },
        },
        orderBy: { submittedAt: 'desc' },
      });

      return NextResponse.json({ submissions });
    }

    // Get all submissions for the student
    const submissions = await prisma.submission.findMany({
      where: { studentId: userId },
      include: {
        grade: true,
        assignment: {
          include: {
            moduleItem: {
              include: {
                module: {
                  include: {
                    course: {
                      select: { name: true, code: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}

// POST - Submit an assignment
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can submit assignments' }, { status: 403 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { assignmentId, content, fileUrl } = body as {
      assignmentId: string;
      content?: string;
      fileUrl?: string;
    };

    if (!assignmentId) {
      return NextResponse.json({ error: 'Assignment ID is required' }, { status: 400 });
    }

    if (!content && !fileUrl) {
      return NextResponse.json(
        { error: 'Either content or file URL is required' },
        { status: 400 }
      );
    }

    // Get the assignment with course info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        moduleItem: {
          include: {
            module: {
              include: {
                course: true,
              },
            },
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: userId,
          courseId: assignment.moduleItem.module.courseId,
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'You are not enrolled in this course' },
        { status: 403 }
      );
    }

    // Check for existing submission count
    const existingSubmissions = await prisma.submission.count({
      where: {
        assignmentId,
        studentId: userId,
      },
    });

    if (existingSubmissions >= assignment.allowedAttempts) {
      return NextResponse.json(
        { error: `Maximum attempts (${assignment.allowedAttempts}) reached` },
        { status: 400 }
      );
    }

    // Check if assignment is past due
    const now = new Date();
    const isLate = assignment.dueDate ? now > assignment.dueDate : false;

    // Create the submission
    const submission = await prisma.submission.create({
      data: {
        assignmentId,
        studentId: userId,
        content: content || null,
        fileUrl: fileUrl || null,
        attempt: existingSubmissions + 1,
        isLate,
      },
      include: {
        assignment: {
          include: {
            moduleItem: true,
          },
        },
      },
    });

    // Award XP for submission
    const xpAmount = isLate ? 5 : 10;
    await prisma.user.update({
      where: { id: userId },
      data: {
        xp: { increment: xpAmount },
      },
    });

    return NextResponse.json({
      message: `Assignment submitted successfully! +${xpAmount} XP`,
      submission,
      xpGained: xpAmount,
    });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json({ error: 'Failed to submit assignment' }, { status: 500 });
  }
}
