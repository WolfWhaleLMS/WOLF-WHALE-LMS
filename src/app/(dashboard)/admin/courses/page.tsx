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
  teacherId: string;
  teacherName: string;
  studentCount: number;
  moduleCount: number;
  isPublished: boolean;
  createdAt: string;
}

interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Demo courses for demo mode
const DEMO_COURSES: Course[] = [
  { id: 'demo-1', name: 'Foundations of Mathematics 10', code: 'FOM10', description: 'Saskatchewan curriculum', color: '#3b82f6', teacherId: 't1', teacherName: 'Margaret Wilson', studentCount: 28, moduleCount: 3, isPublished: true, createdAt: '2024-01-01' },
  { id: 'demo-2', name: 'Workplace & Apprenticeship Math 10', code: 'WAM10', description: 'Practical mathematics', color: '#f59e0b', teacherId: 't1', teacherName: 'Margaret Wilson', studentCount: 22, moduleCount: 2, isPublished: true, createdAt: '2024-01-01' },
  { id: 'demo-3', name: 'English Language Arts A10', code: 'ELA-A10', description: 'Comprehension and composition', color: '#8b5cf6', teacherId: 't3', teacherName: 'Susan Peters', studentCount: 30, moduleCount: 4, isPublished: true, createdAt: '2024-01-01' },
  { id: 'demo-4', name: 'Native Studies 10', code: 'NAT10', description: 'Indigenous perspectives', color: '#dc2626', teacherId: 't2', teacherName: 'James Thunder', studentCount: 25, moduleCount: 3, isPublished: true, createdAt: '2024-01-01' },
  { id: 'demo-5', name: 'Science 10', code: 'SCI10', description: 'Climate, ecosystems, chemistry', color: '#22c55e', teacherId: 't3', teacherName: 'Susan Peters', studentCount: 32, moduleCount: 4, isPublished: true, createdAt: '2024-01-01' },
  { id: 'demo-6', name: 'New Course Draft', code: 'DRAFT01', description: 'Work in progress', color: '#14b8a6', teacherId: 't1', teacherName: 'Margaret Wilson', studentCount: 0, moduleCount: 0, isPublished: false, createdAt: '2024-01-10' },
];

