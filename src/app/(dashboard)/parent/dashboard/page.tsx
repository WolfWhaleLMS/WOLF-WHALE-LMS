'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import ChildSwitcher from '@/components/ChildSwitcher';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface ChildData {
  id: string;
  name: string;
  grade: number;
  attendance: number;
  xp: number;
  level: number;
  recentGrades: Array<{ assignment: string; grade: number; maxGrade: number; course: string }>;
  upcomingAssignments: Array<{ title: string; dueDate: string; course: string }>;
}

// Saskatchewan Grade 10 Demo Data for Parent
const DEMO_CHILD_DATA: ChildData = {
  id: 'demo-student-1',
  name: 'Emma Johnson',
  grade: 84,
  attendance: 96,
  xp: 2450,
  level: 3,
  recentGrades: [
    { assignment: 'Polynomial Operations Quiz', grade: 88, maxGrade: 100, course: 'FOM10' },
    { assignment: 'Literary Analysis Essay', grade: 92, maxGrade: 100, course: 'ELA-A10' },
    { assignment: 'Chemistry Lab Report', grade: 78, maxGrade: 100, course: 'SCI10' },
    { assignment: 'Canadian History Test', grade: 85, maxGrade: 100, course: 'SOC10' },
  ],
  upcomingAssignments: [
    { title: 'Trigonometry Unit Test', dueDate: '2026-01-20', course: 'FOM10' },
    { title: 'Persuasive Writing Assignment', dueDate: '2026-01-22', course: 'ELA-A10' },
    { title: 'Physics Lab Practical', dueDate: '2026-01-25', course: 'SCI10' },
  ],
};

export default function ParentDashboard() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [childData, setChildData] = useState<ChildData | null>(null);

  // Get current user from demo or real session
  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    // Wait for demo session check to complete
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'PARENT') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'PARENT') {
      // Demo user trying to access parent dashboard but not a parent
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  useEffect(() => {
    if (isDemo && demoUser?.children?.length) {
      setSelectedChildId(demoUser.children[0].id);
    } else if (session?.user?.children?.length && !selectedChildId) {
      setSelectedChildId(session.user.children[0].id);
    }
  }, [session, selectedChildId, isDemo, demoUser]);

  useEffect(() => {
    async function fetchDashboard() {
      if (!selectedChildId) return;

      if (isDemo) {
        // Demo mode - use Saskatchewan Grade 10 mock data
        setChildData(DEMO_CHILD_DATA);
        return;
      }

      // Real mode - fetch from API
      try {
        const response = await fetch(`/api/parent/dashboard?childId=${selectedChildId}`);
        const data = await response.json();
        if (response.ok && data.dashboard) {
          setChildData(data.dashboard);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      }
    }

    fetchDashboard();
  }, [selectedChildId, isDemo]);

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

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner - Ice Style */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Saskatchewan Grade 10 Parent</p>
              <p className="text-sm text-[var(--text-muted)]">Viewing your child&apos;s progress with sample data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - Ice Style */}
      <div className="ice-block p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--evergreen)]">Parent Dashboard</h1>
            <p className="text-[var(--text-muted)] mt-1">Monitor your child&apos;s progress</p>
          </div>
          {!isDemo && (
            <ChildSwitcher
              selectedChildId={selectedChildId}
              onChildSelect={setSelectedChildId}
            />
          )}
          {isDemo && demoUser?.children && (
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ice-blue)]/50 border-2 border-[var(--frost-border)] rounded-xl">
              <span className="text-[var(--evergreen)] font-semibold">{demoUser.children[0].name}</span>
              <span className="badge badge-graded text-xs">Grade 10</span>
            </div>
          )}
        </div>
      </div>

      {childData && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: `${childData.grade}%`, label: 'Overall Grade', color: 'gradient-text' },
              { value: `${childData.attendance}%`, label: 'Attendance', color: 'gradient-text' },
              { value: childData.level, label: 'Level', color: 'gradient-text-gold' },
              { value: childData.xp.toLocaleString(), label: 'Total XP', color: 'gradient-text-gold' },
            ].map((stat, index) => (
              <div key={index} className="stat-card">
                <div className={`stat-card-value ${stat.color}`}>{stat.value}</div>
                <div className="stat-card-label">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Grades */}
            <div className="lg:col-span-2 ice-block p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-[var(--evergreen)]">Recent Grades</h3>
                <Link href="/parent/grades" className="text-[var(--aurora-green)] font-semibold text-sm hover:underline">
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {childData.recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
                    <div>
                      <p className="font-semibold text-[var(--evergreen)]">{grade.assignment}</p>
                      <p className="text-xs text-[var(--text-muted)]">{grade.course}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${
                        (grade.grade / grade.maxGrade) >= 0.9
                          ? 'text-[var(--aurora-green)]'
                          : (grade.grade / grade.maxGrade) >= 0.7
                          ? 'text-[var(--gold-start)]'
                          : 'text-red-500'
                      }`}>
                        {grade.grade}/{grade.maxGrade}
                      </span>
                      <span className="ml-2 text-sm text-[var(--text-muted)]">
                        ({Math.round((grade.grade / grade.maxGrade) * 100)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Upcoming */}
              <div className="ice-block p-5">
                <h3 className="font-bold text-[var(--evergreen)] mb-4">Upcoming Assignments</h3>
                <div className="space-y-3">
                  {childData.upcomingAssignments.map((assignment, index) => (
                    <div key={index} className="p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
                      <p className="font-semibold text-[var(--evergreen)] text-sm">{assignment.title}</p>
                      <p className="text-xs text-[var(--text-muted)]">{assignment.course}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Due {new Date(assignment.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="ice-block p-5">
                <h3 className="font-bold text-[var(--evergreen)] mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Link href="/parent/grades" className="sidebar-nav-item">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <span>View All Grades</span>
                  </Link>
                  <Link href="/parent/attendance" className="sidebar-nav-item">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Attendance Records</span>
                  </Link>
                  <Link href="/inbox" className="sidebar-nav-item">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Message Teacher</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
