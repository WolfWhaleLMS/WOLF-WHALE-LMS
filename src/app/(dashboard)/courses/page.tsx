'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  progress: number;
  teacher: string;
  moduleCount: number;
  isEnrolled: boolean;
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [filter, setFilter] = useState<'all' | 'enrolled' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      // Mock data
      setCourses([
        {
          id: '1',
          name: 'Introduction to Web Development',
          code: 'WEB101',
          description: 'Learn HTML, CSS, and JavaScript to build modern websites.',
          color: '#00d4aa',
          progress: 75,
          teacher: 'Dr. Sarah Smith',
          moduleCount: 8,
          isEnrolled: true,
        },
        {
          id: '2',
          name: 'Data Structures & Algorithms',
          code: 'CS201',
          description: 'Master fundamental data structures and algorithmic techniques.',
          color: '#4facfe',
          progress: 45,
          teacher: 'Prof. Michael Johnson',
          moduleCount: 12,
          isEnrolled: true,
        },
        {
          id: '3',
          name: 'User Experience Design',
          code: 'UX301',
          description: 'Design intuitive and user-friendly digital experiences.',
          color: '#43e97b',
          progress: 90,
          teacher: 'Ms. Emily Davis',
          moduleCount: 6,
          isEnrolled: true,
        },
        {
          id: '4',
          name: 'Machine Learning Fundamentals',
          code: 'ML401',
          description: 'Introduction to machine learning concepts and applications.',
          color: '#ff6b6b',
          progress: 0,
          teacher: 'Dr. James Wilson',
          moduleCount: 10,
          isEnrolled: false,
        },
        {
          id: '5',
          name: 'Mobile App Development',
          code: 'MOB201',
          description: 'Build cross-platform mobile apps with React Native.',
          color: '#ffd700',
          progress: 0,
          teacher: 'Prof. Lisa Anderson',
          moduleCount: 9,
          isEnrolled: false,
        },
      ]);
    }
  }, [session]);

  const filteredCourses = courses.filter((course) => {
    const matchesFilter =
      filter === 'all' ||
      (filter === 'enrolled' && course.isEnrolled) ||
      (filter === 'available' && !course.isEnrolled);
    const matchesSearch =
      searchQuery === '' ||
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
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
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-gray-600">Explore and manage your enrolled courses</p>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-64"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {[
          { key: 'all', label: 'All Courses' },
          { key: 'enrolled', label: 'Enrolled' },
          { key: 'available', label: 'Available' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.key
                ? 'bg-gradient-to-r from-[#00d4aa] to-[#00a8cc] text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Link key={course.id} href={`/courses/${course.id}`}>
            <div className="course-card h-full">
              <div
                className="course-card-image"
                style={{
                  background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)`,
                }}
              >
                <div className="absolute top-3 right-3">
                  {course.isEnrolled ? (
                    <span className="badge badge-graded">Enrolled</span>
                  ) : (
                    <span className="badge badge-pending">Available</span>
                  )}
                </div>
                <div className="absolute bottom-3 left-4">
                  <span className="text-white font-bold text-lg">{course.code}</span>
                </div>
              </div>
              <div className="course-card-body">
                <h3 className="font-semibold text-gray-900 mb-1">{course.name}</h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{course.teacher}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  <span>{course.moduleCount} modules</span>
                </div>
                {course.isEnrolled && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{course.progress}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                {!course.isEnrolled && (
                  <button className="btn-3d btn-primary w-full btn-sm">
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Check back later for new courses'}
          </p>
        </div>
      )}
    </div>
  );
}
