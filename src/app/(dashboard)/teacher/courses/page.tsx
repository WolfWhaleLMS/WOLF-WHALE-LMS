'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  studentCount: number;
  moduleCount: number;
  isPublished: boolean;
}

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '', color: '#00d4aa' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session) {
      // Mock courses data for teacher
      setCourses([
        {
          id: '1',
          name: 'Introduction to Web Development',
          code: 'WEB101',
          description: 'Learn HTML, CSS, and JavaScript to build modern websites.',
          color: '#00d4aa',
          studentCount: 35,
          moduleCount: 8,
          isPublished: true,
        },
        {
          id: '2',
          name: 'Advanced JavaScript',
          code: 'WEB301',
          description: 'Deep dive into modern JavaScript, ES6+, and frameworks.',
          color: '#4facfe',
          studentCount: 28,
          moduleCount: 10,
          isPublished: true,
        },
        {
          id: '3',
          name: 'User Experience Design',
          code: 'UX301',
          description: 'Design intuitive and user-friendly digital experiences.',
          color: '#43e97b',
          studentCount: 22,
          moduleCount: 6,
          isPublished: true,
        },
        {
          id: '4',
          name: 'React Fundamentals',
          code: 'WEB401',
          description: 'Build modern web applications with React.',
          color: '#ffd700',
          studentCount: 0,
          moduleCount: 0,
          isPublished: false,
        },
      ]);
    }
  }, [session]);

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.code) {
      alert('Please fill in the course name and code');
      return;
    }

    const course: Course = {
      id: String(courses.length + 1),
      name: newCourse.name,
      code: newCourse.code,
      description: newCourse.description,
      color: newCourse.color,
      studentCount: 0,
      moduleCount: 0,
      isPublished: false,
    };

    setCourses([...courses, course]);
    setShowCreateModal(false);
    setNewCourse({ name: '', code: '', description: '', color: '#00d4aa' });
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  const publishedCourses = courses.filter(c => c.isPublished);
  const draftCourses = courses.filter(c => !c.isPublished);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Courses</h1>
          <p className="text-gray-600">Manage and create courses for your students</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{courses.length}</div>
          <div className="stat-card-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{publishedCourses.length}</div>
          <div className="stat-card-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{draftCourses.length}</div>
          <div className="stat-card-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">
            {courses.reduce((acc, c) => acc + c.studentCount, 0)}
          </div>
          <div className="stat-card-label">Total Students</div>
        </div>
      </div>

      {/* Published Courses */}
      {publishedCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Published Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {publishedCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div
                  className="course-card-image"
                  style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-graded">Published</span>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="text-white font-bold text-lg">{course.code}</span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      {course.studentCount} students
                    </span>
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                      {course.moduleCount} modules
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`} className="btn-3d btn-primary btn-sm flex-1 text-center">
                      View Course
                    </Link>
                    <button className="btn-3d btn-ghost btn-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Draft Courses */}
      {draftCourses.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Draft Courses</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {draftCourses.map((course) => (
              <div key={course.id} className="course-card opacity-75">
                <div
                  className="course-card-image"
                  style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
                >
                  <div className="absolute top-3 right-3">
                    <span className="badge badge-pending">Draft</span>
                  </div>
                  <div className="absolute bottom-3 left-4">
                    <span className="text-white font-bold text-lg">{course.code}</span>
                  </div>
                </div>
                <div className="course-card-body">
                  <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {course.description || 'No description yet'}
                  </p>
                  <div className="flex gap-2">
                    <button className="btn-3d btn-secondary btn-sm flex-1">
                      Edit Course
                    </button>
                    <button className="btn-3d btn-accent btn-sm flex-1">
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold text-gray-900">Create New Course</h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <label className="input-label">Course Name *</label>
                <input
                  type="text"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                  className="input-field"
                  placeholder="e.g., Introduction to Python"
                />
              </div>
              <div>
                <label className="input-label">Course Code *</label>
                <input
                  type="text"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value.toUpperCase() })}
                  className="input-field"
                  placeholder="e.g., PY101"
                />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="textarea-field"
                  placeholder="Describe what students will learn..."
                  rows={3}
                />
              </div>
              <div>
                <label className="input-label">Theme Color</label>
                <div className="flex gap-2">
                  {['#00d4aa', '#4facfe', '#43e97b', '#ffd700', '#ff6b6b', '#a855f7'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewCourse({ ...newCourse, color })}
                      className={`w-10 h-10 rounded-lg transition-transform ${
                        newCourse.color === color ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateCourse}>
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
