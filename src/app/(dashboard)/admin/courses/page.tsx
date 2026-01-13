'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

interface Course {
  id: string;
  name: string;
  code: string;
  teacher: string;
  studentCount: number;
  status: 'published' | 'draft';
  createdAt: string;
}

export default function AdminCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    // Mock courses
    setCourses([
      { id: '1', name: 'Introduction to Web Development', code: 'WEB101', teacher: 'Dr. Sarah Smith', studentCount: 35, status: 'published', createdAt: '2023-09-01' },
      { id: '2', name: 'Data Structures & Algorithms', code: 'CS201', teacher: 'Prof. Michael Johnson', studentCount: 42, status: 'published', createdAt: '2023-09-01' },
      { id: '3', name: 'User Experience Design', code: 'UX301', teacher: 'Dr. Sarah Smith', studentCount: 28, status: 'published', createdAt: '2023-10-15' },
      { id: '4', name: 'Advanced JavaScript', code: 'WEB301', teacher: 'Dr. Sarah Smith', studentCount: 22, status: 'published', createdAt: '2024-01-01' },
      { id: '5', name: 'Machine Learning Basics', code: 'ML101', teacher: 'Prof. Michael Johnson', studentCount: 0, status: 'draft', createdAt: '2024-01-10' },
    ]);
  }, []);

  const filteredCourses = courses.filter((course) => {
    return filter === 'all' || course.status === filter;
  });

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
          <p className="text-gray-600">{courses.length} courses total</p>
        </div>
        <Button>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create Course
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{courses.length}</div>
          <div className="stat-card-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{courses.filter(c => c.status === 'published').length}</div>
          <div className="stat-card-label">Published</div>
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
        {['all', 'published', 'draft'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
              filter === f
                ? 'bg-gradient-to-r from-[#00d4aa] to-[#00a8cc] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Courses Table */}
      <div className="glass-card-solid overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Code</th>
              <th>Instructor</th>
              <th>Students</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.map((course) => (
              <tr key={course.id}>
                <td className="font-medium">{course.name}</td>
                <td>
                  <span className="badge badge-graded">{course.code}</span>
                </td>
                <td className="text-gray-600">{course.teacher}</td>
                <td>{course.studentCount}</td>
                <td>
                  <span className={`badge ${course.status === 'published' ? 'badge-present' : 'badge-pending'}`}>
                    {course.status}
                  </span>
                </td>
                <td className="text-gray-500">{new Date(course.createdAt).toLocaleDateString()}</td>
                <td>
                  <div className="flex gap-2">
                    <button className="btn-3d btn-ghost btn-sm">View</button>
                    <button className="btn-3d btn-ghost btn-sm">Edit</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
