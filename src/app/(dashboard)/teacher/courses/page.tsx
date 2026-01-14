'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  studentCount: number;
  moduleCount: number;
  isPublished: boolean;
  teacherName?: string;
}

// Demo courses for demo mode
const DEMO_COURSES: Course[] = [
  {
    id: 'demo-1',
    name: 'Foundations of Mathematics 10',
    code: 'FOM10',
    description: 'Saskatchewan curriculum focusing on measurement, surface area, volume, trigonometry.',
    color: '#3b82f6',
    studentCount: 28,
    moduleCount: 3,
    isPublished: true,
  },
  {
    id: 'demo-2',
    name: 'Workplace & Apprenticeship Math 10',
    code: 'WAM10',
    description: 'Practical mathematics for workplace applications.',
    color: '#f59e0b',
    studentCount: 22,
    moduleCount: 2,
    isPublished: true,
  },
  {
    id: 'demo-3',
    name: 'Physical Education 10',
    code: 'PE10',
    description: 'Developing physical literacy and active living.',
    color: '#f97316',
    studentCount: 35,
    moduleCount: 4,
    isPublished: true,
  },
  {
    id: 'demo-4',
    name: 'Health Education 10',
    code: 'HE10',
    description: 'Understanding wellness, mental health, and healthy lifestyles.',
    color: '#14b8a6',
    studentCount: 0,
    moduleCount: 0,
    isPublished: false,
  },
];

export default function TeacherCoursesPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCourse, setNewCourse] = useState({ name: '', code: '', description: '', color: '#00d4aa' });

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'TEACHER') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  useEffect(() => {
    async function fetchCourses() {
      if (!isLoggedIn || !currentUser) return;

      // Demo mode - use mock data
      if (isDemo) {
        setCourses(DEMO_COURSES);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/courses');
        const data = await response.json();

        if (response.ok) {
          setCourses(data.courses);
        } else {
          setError(data.error || 'Failed to fetch courses');
        }
      } catch {
        setError('Failed to fetch courses');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoggedIn && currentUser) {
      fetchCourses();
    }
  }, [isLoggedIn, currentUser, isDemo]);

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      setCreateError('Please fill in the course name and code');
      return;
    }

    // Demo mode - just add locally
    if (isDemo) {
      const course: Course = {
        id: `demo-${Date.now()}`,
        name: newCourse.name,
        code: newCourse.code.toUpperCase(),
        description: newCourse.description,
        color: newCourse.color,
        studentCount: 0,
        moduleCount: 0,
        isPublished: false,
      };
      setCourses([course, ...courses]);
      setShowCreateModal(false);
      setNewCourse({ name: '', code: '', description: '', color: '#00d4aa' });
      return;
    }

    setIsCreating(true);
    setCreateError('');

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCourse),
      });

      const data = await response.json();

      if (!response.ok) {
        setCreateError(data.error || 'Failed to create course');
      } else {
        setCourses([data.course, ...courses]);
        setShowCreateModal(false);
        setNewCourse({ name: '', code: '', description: '', color: '#00d4aa' });
      }
    } catch {
      setCreateError('An error occurred. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handlePublishToggle = async (courseId: string, currentStatus: boolean) => {
    // Demo mode - toggle locally
    if (isDemo) {
      setCourses(courses.map(c =>
        c.id === courseId ? { ...c, isPublished: !currentStatus } : c
      ));
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId, isPublished: !currentStatus }),
      });

      if (response.ok) {
        setCourses(courses.map(c =>
          c.id === courseId ? { ...c, isPublished: !currentStatus } : c
        ));
      }
    } catch (err) {
      console.error('Failed to update course:', err);
    }
  };

  if (isDemoLoading || (!isDemo && status === 'loading') || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const publishedCourses = courses.filter(c => c.isPublished);
  const draftCourses = courses.filter(c => !c.isPublished);

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Teacher Courses</p>
              <p className="text-sm text-[var(--text-muted)]">Changes will not be saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--evergreen)]">My Courses</h1>
          <p className="text-[var(--text-muted)]">Manage and create courses for your students</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} soundType="navigate">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Course
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="ice-block p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-600">{error}</p>
        </div>
      )}

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
          <h2 className="text-lg font-semibold text-[var(--evergreen)]">Published Courses</h2>
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
                  <h3 className="font-semibold text-[var(--evergreen)] mb-1">{course.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
                    {course.description || 'No description'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] mb-4">
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
                    <button
                      onClick={() => handlePublishToggle(course.id, course.isPublished)}
                      className="btn-3d btn-ghost btn-sm"
                      title="Unpublish"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
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
          <h2 className="text-lg font-semibold text-[var(--evergreen)]">Draft Courses</h2>
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
                  <h3 className="font-semibold text-[var(--evergreen)] mb-1">{course.name}</h3>
                  <p className="text-sm text-[var(--text-muted)] mb-3 line-clamp-2">
                    {course.description || 'No description yet'}
                  </p>
                  <div className="flex gap-2">
                    <Link href={`/courses/${course.id}`} className="btn-3d btn-secondary btn-sm flex-1 text-center">
                      Edit Course
                    </Link>
                    <button
                      onClick={() => handlePublishToggle(course.id, course.isPublished)}
                      className="btn-3d btn-accent btn-sm flex-1"
                    >
                      Publish
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {courses.length === 0 && !error && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-[var(--evergreen)] mb-2">No courses yet</h3>
          <p className="text-[var(--text-muted)] mb-4">Create your first course to get started</p>
          <Button onClick={() => setShowCreateModal(true)}>Create Course</Button>
        </div>
      )}

      {/* Create Course Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold text-[var(--evergreen)]">Create New Course</h2>
            </div>
            <div className="modal-body space-y-4">
              {createError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  {createError}
                </div>
              )}
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
              <Button onClick={handleCreateCourse} isLoading={isCreating}>
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
