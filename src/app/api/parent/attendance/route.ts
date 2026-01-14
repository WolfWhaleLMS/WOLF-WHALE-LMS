import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch attendance for a parent's child
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

    // Fetch attendance records for the child
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId: childId,
      },
      orderBy: {
        date: 'desc',
      },
      take: 50, // Last 50 records
    });

    // Get the courses for context
    const enrollments = await prisma.enrollment.findMany({
      where: { studentId: childId },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    const courseMap = new Map(
      enrollments.map((e) => [e.courseId, { name: e.course.name, code: e.course.code }])
    );

    const attendance = attendanceRecords.map((record) => {
      const course = courseMap.get(record.courseId);
      return {
        id: record.id,
        date: record.date.toISOString().split('T')[0],
        courseName: course?.name || 'Unknown Course',
        courseCode: course?.code || 'N/A',
        status: record.status.toLowerCase() as 'present' | 'absent' | 'late' | 'excused',
        notes: record.notes,
      };
    });

    return NextResponse.json({ attendance });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}
