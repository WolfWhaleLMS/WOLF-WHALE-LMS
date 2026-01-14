import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

async function getAdmins() {
  return prisma.user.findMany({
    where: { role: 'ADMIN' },
    orderBy: { createdAt: 'desc' },
    include: {
      school: {
        select: {
          id: true,
          name: true,
          slug: true,
        }
      }
    }
  });
}

export default async function AdminsListPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'MASTER') {
    redirect('/login');
  }

  const admins = await getAdmins();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Administrators</h1>
          <p className="text-[var(--text-muted)] mt-1">
            Manage all school administrators
          </p>
        </div>
        <Link href="/master/admins/new" className="btn-3d btn-primary">
          + New Admin
        </Link>
      </div>

      {/* Admins Table */}
      {admins.length === 0 ? (
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
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          </svg>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            No administrators yet
          </h3>
          <p className="text-[var(--text-muted)] mb-6">
            Create an admin to manage a school
          </p>
          <Link href="/master/admins/new" className="btn-3d btn-primary">
            Create Admin
          </Link>
        </div>
      ) : (
        <div className="ice-block overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Administrator</th>
                <th>Email</th>
                <th>School</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-white font-medium"
                        style={{ boxShadow: 'var(--accent-glow)' }}
                      >
                        {admin.firstName[0]}
                        {admin.lastName[0]}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text-primary)]">
                          {admin.firstName} {admin.lastName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="text-[var(--text-secondary)]">{admin.email}</td>
                  <td>
                    {admin.school ? (
                      <Link
                        href={`/master/schools/${admin.school.id}`}
                        className="text-[var(--accent-blue)] hover:underline"
                      >
                        {admin.school.name}
                      </Link>
                    ) : (
                      <span className="text-[var(--text-muted)]">Unassigned</span>
                    )}
                  </td>
                  <td className="text-[var(--text-muted)]">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="text-sm text-[var(--accent-blue)] hover:underline">
                      Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
