'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useDemoSession } from '@/components/DemoSessionProvider';
import Button from '@/components/Button';
import { PRICE_PER_USER_CAD } from '@/lib/stripe';

interface SchoolData {
  id: string;
  name: string;
  subscriptionTier: string;
  stripeCustomerId: string | null;
  maxUsers: number;
  maxCourses: number;
  _count: {
    users: number;
  };
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [school, setSchool] = useState<SchoolData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [error, setError] = useState('');

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  useEffect(() => {
    async function fetchSchool() {
      if (!isLoggedIn || !currentUser) return;

      // In demo mode, show sample data
      if (isDemo) {
        setSchool({
          id: 'demo-school',
          name: 'Demo School',
          subscriptionTier: 'PAID',
          stripeCustomerId: null,
          maxUsers: 50,
          maxCourses: 999999,
          _count: { users: 45 },
        });
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/school');
        if (response.ok) {
          const data = await response.json();
          setSchool(data);
        } else {
          setError('Failed to load school data');
        }
      } catch {
        setError('Failed to load school data');
      } finally {
        setIsLoading(false);
      }
    }

    if (isLoggedIn && currentUser) {
      fetchSchool();
    }
  }, [isLoggedIn, currentUser, isDemo]);

  const handleManageSubscription = async () => {
    if (!school || !school.stripeCustomerId || isDemo) return;

    setIsPortalLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schoolId: school.id }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to open subscription management');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (isDemoLoading || (!isDemo && status === 'loading') || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const monthlyPrice = school ? school.maxUsers * PRICE_PER_USER_CAD : 0;
  const usagePercent = school ? Math.round((school._count.users / school.maxUsers) * 100) : 0;
  const isActive = school?.subscriptionTier === 'PAID' && school?.stripeCustomerId;
  const isCanceled = school?.subscriptionTier === 'CANCELED';

