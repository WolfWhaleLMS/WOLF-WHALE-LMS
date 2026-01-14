import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch attendance for a course on a specific date
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!['MASTER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');
    const date = searchParams.get('date');

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Verify teacher has access to this course
    if (userRole === 'TEACHER') {
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: session.user.id },
      });
      if (!course) {
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
      }
    }

    // Get enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { courseId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    // Get attendance records for the date if provided
    let attendanceRecords: { studentId: string; status: string }[] = [];
    if (date) {
      const dateStart = new Date(date);
      dateStart.setHours(0, 0, 0, 0);
      const dateEnd = new Date(date);
      dateEnd.setHours(23, 59, 59, 999);

      const records = await prisma.attendance.findMany({
        where: {
          courseId,
          date: {
            gte: dateStart,
            lte: dateEnd,
          },
        },
      });
      attendanceRecords = records.map((r) => ({
        studentId: r.studentId,
        status: r.status,
      }));
    }

    // Format response
    const students = enrollments.map((e) => {
      const record = attendanceRecords.find((r) => r.studentId === e.studentId);
      return {
        id: e.student.id,
        name: `${e.student.firstName} ${e.student.lastName}`,
        avatar: e.student.avatar,
        status: record?.status || null,
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 });
  }
}

// POST - Save attendance records
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    if (!['MASTER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { courseId, date, records } = body as {
      courseId: string;
      date: string;
      records: Array<{ studentId: string; status: string }>;
    };

    if (!courseId || !date || !records) {
      return NextResponse.json(
        { error: 'Course ID, date, and records are required' },
        { status: 400 }
      );
    }

    // Verify teacher has access to this course
    if (userRole === 'TEACHER') {
      const course = await prisma.course.findFirst({
        where: { id: courseId, teacherId: session.user.id },
      });
      if (!course) {
        return NextResponse.json({ error: 'Course not found or access denied' }, { status: 404 });
      }
    }

    const attendanceDate = new Date(date);
    attendanceDate.setHours(12, 0, 0, 0); // Normalize to noon

    // Upsert attendance records
    const operations = records.map((record) =>
      prisma.attendance.upsert({
        where: {
          studentId_courseId_date: {
            studentId: record.studentId,
            courseId,
            date: attendanceDate,
          },
        },
        update: {
          status: record.status.toUpperCase(),
        },
        create: {
          studentId: record.studentId,
          courseId,
          date: attendanceDate,
          status: record.status.toUpperCase(),
        },
      })
    );

    await prisma.$transaction(operations);

    return NextResponse.json({ message: 'Attendance saved successfully' });
  } catch (error) {
    console.error('Error saving attendance:', error);
    return NextResponse.json({ error: 'Failed to save attendance' }, { status: 500 });
  }
}
