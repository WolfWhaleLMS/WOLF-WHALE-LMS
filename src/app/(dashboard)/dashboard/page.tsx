'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import XPBar from '@/components/XPBar';
import Tamagotchi from '@/components/Tamagotchi';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface Course {
  id: string;
  name: string;
  code: string;
  color: string;
  progress: number;
  teacher?: string;
}

interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  isLate: boolean;
}

interface Achievement {
  id: string;
  name: string;
  icon: string;
  unlockedAt: string;
}

// Saskatchewan Grade 10 Demo Data
const DEMO_COURSES: Course[] = [
  { id: 'fom10', name: 'Foundations of Math 10', code: 'FOM10', color: '#00d4aa', progress: 75, teacher: 'Mrs. Wilson' },
  { id: 'ela10', name: 'English Language Arts A10', code: 'ELA-A10', color: '#4facfe', progress: 82, teacher: 'Mr. Thompson' },
  { id: 'sci10', name: 'Science 10', code: 'SCI10', color: '#43e97b', progress: 68, teacher: 'Dr. Anderson' },
  { id: 'soc10', name: 'Social Studies 10', code: 'SOC10', color: '#fa709a', progress: 90, teacher: 'Ms. Chen' },
];

const DEMO_ASSIGNMENTS: Assignment[] = [
  { id: '1', title: 'Polynomial Operations Quiz', courseName: 'FOM10', dueDate: '2026-01-20', isLate: false },
  { id: '2', title: 'Literary Analysis Essay', courseName: 'ELA-A10', dueDate: '2026-01-18', isLate: false },
  { id: '3', title: 'Chemistry Lab Report', courseName: 'SCI10', dueDate: '2026-01-15', isLate: true },
  { id: '4', title: 'Canadian History Presentation', courseName: 'SOC10', dueDate: '2026-01-22', isLate: false },
];

