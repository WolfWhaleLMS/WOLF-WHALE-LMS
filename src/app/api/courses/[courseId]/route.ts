import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch course details with modules and assignments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId } = await params;
    const userId = session.user.id;
    const userRole = session.user.role;

    // Get the course with all related data
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
        modules: {
          where: { isPublished: true },
          orderBy: { position: 'asc' },
          include: {
            items: {
              where: { isPublished: true },
              orderBy: { position: 'asc' },
              include: {
                assignment: true,
              },
            },
          },
        },
        announcements: {
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
          take: 10,
          include: {
            author: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            enrollments: true,
          },
        },
      },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check access
    const hasAccess =
      userRole === 'MASTER' ||
      userRole === 'ADMIN' ||
      course.teacherId === userId ||
      (userRole === 'STUDENT' &&
        (await prisma.enrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: userId,
              courseId,
            },
          },
        })));

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // For students, get their submissions and calculate progress
    let studentProgress = null;
    let submissions: Array<{ assignmentId: string; submittedAt: Date; grade: { score: number } | null }> = [];

    if (userRole === 'STUDENT') {
      // Get student's submissions for this course
      submissions = await prisma.submission.findMany({
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
        select: {
          assignmentId: true,
          submittedAt: true,
          grade: {
            select: {
              score: true,
            },
          },
        },
      });

      // Calculate progress
      const totalItems = course.modules.reduce((acc, m) => acc + m.items.length, 0);
      const completedItems = submissions.length;
      studentProgress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
    }

    // Format the response
    const formattedCourse = {
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      color: course.color,
      isPublished: course.isPublished,
      teacher: `${course.teacher.firstName} ${course.teacher.lastName}`,
      teacherId: course.teacherId,
      studentCount: course._count.enrollments,
      progress: studentProgress,
      modules: course.modules.map((module) => ({
        id: module.id,
        name: module.name,
        description: module.description,
        position: module.position,
        items: module.items.map((item) => {
          const submission = submissions.find(
            (s) => s.assignmentId === item.assignment?.id
          );
          return {
            id: item.id,
            title: item.title,
            type: item.type,
            content: item.content,
            fileUrl: item.fileUrl,
            linkUrl: item.linkUrl,
            position: item.position,
            assignment: item.assignment
              ? {
                  id: item.assignment.id,
                  pointsPossible: item.assignment.pointsPossible,
                  dueDate: item.assignment.dueDate,
                  instructions: item.assignment.instructions,
                  submissionTypes: item.assignment.submissionTypes,
                }
              : null,
            isCompleted: !!submission,
            grade: submission?.grade?.score || null,
          };
        }),
      })),
      announcements: course.announcements.map((a) => ({
        id: a.id,
        title: a.title,
        content: a.content,
        isPinned: a.isPinned,
        createdAt: a.createdAt,
        author: `${a.author.firstName} ${a.author.lastName}`,
      })),
    };

    return NextResponse.json({ course: formattedCourse });
  } catch (error) {
    console.error('Error fetching course:', error);
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 });
  }
}
