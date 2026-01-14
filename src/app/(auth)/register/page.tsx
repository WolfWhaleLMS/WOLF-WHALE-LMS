'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface SessionData {
  id: string;
  status: string;
  customer_email: string | null;
  metadata: {
    quantity: string;
    isNewSignup: string;
  };
  customer: string | null;
  subscription: string | null;
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-cyan)] mx-auto mb-4"></div>
        <p className="text-[var(--text-secondary)]">Loading...</p>
      </div>
    </div>
  );
}

function RegisterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get('session_id');

  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(!!sessionId);
  const [sessionError, setSessionError] = useState('');

  const [schoolName, setSchoolName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch session data if session_id is present
  useEffect(() => {
    async function fetchSession() {
      if (!sessionId) return;

      try {
        const response = await fetch(`/api/stripe/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to verify payment');
        }

        if (data.status !== 'complete') {
          throw new Error('Payment not completed. Please try again.');
        }

        setSessionData(data);
        if (data.customer_email) {
          setEmail(data.customer_email);
        }
      } catch (err) {
        setSessionError(err instanceof Error ? err.message : 'Failed to verify payment');
      } finally {
        setIsLoadingSession(false);
      }
    }

    fetchSession();
  }, [sessionId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    // Validation
    if (!schoolName.trim()) {
      setSubmitError('School name is required');
      return;
    }
    if (!email.trim()) {
      setSubmitError('Email is required');
      return;
    }
    if (!firstName.trim() || !lastName.trim()) {
      setSubmitError('First and last name are required');
      return;
    }
    if (password.length < 8) {
      setSubmitError('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setSubmitError('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/auth/register-school', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          schoolName,
          email,
          password,
          firstName,
          lastName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create account');
      }

      setSuccess(true);
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login?registered=true');
      }, 2000);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // No session_id - show registration disabled
  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg border border-white/30">
                <span className="text-xl">🐋</span>
              </div>
              <span className="text-2xl font-bold gradient-text">Wolf Whale</span>
            </Link>
          </div>

          {/* Registration Disabled Card */}
          <div className="ice-block p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--ice-blue)] flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Get Started</h1>
            <p className="text-[var(--text-secondary)] mb-6">
              To create a new school account, please select a plan on our pricing page.
            </p>

            <div className="p-4 bg-[var(--ice-blue)]/50 rounded-lg mb-6 border border-[var(--frost-border-light)]">
              <p className="text-sm text-[var(--text-secondary)]">
                <strong>Already have an account?</strong> Sign in with your existing credentials.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/#pricing" className="btn-3d btn-primary">
                View Pricing
              </Link>
              <Link href="/login" className="btn-3d btn-secondary">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading session
  if (isLoadingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-cyan)] mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">Verifying your payment...</p>
        </div>
      </div>
    );
  }

  // Session error
  if (sessionError) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="ice-block p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Payment Verification Failed</h1>
            <p className="text-[var(--text-secondary)] mb-6">{sessionError}</p>
            <Link href="/#pricing" className="btn-3d btn-primary">
              Try Again
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="ice-block p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--aurora-green)]/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--aurora-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Account Created!</h1>
            <p className="text-[var(--text-secondary)] mb-4">
              Your school has been set up successfully. Redirecting to login...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[var(--accent-cyan)] mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Registration form
  const quantity = sessionData?.metadata?.quantity ? parseInt(sessionData.metadata.quantity) : 0;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg border border-white/30">
              <span className="text-xl">🐋</span>
            </div>
            <span className="text-2xl font-bold gradient-text">Wolf Whale</span>
          </Link>
        </div>

        {/* Payment Confirmed Banner */}
        <div className="ice-block p-4 mb-6 border-[var(--aurora-green)]/30 bg-[var(--aurora-green)]/10">
          <div className="flex items-center gap-3">
            <svg className="w-6 h-6 text-[var(--aurora-green)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div>
              <p className="font-semibold text-[var(--text-primary)]">Payment Confirmed</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {quantity} user license{quantity !== 1 ? 's' : ''} purchased
              </p>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="ice-block p-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Set Up Your School</h1>
          <p className="text-[var(--text-secondary)] mb-6">
            Create your admin account to get started.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* School Name */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                School Name
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                placeholder="e.g., Saskatoon High School"
                required
              />
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                  placeholder="Smith"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                placeholder="admin@school.ca"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                placeholder="Min. 8 characters"
                required
                minLength={8}
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-[var(--text-primary)] mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                placeholder="Confirm your password"
                required
              />
            </div>

            {/* Error Message */}
            {submitError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-sm">
                {submitError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full btn-3d btn-primary py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RegisterContent />
    </Suspense>
  );
}
