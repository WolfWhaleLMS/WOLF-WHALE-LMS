'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useDemoSession } from '@/components/DemoSessionProvider';

// Saskatchewan Grade 10 Demo Data for Teacher
const DEMO_COURSES = [
  { name: 'Foundations of Math 10', code: 'FOM10', students: 28, submissions: 8, color: '#004d40' },
  { name: 'Workplace & Apprenticeship Math 10', code: 'WAM10', students: 24, submissions: 5, color: '#00695c' },
  { name: 'Pre-Calculus 10', code: 'PC10', students: 22, submissions: 3, color: '#00897b' },
];

const DEMO_SUBMISSIONS = [
  { student: 'Emma J.', assignment: 'Polynomial Operations Quiz', time: '2h ago', course: 'FOM10' },
  { student: 'Lucas K.', assignment: 'Linear Equations Practice', time: '4h ago', course: 'FOM10' },
  { student: 'Sophia M.', assignment: 'Trigonometry Test', time: '5h ago', course: 'PC10' },
];

export default function TeacherDashboard() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();

  // Get current user from demo or real session
  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    // Wait for demo session check to complete
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'TEACHER' && session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'TEACHER') {
      // Demo user trying to access teacher dashboard but not a teacher
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  if (isDemoLoading || (!isDemo && status === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const courses = isDemo ? DEMO_COURSES : [
    { name: 'Foundations of Math 10', code: 'FOM10', students: 28, submissions: 8, color: '#004d40' },
    { name: 'English Language Arts A10', code: 'ELA-A10', students: 32, submissions: 5, color: '#00695c' },
    { name: 'Science 10', code: 'SCI10', students: 30, submissions: 3, color: '#00897b' },
  ];

  const submissions = isDemo ? DEMO_SUBMISSIONS : [
    { student: 'Emma J.', assignment: 'Polynomial Operations', time: '2h ago', course: 'FOM10' },
    { student: 'Lucas K.', assignment: 'Literary Analysis', time: '4h ago', course: 'ELA-A10' },
    { student: 'Sophia M.', assignment: 'Lab Report', time: '5h ago', course: 'SCI10' },
  ];

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner - Ice Style */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Saskatchewan Grade 10 Teacher</p>
              <p className="text-sm text-[var(--text-muted)]">Exploring teacher features with sample curriculum data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - Ice Style */}
      <div className="ice-block p-6">
        <h1 className="text-2xl font-bold text-[var(--evergreen)]">Teacher Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">Welcome back, {currentUser?.firstName}! Here&apos;s your teaching overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: isDemo ? 3 : 4, label: 'Active Courses', icon: '📚' },
          { value: isDemo ? 74 : 127, label: 'Total Students', icon: '👥' },
          { value: isDemo ? 16 : 23, label: 'Pending Submissions', icon: '📝' },
          { value: isDemo ? '86%' : '94%', label: 'Average Grade', icon: '📊' },
        ].map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="stat-card-value">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--evergreen)]">My Courses</h2>
            <Link href="/teacher/courses" className="text-[var(--aurora-green)] font-semibold hover:underline">
              Manage All
            </Link>
          </div>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <div key={index} className="ice-block p-4 flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold border-2 border-white/30"
                  style={{ background: course.color }}
                >
                  {course.code.slice(0, 2)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--evergreen)]">{course.name}</h3>
                  <p className="text-sm text-[var(--text-muted)]">{course.code} • {course.students} students</p>
                </div>
                <div className="text-right">
                  {course.submissions > 0 && (
                    <span className="badge badge-pending">{course.submissions} to grade</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="ice-block p-5">
            <h3 className="font-bold text-[var(--evergreen)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/teacher/gradebook" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span>Grade Submissions</span>
              </Link>
              <Link href="/teacher/attendance" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Take Attendance</span>
              </Link>
              <Link href="/inbox" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Messages</span>
              </Link>
            </div>
          </div>

          {/* Recent Submissions */}
          <div className="ice-block p-5">
            <h3 className="font-bold text-[var(--evergreen)] mb-4">Recent Submissions</h3>
            <div className="space-y-3">
              {submissions.map((submission, index) => (
                <div key={index} className="p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
                  <p className="font-semibold text-[var(--evergreen)] text-sm">{submission.student}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{submission.assignment}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{submission.course} • {submission.time}</p>
                </div>
              ))}
            </div>
            <Link
              href="/teacher/gradebook"
              className="block text-center text-[var(--aurora-green)] font-semibold text-sm mt-4 hover:underline"
            >
              View All Submissions
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
