import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getSchools() {
  return prisma.school.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { users: true }
      }
    }
  });
}

export default async function SchoolsListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'MASTER') {
    redirect('/login');
  }

  const schools = await getSchools();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Schools</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage all organizations in Wolf Whale LMS
          </p>
        </div>
        <Link href="/master/schools/new" className="btn-3d btn-primary">
          + New School
        </Link>
      </div>

      {/* Schools Grid */}
      {schools.length === 0 ? (
        <div className="ice-block p-12 text-center">
          <svg
            className="w-16 h-16 mx-auto text-[var(--text-muted)] mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No schools yet
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            Create your first school to get started
          </p>
          <Link href="/master/schools/new" className="btn-3d btn-primary">
            Create School
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {schools.map((school) => (
            <div key={school.id} className="glass-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg"
                  style={{
                    background: `linear-gradient(135deg, ${school.primaryColor}, ${school.primaryColor}dd)`,
                    boxShadow: `0 0 20px ${school.primaryColor}40`,
                  }}
                >
                  {school.name.charAt(0)}
                </div>
                <span
                  className={`badge ${
                    school.isActive ? 'badge-present' : 'badge-pending'
                  }`}
                >
                  {school.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-1">
                {school.name}
              </h3>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                /{school.slug}
              </p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-muted)]">
                  {school._count.users} users
                </span>
                <span className="badge badge-graded">
                  {school.subscriptionTier}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-[var(--glass-border)] flex gap-2">
                <Link
                  href={`/master/schools/${school.id}`}
                  className="flex-1 text-center px-3 py-2 rounded-xl bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-light)] transition-all text-sm font-medium"
                >
                  Manage
                </Link>
                <Link
                  href={`/master/schools/${school.id}/billing`}
                  className="flex-1 text-center px-3 py-2 rounded-xl bg-[var(--glass-bg)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-light)] transition-all text-sm font-medium"
                >
                  Billing
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