  return (
    <div className="space-y-8">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">Demo Mode</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Subscription Management</p>
              <p className="text-sm text-[var(--text-muted)]">Subscription features are disabled in demo mode</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ice-block p-6">
        <h1 className="text-2xl font-bold text-[var(--evergreen)]">Subscription Management</h1>
        <p className="text-[var(--text-muted)] mt-1">Manage your school&apos;s user licenses</p>
      </div>

      {error && (
        <div className="ice-block p-4 border-red-500/30 bg-red-500/10">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Canceled Warning */}
      {isCanceled && (
        <div className="ice-block p-6 border-red-500/30 bg-red-500/10">
          <div className="flex items-center gap-3">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="font-semibold text-red-600">Subscription Canceled</p>
              <p className="text-sm text-red-500">
                Your subscription has been canceled. You cannot add new users until you resubscribe.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan Overview */}
      {school && (
        <div className="ice-block p-6">
          <h2 className="text-xl font-bold text-[var(--evergreen)] mb-4">Current Plan</h2>

          {/* Usage Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <div className="text-sm text-[var(--text-muted)]">Status</div>
              <div className={`text-xl font-bold ${isActive ? 'text-[var(--aurora-green)]' : isCanceled ? 'text-red-500' : 'text-[var(--text-muted)]'}`}>
                {isActive ? 'Active' : isCanceled ? 'Canceled' : 'Inactive'}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <div className="text-sm text-[var(--text-muted)]">User Licenses</div>
              <div className="text-xl font-bold text-[var(--evergreen)]">
                {school.maxUsers.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <div className="text-sm text-[var(--text-muted)]">Users Active</div>
              <div className="text-xl font-bold text-[var(--evergreen)]">
                {school._count.users.toLocaleString()}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <div className="text-sm text-[var(--text-muted)]">Monthly Cost</div>
              <div className="text-xl font-bold text-[var(--evergreen)]">
                ${monthlyPrice.toLocaleString()} CAD
              </div>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-[var(--text-secondary)]">User License Usage</span>
              <span className="text-sm text-[var(--text-muted)]">
                {school._count.users} / {school.maxUsers} ({usagePercent}%)
              </span>
            </div>
            <div className="h-4 bg-[var(--ice-blue)]/30 rounded-full overflow-hidden border border-[var(--frost-border-light)]">
              <div
                className={`h-full rounded-full transition-all ${
                  usagePercent >= 90 ? 'bg-red-500' : usagePercent >= 70 ? 'bg-yellow-500' : 'bg-[var(--aurora-green)]'
                }`}
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
            {usagePercent >= 90 && (
              <p className="text-sm text-red-500 mt-2">
                You&apos;re approaching your user limit. Consider adding more licenses.
              </p>
            )}
          </div>

          {/* Pricing Info */}
          <div className="p-4 rounded-xl bg-[var(--ice-blue)]/30 border border-[var(--frost-border-light)] mb-6">
            <div className="flex items-center gap-3">
              <div className="text-3xl">💰</div>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">
                  ${PRICE_PER_USER_CAD} CAD per user/month
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  Unlimited courses included. Adjust your user count anytime via the Stripe portal.
                </p>
              </div>
            </div>
          </div>

          {/* Manage Subscription Button */}
          {school.stripeCustomerId && !isDemo && (
            <div>
              <Button
                variant="primary"
                onClick={handleManageSubscription}
                isLoading={isPortalLoading}
                soundType="navigate"
              >
                Manage Subscription
              </Button>
              <p className="text-sm text-[var(--text-muted)] mt-2">
                Adjust user licenses, update payment method, view invoices, or cancel
              </p>
            </div>
          )}
        </div>
      )}

      {/* What&apos;s Included */}
      <div className="ice-block p-6">
        <h2 className="text-xl font-bold text-[var(--evergreen)] mb-4">What&apos;s Included</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { icon: '📚', title: 'Unlimited Courses', desc: 'Create as many courses as you need' },
            { icon: '🎮', title: 'Gamification', desc: 'XP, levels, badges, and streaks' },
            { icon: '📊', title: 'Analytics', desc: 'Track student progress and engagement' },
            { icon: '👨‍👩‍👧', title: 'Parent Portal', desc: 'Keep parents informed and connected' },
            { icon: '💬', title: 'Messaging', desc: 'Built-in communication tools' },
            { icon: '📅', title: 'Calendar', desc: 'Schedule assignments and events' },
            { icon: '🎨', title: 'Custom Branding', desc: 'Your school&apos;s logo and colors' },
            { icon: '📤', title: 'Data Export', desc: 'Export your data anytime' },
          ].map((feature, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
              <span className="text-2xl">{feature.icon}</span>
              <div>
                <p className="font-semibold text-[var(--text-primary)]">{feature.title}</p>
                <p className="text-sm text-[var(--text-muted)]">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="ice-block p-6">
        <h2 className="text-xl font-bold text-[var(--evergreen)] mb-4">Frequently Asked Questions</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
            <h3 className="font-semibold text-[var(--evergreen)]">How do I add more users?</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Click &quot;Manage Subscription&quot; to access the Stripe portal. There you can adjust your user license quantity. Changes are prorated automatically.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
            <h3 className="font-semibold text-[var(--evergreen)]">What happens if I exceed my user limit?</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              You won&apos;t be able to add new users until you increase your license count. Existing users will continue to have access.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
            <h3 className="font-semibold text-[var(--evergreen)]">Can I reduce my user count?</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Yes, you can reduce your user count in the Stripe portal. If you reduce below your current active users, you&apos;ll need to deactivate some accounts first.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)]">
            <h3 className="font-semibold text-[var(--evergreen)]">How do I cancel my subscription?</h3>
            <p className="text-sm text-[var(--text-muted)] mt-1">
              Click &quot;Manage Subscription&quot; to access the Stripe portal where you can cancel. You&apos;ll retain access until the end of your billing period.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
