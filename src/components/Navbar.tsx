'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useState } from 'react';
import XPBar from './XPBar';
import { useDemoSession } from './DemoSessionProvider';

export default function Navbar() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading, clearDemoSession } = useDemoSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Use demo user if in demo mode, otherwise real session
  const currentUser = isDemo && demoUser ? {
    firstName: demoUser.firstName,
    lastName: demoUser.lastName,
    name: demoUser.name,
    email: demoUser.email,
    role: demoUser.role,
    xp: demoUser.xp,
    level: demoUser.level,
  } : session?.user;

  // Consider logged in if demo mode active OR real session exists
  // Wait for both demo loading and auth status to resolve
  const isLoading = isDemoLoading || status === 'loading';
  const isLoggedIn = !isLoading && (isDemo || !!session);

  const roleLinks: Record<string, Array<{ href: string; label: string }>> = {
    MASTER: [
      { href: '/master', label: 'Dashboard' },
      { href: '/master/schools', label: 'Schools' },
      { href: '/master/admins', label: 'Admins' },
      { href: '/admin/reports', label: 'Reports' },
      { href: '/resources', label: 'Resources' },
    ],
    STUDENT: [
      { href: '/dashboard', label: 'Dashboard' },
      { href: '/courses', label: 'Courses' },
      { href: '/pet', label: 'My Pet' },
      { href: '/resources', label: 'Resources' },
      { href: '/calendar', label: 'Calendar' },
    ],
    TEACHER: [
      { href: '/teacher/dashboard', label: 'Dashboard' },
      { href: '/teacher/courses', label: 'Courses' },
      { href: '/teacher/gradebook', label: 'Gradebook' },
      { href: '/teacher/attendance', label: 'Attendance' },
      { href: '/resources', label: 'Resources' },
    ],
    PARENT: [
      { href: '/parent/dashboard', label: 'Dashboard' },
      { href: '/parent/grades', label: 'Grades' },
      { href: '/parent/attendance', label: 'Attendance' },
      { href: '/resources', label: 'Resources' },
    ],
    ADMIN: [
      { href: '/admin/dashboard', label: 'Dashboard' },
      { href: '/admin/users', label: 'Users' },
      { href: '/admin/courses', label: 'Courses' },
      { href: '/admin/reports', label: 'Reports' },
      { href: '/resources', label: 'Resources' },
    ],
  };

  const links = currentUser?.role ? roleLinks[currentUser.role] || roleLinks.STUDENT : [];

  const handleSignOut = () => {
    if (isDemo) {
      clearDemoSession();
    } else {
      signOut({ callbackUrl: '/' });
    }
  };

  return (
    <nav className="nav-glass px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo - Wolf Whale Branding with Glass/Glow Style */}
        <Link href={isLoggedIn ? '/dashboard' : '/'} className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg border border-white/30 group-hover:scale-105 transition-transform" style={{ boxShadow: 'var(--accent-glow)' }}>
            <span className="text-xl">🐋</span>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">Wolf Whale</span>
        </Link>

        {/* Demo Mode Badge - Glass Style */}
        {isDemo && (
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--glass-bg)] border border-[var(--glass-border)]" style={{ boxShadow: 'var(--accent-glow)' }}>
            <span className="text-[var(--accent-blue)] text-xs font-semibold">Demo Mode</span>
          </div>
        )}

        {/* Desktop Navigation */}
        {!isLoading && isLoggedIn && (
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--glass-bg)] font-medium transition-all border border-transparent hover:border-[var(--glass-border-light)] hover:shadow-[var(--accent-glow)]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-3">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-[var(--glass-bg)] animate-pulse"></div>
          ) : isLoggedIn && currentUser ? (
            <>
              {/* XP Bar for Students */}
              {currentUser.role === 'STUDENT' && (
                <div className="hidden lg:block w-48">
                  <XPBar xp={currentUser.xp || 0} level={currentUser.level || 1} compact />
                </div>
              )}

              {/* Quick Actions - Glass Style */}
              <Link href="/calendar" className="p-2 rounded-xl hover:bg-[var(--glass-bg)] transition-all border border-transparent hover:border-[var(--glass-border-light)] hover:shadow-[var(--accent-glow)]">
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </Link>
              <Link href="/inbox" className="p-2 rounded-xl hover:bg-[var(--glass-bg)] transition-all border border-transparent hover:border-[var(--glass-border-light)] hover:shadow-[var(--accent-glow)] relative">
                <svg className="w-5 h-5 text-[var(--text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </Link>

              {/* User Menu - Glass Style */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--glass-bg)] transition-all border border-transparent hover:border-[var(--glass-border-light)] hover:shadow-[var(--accent-glow)]"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center border border-white/40" style={{ boxShadow: 'var(--accent-glow)' }}>
                    <span className="text-white font-medium text-sm">
                      {currentUser.firstName?.[0]}{currentUser.lastName?.[0]}
                    </span>
                  </div>
                  <span className="hidden sm:block text-sm font-semibold text-[var(--text-primary)]">
                    {currentUser.firstName}
                  </span>
                  <span className="badge badge-graded text-xs">{currentUser.role}</span>
                  {isDemo && <span className="text-[var(--accent-cyan)] text-xs font-medium">(Demo)</span>}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 ice-block rounded-xl shadow-lg py-2 z-50">
                    <div className="px-4 py-3 border-b border-[var(--glass-border)]">
                      <p className="font-bold text-[var(--text-primary)]">{currentUser.name}</p>
                      <p className="text-sm text-[var(--text-muted)]">{currentUser.email}</p>
                      {isDemo && (
                        <p className="text-xs text-[var(--accent-cyan)] mt-1 font-medium">Demo Account</p>
                      )}
                    </div>
                    {!isDemo && (
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] font-medium"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                    )}
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-red-500 hover:bg-red-50/50 font-medium"
                    >
                      {isDemo ? 'Exit Demo' : 'Sign Out'}
                    </button>
                  </div>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-xl hover:bg-[var(--glass-bg)] border border-transparent hover:border-[var(--glass-border-light)]"
              >
                <svg className="w-6 h-6 text-[var(--text-primary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="btn-3d btn-primary">
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu - Glass Style */}
      {isMenuOpen && isLoggedIn && (
        <div className="md:hidden mt-4 pb-4 border-t border-[var(--glass-border)] pt-4">
          {isDemo && (
            <div className="mx-4 mb-4 px-3 py-2 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]" style={{ boxShadow: 'var(--accent-glow)' }}>
              <span className="text-[var(--accent-blue)] text-sm font-semibold">Demo Mode Active</span>
            </div>
          )}
          <div className="space-y-1 px-2">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--glass-bg)] hover:text-[var(--text-primary)] font-medium border border-transparent hover:border-[var(--glass-border-light)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
          {currentUser?.role === 'STUDENT' && (
            <div className="mt-4 px-4">
              <XPBar xp={currentUser.xp || 0} level={currentUser.level || 1} compact />
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
