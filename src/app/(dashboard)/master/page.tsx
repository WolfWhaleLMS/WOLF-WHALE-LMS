import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getMasterStats() {
  const [
    totalSchools,
    activeSchools,
    totalUsers,
    totalAdmins,
    totalTeachers,
    totalStudents,
    totalCourses,
    recentSchools,
    recentAdmins,
  ] = await Promise.all([
    prisma.school.count(),
    prisma.school.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'TEACHER' } }),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.course.count(),
    prisma.school.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { users: true }
        }
      }
    }),
    prisma.user.findMany({
      where: { role: 'ADMIN' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        school: {
          select: { name: true }
        }
      }
    }),
  ]);

  return {
    totalSchools,
    activeSchools,
    totalUsers,
    totalAdmins,
    totalTeachers,
    totalStudents,
    totalCourses,
    recentSchools,
    recentAdmins,
  };
}

export default async function MasterDashboard() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'MASTER') {
    redirect('/login');
  }

  const stats = await getMasterStats();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text">Master Dashboard</h1>
        <p className="text-[var(--text-muted)] mt-1">
          System overview and management for Wolf Whale LMS
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalSchools}</div>
          <div className="stat-card-label">Total Schools</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.activeSchools}</div>
          <div className="stat-card-label">Active Schools</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalAdmins}</div>
          <div className="stat-card-label">Admins</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value">{stats.totalUsers}</div>
          <div className="stat-card-label">Total Users</div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalTeachers}</div>
          <div className="text-sm text-[var(--text-muted)]">Teachers</div>
        </div>
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalStudents}</div>
          <div className="text-sm text-[var(--text-muted)]">Students</div>
        </div>
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.totalCourses}</div>
          <div className="text-sm text-[var(--text-muted)]">Courses</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Link
          href="/master/schools/new"
          className="glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center" style={{ boxShadow: 'var(--accent-glow)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Create New School</h3>
            <p className="text-sm text-[var(--text-muted)]">Set up a new organization</p>
          </div>
        </Link>

        <Link
          href="/master/admins/new"
          className="glass-card p-6 flex items-center gap-4 hover:scale-[1.02] transition-transform"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--accent-blue)] flex items-center justify-center" style={{ boxShadow: 'var(--accent-glow-cyan)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)]">Create Admin User</h3>
            <p className="text-sm text-[var(--text-muted)]">Add an administrator to a school</p>
          </div>
        </Link>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Schools */}
        <div className="ice-block p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Schools</h2>
            <Link href="/master/schools" className="text-sm text-[var(--accent-blue)] hover:underline">
              View All
            </Link>
          </div>
          {stats.recentSchools.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No schools created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentSchools.map((school) => (
                <div
                  key={school.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-light)]"
                >
                  <div>
                    <p className="font-medium text-[var(--text-primary)]">{school.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {school._count.users} users
                    </p>
                  </div>
                  <span className={`badge ${school.isActive ? 'badge-present' : 'badge-pending'}`}>
                    {school.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Admins */}
        <div className="ice-block p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text-primary)]">Recent Admins</h2>
            <Link href="/master/admins" className="text-sm text-[var(--accent-blue)] hover:underline">
              View All
            </Link>
          </div>
          {stats.recentAdmins.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No admins created yet</p>
          ) : (
            <div className="space-y-3">
              {stats.recentAdmins.map((admin) => (
                <div
                  key={admin.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border-light)]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white text-sm font-medium" style={{ boxShadow: 'var(--accent-glow)' }}>
                      {admin.firstName[0]}{admin.lastName[0]}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text-primary)]">
                        {admin.firstName} {admin.lastName}
                      </p>
                      <p className="text-xs text-[var(--text-muted)]">
                        {admin.school?.name || 'No School'}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-graded">Admin</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