const DEMO_TEACHERS: Teacher[] = [
  { id: 't1', firstName: 'Margaret', lastName: 'Wilson', email: 'mwilson@school.local' },
  { id: 't2', firstName: 'James', lastName: 'Thunder', email: 'jthunder@school.local' },
  { id: 't3', firstName: 'Susan', lastName: 'Peters', email: 'speters@school.local' },
];

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  // Create modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newCourse, setNewCourse] = useState({
    name: '',
    code: '',
    description: '',
    color: '#00d4aa',
    teacherId: '',
  });

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  useEffect(() => {
    async function fetchData() {
      if (!isLoggedIn || !currentUser) return;

      // Demo mode - use mock data
      if (isDemo) {
        setCourses(DEMO_COURSES);
        setTeachers(DEMO_TEACHERS);
        setIsLoading(false);
        return;
      }

      try {
        // Fetch courses and teachers in parallel
        const [coursesRes, teachersRes] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/admin/users'),
        ]);

        const coursesData = await coursesRes.json();
        const usersData = await teachersRes.json();

        if (coursesRes.ok) {
          setCourses(coursesData.courses);
        } else {
          setError(coursesData.error || 'Failed to fetch courses');
        }

        if (teachersRes.ok) {
          // Filter to only teachers
          const teacherUsers = usersData.users?.filter((u: { role: string }) => u.role === 'TEACHER') || [];
          setTeachers(teacherUsers);
        }
      } catch {
        setError('Failed to fetch data');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoggedIn && currentUser) {
      fetchData();
    }
  }, [isLoggedIn, currentUser, isDemo]);

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.code) {
      setCreateError('Please fill in the course name and code');
      return;
    }

    if (!newCourse.teacherId) {
      setCreateError('Please select a teacher for this course');
      return;
    }

    // Demo mode - just add locally
    if (isDemo) {
      const teacher = teachers.find(t => t.id === newCourse.teacherId);
      const course: Course = {
        id: `demo-${Date.now()}`,
        name: newCourse.name,
        code: newCourse.code.toUpperCase(),
        description: newCourse.description,
        color: newCourse.color,
        teacherId: newCourse.teacherId,
        teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : 'Unknown',
        studentCount: 0,
        moduleCount: 0,
        isPublished: false,
        createdAt: new Date().toISOString(),
      };
      setCourses([course, ...courses]);
      setShowCreateModal(false);
      setNewCourse({ name: '', code: '', description: '', color: '#00d4aa', teacherId: '' });
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
        setCourses([{ ...data.course, createdAt: new Date().toISOString() }, ...courses]);
        setShowCreateModal(false);
        setNewCourse({ name: '', code: '', description: '', color: '#00d4aa', teacherId: '' });
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

  const handleDeleteCourse = async (courseId: string, courseName: string) => {
    if (!confirm(`Are you sure you want to delete "${courseName}"? This action cannot be undone.`)) {
      return;
    }

    // Demo mode - delete locally
    if (isDemo) {
      setCourses(courses.filter(c => c.id !== courseId));
      return;
    }

    try {
      const response = await fetch('/api/courses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId }),
      });

      if (response.ok) {
        setCourses(courses.filter(c => c.id !== courseId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete course');
      }
    } catch {
      alert('An error occurred. Please try again.');
    }
  };

  const filteredCourses = courses.filter((course) => {
    if (filter === 'all') return true;
    if (filter === 'published') return course.isPublished;
    if (filter === 'draft') return !course.isPublished;
    return true;
  });

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

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Course Management</p>
              <p className="text-sm text-[var(--text-muted)]">Changes will not be saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--evergreen)]">Course Management</h1>
          <p className="text-[var(--text-muted)]">{courses.length} courses total</p>
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
          <div className="stat-card-value gradient-text">{courses.filter(c => c.isPublished).length}</div>
          <div className="stat-card-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{courses.filter(c => !c.isPublished).length}</div>
          <div className="stat-card-label">Drafts</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">
            {courses.reduce((acc, c) => acc + c.studentCount, 0)}
          </div>
          <div className="stat-card-label">Total Enrollments</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'published', 'draft'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-[var(--aurora-green)] to-[var(--accent-cyan)] text-white'
                : 'bg-white/50 text-[var(--text-secondary)] hover:bg-white/80 border border-[var(--frost-border-light)]'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Courses Table */}
      <div className="ice-block overflow-hidden p-0">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Code</th>
              <th>Instructor</th>
              <th>Students</th>
              <th>Modules</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-10 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div>
                      <p className="font-medium text-[var(--evergreen)]">{course.name}</p>
                      <p className="text-xs text-[var(--text-muted)] line-clamp-1">
                        {course.description || 'No description'}
                      </p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge badge-graded">{course.code}</span>
                </td>
                <td className="text-[var(--text-secondary)]">{course.teacherName}</td>
                <td>{course.studentCount}</td>
                <td>{course.moduleCount}</td>
                <td>
                  <span className={`badge ${course.isPublished ? 'badge-present' : 'badge-pending'}`}>
                    {course.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td>
                  <div className="flex gap-2">
                    <Link
                      href={`/courses/${course.id}`}
                      className="btn-3d btn-ghost btn-sm"
                    >
                      View
                    </Link>
                    <button
                      onClick={() => handlePublishToggle(course.id, course.isPublished)}
                      className="btn-3d btn-ghost btn-sm"
                    >
                      {course.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id, course.name)}
                      className="btn-3d btn-ghost btn-sm text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-[var(--evergreen)] mb-2">No courses found</h3>
          <p className="text-[var(--text-muted)] mb-4">
            {filter === 'all' ? 'Create your first course to get started' : `No ${filter} courses`}
          </p>
          {filter === 'all' && (
            <Button onClick={() => setShowCreateModal(true)}>Create Course</Button>
          )}
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
                <label className="input-label">Assign Teacher *</label>
                {teachers.length === 0 ? (
                  <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                    <p className="font-medium">No teachers available</p>
                    <p className="text-sm mt-1">
                      Please create a teacher account first before adding courses.
                    </p>
                  </div>
                ) : (
                  <select
                    value={newCourse.teacherId}
                    onChange={(e) => setNewCourse({ ...newCourse, teacherId: e.target.value })}
                    className="select-field"
                  >
                    <option value="">Select a teacher...</option>
                    {teachers.map((teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.firstName} {teacher.lastName} ({teacher.email})
                      </option>
                    ))}
                  </select>
                )}
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
                  {['#00d4aa', '#4facfe', '#43e97b', '#ffd700', '#ff6b6b', '#a855f7', '#3b82f6', '#f59e0b'].map((color) => (
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
              <Button
                onClick={handleCreateCourse}
                isLoading={isCreating}
                disabled={teachers.length === 0}
              >
                Create Course
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
