'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';
import { useDemoSession } from '@/components/DemoSessionProvider';

// Demo accounts for quick access (mock data mode)
const DEMO_ACCOUNTS = [
  { role: 'Student', email: 'emma.j@demo.local', icon: '🎓', desc: 'View courses & assignments' },
  { role: 'Teacher', email: 'mwilson@demo.local', icon: '👨‍🏫', desc: 'Manage your classes' },
  { role: 'Parent', email: 'robert.j@demo.local', icon: '👨‍👩‍👧', desc: 'Track your child' },
  { role: 'Admin', email: 'admin@demo.local', icon: '🛡️', desc: 'School administration' },
];

// Demo session data for each role
const DEMO_SESSIONS = {
  Student: {
    id: 'demo-student-1',
    email: 'emma.j@demo.local',
    firstName: 'Emma',
    lastName: 'Johnson',
    name: 'Emma Johnson',
    role: 'STUDENT' as const,
    xp: 2450,
    level: 3,
    streak: 7,
  },
  Teacher: {
    id: 'demo-teacher-1',
    email: 'mwilson@demo.local',
    firstName: 'Margaret',
    lastName: 'Wilson',
    name: 'Margaret Wilson',
    role: 'TEACHER' as const,
    xp: 0,
    level: 1,
    streak: 0,
  },
  Parent: {
    id: 'demo-parent-1',
    email: 'robert.j@demo.local',
    firstName: 'Robert',
    lastName: 'Johnson',
    name: 'Robert Johnson',
    role: 'PARENT' as const,
    xp: 0,
    level: 1,
    streak: 0,
    children: [{ id: 'demo-student-1', name: 'Emma Johnson' }],
  },
  Admin: {
    id: 'demo-admin-1',
    email: 'admin@demo.local',
    firstName: 'School',
    lastName: 'Admin',
    name: 'School Admin',
    role: 'ADMIN' as const,
    xp: 0,
    level: 1,
    streak: 0,
  },
};

const REDIRECT_PATHS: Record<string, string> = {
  Student: '/dashboard',
  Teacher: '/teacher/dashboard',
  Parent: '/parent/dashboard',
  Admin: '/admin/dashboard',
};

export default function LoginPage() {
  const router = useRouter();
  const { setDemoSession } = useDemoSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Real login with database
  const handleRealLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        setIsLoading(false);
      } else if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      }
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  // Demo login with mock data
  const handleDemoLogin = (role: string) => {
    setIsDemoLoading(role);
    setError('');

    const demoUser = DEMO_SESSIONS[role as keyof typeof DEMO_SESSIONS];

    // Set demo session in context (this also updates localStorage)
    setDemoSession(demoUser);

    // Small delay for visual feedback, then navigate
    setTimeout(() => {
      router.push(REDIRECT_PATHS[role]);
    }, 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo - Wolf Whale Branding */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--evergreen)] to-[var(--evergreen-light)] flex items-center justify-center shadow-lg border-2 border-white/30 group-hover:scale-105 transition-transform">
              <span className="text-3xl">🐋</span>
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold gradient-text">Wolf Whale</span>
              <p className="text-xs text-[var(--text-muted)] -mt-0.5">Learning Management System</p>
            </div>
          </Link>
        </div>

        {/* Login Card - Frosted Ice Block */}
        <div className="ice-block p-8">
          <h1 className="text-2xl font-bold text-[var(--evergreen)] text-center mb-2">Welcome Back!</h1>
          <p className="text-[var(--text-muted)] text-center mb-6">Sign in to continue your learning journey</p>

          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50/80 border-2 border-red-200/50 text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Staff Login Form */}
          <form onSubmit={handleRealLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="input-label">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@school.local"
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="input-label">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                autoComplete="current-password"
              />
            </div>

            <Button type="submit" className="w-full btn-3d btn-primary" isLoading={isLoading}>
              Staff Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-[var(--frost-border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white/80 text-[var(--text-muted)] rounded-full font-medium">
                or explore the demo
              </span>
            </div>
          </div>

          {/* Demo Login Buttons - Frosted Ice Style */}
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-secondary)] text-center mb-4 font-medium">
              Saskatchewan Grade 10 Sample Data
            </p>
            <div className="grid grid-cols-2 gap-3">
              {DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.role}
                  type="button"
                  onClick={() => handleDemoLogin(demo.role)}
                  disabled={isDemoLoading !== null}
                  className={`
                    relative flex flex-col items-center gap-1 px-4 py-4 rounded-xl
                    bg-gradient-to-br from-white/90 to-[var(--ice-blue)]/80
                    border-2 border-[var(--frost-border)]
                    hover:border-[var(--evergreen-light)]/50
                    hover:shadow-[var(--frost-glow)]
                    transition-all duration-200
                    text-sm font-semibold text-[var(--evergreen)]
                    disabled:opacity-50 disabled:cursor-not-allowed
                    overflow-hidden
                    ${isDemoLoading === demo.role ? 'animate-pulse border-[var(--aurora-green)]' : ''}
                  `}
                >
                  <span className="text-2xl mb-1">{demo.icon}</span>
                  <span className="font-bold">{demo.role}</span>
                  <span className="text-[10px] text-[var(--text-muted)] font-normal">{demo.desc}</span>
                  {isDemoLoading === demo.role && (
                    <div className="absolute inset-0 bg-[var(--ice-blue)]/50 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-[var(--evergreen)] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t-2 border-[var(--frost-border)]">
            <p className="text-xs text-[var(--text-muted)] text-center">
              Staff accounts are created by administrators.<br />
              Contact your school admin for access.
            </p>
          </div>
        </div>

        {/* Bottom Branding */}
        <p className="text-center text-xs text-[var(--text-muted)] mt-6 font-medium">
          Wolf Whale LMS — Saskatchewan Curriculum
        </p>
      </div>
    </div>
  );
}
