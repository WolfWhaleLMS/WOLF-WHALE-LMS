import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch dashboard data for a parent's child
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
      include: {
        child: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    if (!parentChild) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const child = parentChild.child;

    // Get enrollments for calculating overall grade
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: childId },
      select: {
        currentGrade: true,
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    // Calculate overall grade from enrollments
    const gradesWithValues = enrollments.filter((e) => e.currentGrade !== null);
    const overallGrade =
      gradesWithValues.length > 0
        ? Math.round(
            gradesWithValues.reduce((acc, e) => acc + (e.currentGrade || 0), 0) /
              gradesWithValues.length
          )
        : 0;

    // Get attendance rate (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: childId,
        date: { gte: thirtyDaysAgo },
      },
    });

    const totalAttendance = attendanceRecords.length;
    const presentCount = attendanceRecords.filter(
      (a) => a.status === 'PRESENT' || a.status === 'LATE' || a.status === 'EXCUSED'
    ).length;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 100;

    // Get recent graded submissions
    const recentGrades = await prisma.submission.findMany({
      where: {
        studentId: childId,
        grade: { isNot: null },
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
                      select: { code: true },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        grade: { gradedAt: 'desc' },
      },
      take: 5,
    });

    // Get upcoming assignments
    const now = new Date();
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        dueDate: { gte: now },
        moduleItem: {
          module: {
            course: {
              enrollments: {
                some: { studentId: childId },
              },
            },
          },
        },
      },
      include: {
        moduleItem: {
          include: {
            module: {
              include: {
                course: {
                  select: { code: true },
                },
              },
            },
          },
        },
      },
      orderBy: { dueDate: 'asc' },
      take: 5,
    });

    const dashboardData = {
      id: child.id,
      name: `${child.firstName} ${child.lastName}`,
      grade: overallGrade,
      attendance: attendanceRate,
      xp: child.xp,
      level: child.level,
      recentGrades: recentGrades
        .filter((s) => s.grade)
        .map((s) => ({
          assignment: s.assignment.moduleItem.title,
          grade: s.grade!.score,
          maxGrade: s.assignment.pointsPossible,
          course: s.assignment.moduleItem.module.course.code,
        })),
      upcomingAssignments: upcomingAssignments.map((a) => ({
        title: a.moduleItem.title,
        dueDate: a.dueDate?.toISOString().split('T')[0] || '',
        course: a.moduleItem.module.course.code,
      })),
    };

    return NextResponse.json({ dashboard: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
