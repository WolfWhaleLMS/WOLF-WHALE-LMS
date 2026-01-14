'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useDemoSession } from '@/components/DemoSessionProvider';

// Saskatchewan Grade 10 Demo Data for Admin
const DEMO_STATS = {
  totalUsers: 142,
  activeCourses: 10,
  assignments: 847,
  uptime: '99.9%',
};

const DEMO_USER_BREAKDOWN = [
  { role: 'Students', count: 105, color: '#004d40' },
  { role: 'Teachers', count: 12, color: '#00695c' },
  { role: 'Parents', count: 22, color: '#00e676' },
  { role: 'Admins', count: 3, color: '#ffd54f' },
];

const DEMO_ACTIVITY = [
  { action: 'Student enrolled in FOM10', user: 'Emma Johnson', time: '5 min ago', type: 'user' },
  { action: 'Assignment created', user: 'Mrs. Wilson', time: '1 hour ago', type: 'assignment' },
  { action: 'Grade posted for ELA-A10', user: 'Mr. Thompson', time: '2 hours ago', type: 'grade' },
  { action: 'Attendance recorded for SCI10', user: 'Dr. Anderson', time: '3 hours ago', type: 'course' },
  { action: 'Parent message received', user: 'Robert Johnson', time: '5 hours ago', type: 'announcement' },
];

export default function AdminDashboard() {
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
      } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'ADMIN') {
      // Demo user trying to access admin dashboard but not an admin
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

  const stats = isDemo ? DEMO_STATS : {
    totalUsers: 156,
    activeCourses: 12,
    assignments: 1247,
    uptime: '99.9%',
  };

  const userBreakdown = isDemo ? DEMO_USER_BREAKDOWN : [
    { role: 'Students', count: 120, color: '#004d40' },
    { role: 'Teachers', count: 15, color: '#00695c' },
    { role: 'Parents', count: 18, color: '#00e676' },
    { role: 'Admins', count: 3, color: '#ffd54f' },
  ];

  const recentActivity = isDemo ? DEMO_ACTIVITY : [
    { action: 'New user registered', user: 'Alex Thompson', time: '5 min ago', type: 'user' },
    { action: 'Course published', user: 'Dr. Sarah Smith', time: '1 hour ago', type: 'course' },
    { action: 'Assignment submitted', user: 'Emma Johnson', time: '2 hours ago', type: 'assignment' },
    { action: 'Grade updated', user: 'Prof. Michael Johnson', time: '3 hours ago', type: 'grade' },
    { action: 'New announcement', user: 'Dr. Sarah Smith', time: '5 hours ago', type: 'announcement' },
  ];

  const totalUsers = userBreakdown.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner - Ice Style */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - School Administrator</p>
              <p className="text-sm text-[var(--text-muted)]">Exploring admin features with Saskatchewan Grade 10 sample data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header - Ice Style */}
      <div className="ice-block p-6">
        <h1 className="text-2xl font-bold text-[var(--evergreen)]">Admin Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">System overview and management</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { value: stats.totalUsers, label: 'Total Users', icon: '👥', color: 'gradient-text' },
          { value: stats.activeCourses, label: 'Active Courses', icon: '📚', color: 'gradient-text' },
          { value: stats.assignments, label: 'Assignments', icon: '📝', color: 'gradient-text' },
          { value: stats.uptime, label: 'Uptime', icon: '⚡', color: 'text-[var(--aurora-green)]' },
        ].map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className={`stat-card-value ${stat.color}`}>{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* User Breakdown & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="ice-block p-6">
          <h3 className="font-bold text-[var(--evergreen)] mb-4">User Breakdown</h3>
          <div className="space-y-4">
            {userBreakdown.map((item) => (
              <div key={item.role} className="flex items-center gap-4">
                <div className="w-20 text-sm font-semibold text-[var(--text-secondary)]">{item.role}</div>
                <div className="flex-1 bg-[var(--ice-blue)]/30 rounded-full h-4 overflow-hidden border border-[var(--frost-border-light)]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(item.count / totalUsers) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                <div className="w-12 text-sm font-bold text-[var(--evergreen)]">{item.count}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="ice-block p-6">
          <h3 className="font-bold text-[var(--evergreen)] mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/admin/users" className="p-4 rounded-xl bg-white/50 border-2 border-[var(--frost-border-light)] hover:bg-[var(--ice-blue)]/30 hover:border-[var(--evergreen-light)]/30 transition-all">
              <div className="text-2xl mb-2">👥</div>
              <div className="font-bold text-[var(--evergreen)]">Manage Users</div>
              <div className="text-sm text-[var(--text-muted)]">Add, edit, or remove users</div>
            </Link>
            <Link href="/admin/courses" className="p-4 rounded-xl bg-white/50 border-2 border-[var(--frost-border-light)] hover:bg-[var(--ice-blue)]/30 hover:border-[var(--evergreen-light)]/30 transition-all">
              <div className="text-2xl mb-2">📚</div>
              <div className="font-bold text-[var(--evergreen)]">Manage Courses</div>
              <div className="text-sm text-[var(--text-muted)]">Course administration</div>
            </Link>
            <Link href="/admin/reports" className="p-4 rounded-xl bg-white/50 border-2 border-[var(--frost-border-light)] hover:bg-[var(--ice-blue)]/30 hover:border-[var(--evergreen-light)]/30 transition-all">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-[var(--evergreen)]">View Reports</div>
              <div className="text-sm text-[var(--text-muted)]">Analytics & insights</div>
            </Link>
            <Link href="/admin/subscription" className="p-4 rounded-xl bg-white/50 border-2 border-[var(--frost-border-light)] hover:bg-[var(--ice-blue)]/30 hover:border-[var(--evergreen-light)]/30 transition-all">
              <div className="text-2xl mb-2">💳</div>
              <div className="font-bold text-[var(--evergreen)]">Subscription</div>
              <div className="text-sm text-[var(--text-muted)]">Manage billing & plan</div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="ice-block p-6">
        <h3 className="font-bold text-[var(--evergreen)] mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activity.type === 'user' ? 'bg-[var(--ice-blue)] text-[var(--evergreen)]' :
                activity.type === 'course' ? 'bg-[var(--aurora-green)]/20 text-[var(--evergreen)]' :
                activity.type === 'assignment' ? 'bg-[var(--gold-start)]/20 text-[var(--evergreen)]' :
                activity.type === 'grade' ? 'bg-[var(--aurora-blue)]/20 text-[var(--evergreen)]' :
                'bg-[var(--ice-blue)] text-[var(--evergreen)]'
              }`}>
                {activity.type === 'user' ? '👤' :
                 activity.type === 'course' ? '📚' :
                 activity.type === 'assignment' ? '📝' :
                 activity.type === 'grade' ? '✓' : '📢'}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[var(--evergreen)]">{activity.action}</p>
                <p className="text-sm text-[var(--text-muted)]">{activity.user}</p>
              </div>
              <span className="text-sm text-[var(--text-muted)]">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
