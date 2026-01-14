import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// GET - Fetch courses based on user role
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // Get user's school
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { schoolId: true },
    });

    // Define the type for courses with included relations
    type CourseWithRelations = {
      id: string;
      name: string;
      code: string;
      description: string | null;
      color: string;
      isPublished: boolean;
      teacherId: string;
      createdAt: Date;
      teacher: {
        id: string;
        firstName: string;
        lastName: string;
      };
      _count: {
        enrollments: number;
        modules: number;
      };
    };

    let courses: CourseWithRelations[] = [];

    if (userRole === 'TEACHER') {
      // Teachers see only their courses
      courses = await prisma.course.findMany({
        where: { teacherId: userId },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'MASTER' || userRole === 'ADMIN') {
      // Admin/Master see all courses in their school (or all for MASTER without school)
      const whereClause = user?.schoolId
        ? {
            teacher: {
              schoolId: user.schoolId,
            },
          }
        : {};

      courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (userRole === 'STUDENT') {
      // Students see courses they're enrolled in
      courses = await prisma.course.findMany({
        where: {
          enrollments: {
            some: {
              studentId: userId,
            },
          },
          isPublished: true,
        },
        include: {
          teacher: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              modules: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });
    } else {
      // PARENT - limited access
      courses = [];
    }

    // Transform data for frontend
    const transformedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      code: course.code,
      description: course.description,
      color: course.color,
      isPublished: course.isPublished,
      teacherId: course.teacherId,
      teacherName: `${course.teacher.firstName} ${course.teacher.lastName}`,
      studentCount: course._count.enrollments,
      moduleCount: course._count.modules,
      createdAt: course.createdAt,
    }));

    return NextResponse.json({ courses: transformedCourses });
  } catch (error) {
    console.error('Error fetching courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// POST - Create a new course
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    // Only MASTER, ADMIN, or TEACHER can create courses
    if (!['MASTER', 'ADMIN', 'TEACHER'].includes(userRole)) {
      return NextResponse.json(
        { error: 'You do not have permission to create courses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, code, description, color, teacherId } = body;

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Course name and code are required' },
        { status: 400 }
      );
    }

    // Validate code format (alphanumeric with optional dash)
    const codeRegex = /^[A-Z0-9-]+$/i;
    if (!codeRegex.test(code)) {
      return NextResponse.json(
        { error: 'Course code must be alphanumeric (e.g., WEB101, CS-201)' },
        { status: 400 }
      );
    }

    // Check if course code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCourse) {
      return NextResponse.json(
        { error: 'A course with this code already exists' },
        { status: 400 }
      );
    }

    // Determine the teacher ID
    let assignedTeacherId = userId;

    if (userRole === 'MASTER' || userRole === 'ADMIN') {
      // Admin/Master must assign to a specific teacher
      if (!teacherId) {
        return NextResponse.json(
          { error: 'Please specify a teacher for this course' },
          { status: 400 }
        );
      }

      // Verify the teacher exists and is a TEACHER
      const teacher = await prisma.user.findUnique({
        where: { id: teacherId },
        select: { role: true, schoolId: true },
      });

      if (!teacher || teacher.role !== 'TEACHER') {
        return NextResponse.json(
          { error: 'Invalid teacher specified' },
          { status: 400 }
        );
      }

      assignedTeacherId = teacherId;
    }

    // Create the course
    const course = await prisma.course.create({
      data: {
        name,
        code: code.toUpperCase(),
        description: description || null,
        color: color || '#00d4aa',
        teacherId: assignedTeacherId,
        isPublished: false, // Courses start as drafts
      },
      include: {
        teacher: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Course created successfully',
        course: {
          id: course.id,
          name: course.name,
          code: course.code,
          description: course.description,
          color: course.color,
          isPublished: course.isPublished,
          teacherId: course.teacherId,
          teacherName: `${course.teacher.firstName} ${course.teacher.lastName}`,
          studentCount: 0,
          moduleCount: 0,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating course:', error);
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 });
  }
}

// PATCH - Update a course (publish/unpublish, edit details)
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    const body = await request.json();
    const { courseId, name, description, color, isPublished } = body;

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check permissions
    const canEdit =
      userRole === 'MASTER' ||
      userRole === 'ADMIN' ||
      (userRole === 'TEACHER' && course.teacherId === userId);

    if (!canEdit) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this course' },
        { status: 403 }
      );
    }

    // Build update data
    const updateData: {
      name?: string;
      description?: string | null;
      color?: string;
      isPublished?: boolean;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color !== undefined) updateData.color = color;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
      include: {
        teacher: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Course updated successfully',
      course: {
        id: updatedCourse.id,
        name: updatedCourse.name,
        code: updatedCourse.code,
        description: updatedCourse.description,
        color: updatedCourse.color,
        isPublished: updatedCourse.isPublished,
        teacherName: `${updatedCourse.teacher.firstName} ${updatedCourse.teacher.lastName}`,
        studentCount: updatedCourse._count.enrollments,
        moduleCount: updatedCourse._count.modules,
      },
    });
  } catch (error) {
    console.error('Error updating course:', error);
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 });
  }
}

// DELETE - Delete a course
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userRole = session.user.role;
    const userId = session.user.id;

    const { courseId } = await request.json();

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 });
    }

    // Get the course
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    // Check permissions - only MASTER, ADMIN, or the course teacher can delete
    const canDelete =
      userRole === 'MASTER' ||
      userRole === 'ADMIN' ||
      (userRole === 'TEACHER' && course.teacherId === userId);

    if (!canDelete) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this course' },
        { status: 403 }
      );
    }

    await prisma.course.delete({
      where: { id: courseId },
    });

    return NextResponse.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    return NextResponse.json({ error: 'Failed to delete course' }, { status: 500 });
  }
}