const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: '1', name: 'First Steps', icon: '🎯', unlockedAt: '2026-01-10' },
  { id: '2', name: 'Math Whiz', icon: '🧮', unlockedAt: '2026-01-12' },
  { id: '3', name: 'Week Warrior', icon: '🔥', unlockedAt: '2026-01-14' },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState({
    activeCourses: 0,
    completedAssignments: 0,
    averageGrade: 0,
    dayStreak: 0,
  });

  // Get current user from demo or real session
  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    // Wait for demo session check to complete
    if (isDemoLoading) return;

    // Handle authentication and role-based redirects
    if (!isDemo && status === 'unauthenticated') {
      router.push('/login');
    } else if (!isDemo && status === 'authenticated' && session?.user) {
      // Redirect based on role for real users
      const role = session.user.role;
      if (role === 'MASTER' || role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else if (role === 'TEACHER') {
        router.push('/teacher/dashboard');
      } else if (role === 'PARENT') {
        router.push('/parent/dashboard');
      }
      // STUDENT stays on this page
    }
  }, [status, session, router, isDemo, isDemoLoading]);

  useEffect(() => {
    // Load dashboard data based on mode
    if (isDemo && demoUser) {
      // Demo mode - use Saskatchewan Grade 10 mock data
      setCourses(DEMO_COURSES);
      setAssignments(DEMO_ASSIGNMENTS);
      setAchievements(DEMO_ACHIEVEMENTS);
      setStats({
        activeCourses: 4,
        completedAssignments: 12,
        averageGrade: 84,
        dayStreak: demoUser.streak || 7,
      });
    } else if (session?.user) {
      // Real mode - load from API or use placeholder
      setCourses([
        { id: '1', name: 'Foundations of Math 10', code: 'FOM10', color: '#00d4aa', progress: 75, teacher: 'Mrs. Wilson' },
        { id: '2', name: 'English Language Arts A10', code: 'ELA-A10', color: '#4facfe', progress: 45, teacher: 'Mr. Thompson' },
        { id: '3', name: 'Science 10', code: 'SCI10', color: '#43e97b', progress: 90, teacher: 'Dr. Anderson' },
      ]);

      setAssignments([
        { id: '1', title: 'Polynomial Operations', courseName: 'FOM10', dueDate: '2026-01-20', isLate: false },
        { id: '2', title: 'Literary Analysis', courseName: 'ELA-A10', dueDate: '2026-01-18', isLate: false },
        { id: '3', title: 'Lab Report', courseName: 'SCI10', dueDate: '2026-01-15', isLate: true },
      ]);

      setAchievements([
        { id: '1', name: 'First Steps', icon: '🎯', unlockedAt: '2026-01-10' },
        { id: '2', name: 'Perfect Score', icon: '⭐', unlockedAt: '2026-01-12' },
        { id: '3', name: 'Week Warrior', icon: '🔥', unlockedAt: '2026-01-14' },
      ]);

      setStats({
        activeCourses: 3,
        completedAssignments: 12,
        averageGrade: 87,
        dayStreak: session.user.streak || 0,
      });
    }
  }, [session, isDemo, demoUser]);

  if (isDemoLoading || (!isDemo && status === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner - Ice Style */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎓</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Saskatchewan Grade 10</p>
              <p className="text-sm text-[var(--text-muted)]">Exploring as a student with sample curriculum data</p>
            </div>
          </div>
        </div>
      )}

      {/* Welcome Header - Ice Style */}
      <div className="ice-block p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--evergreen)]">
              Welcome back, {currentUser.firstName}! 👋
            </h1>
            <p className="text-[var(--text-muted)] mt-1">
              {stats.dayStreak > 0
                ? `You're on a ${stats.dayStreak} day streak! Keep it up!`
                : 'Start your learning journey today!'}
            </p>
          </div>
          <div className="w-full md:w-64">
            <XPBar xp={currentUser.xp || 0} level={currentUser.level || 1} compact />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: stats.activeCourses, label: 'Active Courses', color: 'gradient-text' },
          { value: stats.completedAssignments, label: 'Completed', color: 'gradient-text' },
          { value: `${stats.averageGrade}%`, label: 'Average Grade', color: 'gradient-text' },
          { value: stats.dayStreak, label: 'Day Streak', color: 'gradient-text-gold' },
        ].map((stat, index) => (
          <div key={index} className="stat-card">
            <div className={`stat-card-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-[var(--evergreen)]">My Courses</h2>
            <Link href="/courses" className="text-[var(--aurora-green)] font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {courses.map((course) => (
              <Link key={course.id} href={`/courses/${course.id}`}>
                <div className="course-card">
                  <div
                    className="course-card-image"
                    style={{ background: `linear-gradient(135deg, ${course.color}, ${course.color}cc)` }}
                  >
                    <div className="absolute bottom-3 left-4">
                      <span className="text-white/80 text-sm">{course.code}</span>
                    </div>
                  </div>
                  <div className="course-card-body">
                    <h3 className="font-bold text-[var(--evergreen)] mb-1">{course.name}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-3">{course.teacher}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--text-secondary)]">Progress</span>
                        <span className="font-semibold text-[var(--evergreen)]">{course.progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Tamagotchi Pet */}
          <Tamagotchi isDemo={isDemo} />

          {/* Upcoming Assignments */}
          <div className="ice-block p-5">
            <h3 className="font-bold text-[var(--evergreen)] mb-4">Upcoming Assignments</h3>
            <div className="space-y-3">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="flex items-start gap-3 p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
                  <div className={`w-2 h-2 rounded-full mt-2 ${assignment.isLate ? 'bg-red-500' : 'bg-[var(--aurora-green)]'}`}></div>
                  <div className="flex-1">
                    <p className="font-semibold text-[var(--evergreen)] text-sm">{assignment.title}</p>
                    <p className="text-xs text-[var(--text-muted)]">{assignment.courseName}</p>
                    <p className={`text-xs mt-1 ${assignment.isLate ? 'text-red-500 font-semibold' : 'text-[var(--text-muted)]'}`}>
                      {assignment.isLate ? 'Overdue!' : `Due ${new Date(assignment.dueDate).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Link
              href="/calendar"
              className="block text-center text-[var(--aurora-green)] font-semibold text-sm mt-4 hover:underline"
            >
              View Calendar
            </Link>
          </div>

          {/* Recent Achievements */}
          <div className="ice-block p-5">
            <h3 className="font-bold text-[var(--evergreen)] mb-4">Recent Achievements</h3>
            <div className="space-y-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-badge">
                  <span className="text-xl">{achievement.icon}</span>
                  <span className="text-sm font-medium text-[var(--evergreen)]">{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="ice-block p-5">
            <h3 className="font-bold text-[var(--evergreen)] mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/calendar" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Calendar</span>
              </Link>
              <Link href="/inbox" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>Inbox</span>
              </Link>
              <Link href="/courses" className="sidebar-nav-item">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>All Courses</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
