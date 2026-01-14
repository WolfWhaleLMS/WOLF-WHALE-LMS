'use client';

import { useState } from 'react';
import { PRICE_PER_USER_CAD } from '@/lib/stripe';

export default function PricingSection() {
  const [userCount, setUserCount] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const monthlyPrice = userCount * PRICE_PER_USER_CAD;
  const yearlyPrice = monthlyPrice * 12;
  const savingsPerUser = 0; // Could add annual discount logic here

  const handleBuyNow = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout-public', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: userCount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Slider tick marks
  const tickMarks = [1, 50, 100, 250, 500, 1000];

  return (
    <section id="pricing" className="py-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Simple, <span className="gradient-text-aurora">Transparent Pricing</span>
          </h2>
          <p className="text-xl text-[var(--text-secondary)]">
            Pay only for what you need. No hidden fees.
          </p>
        </div>

        <div className="ice-block p-8 md:p-12">
          {/* Price Display */}
          <div className="text-center mb-8">
            <div className="inline-flex items-baseline gap-2">
              <span className="text-6xl md:text-7xl font-bold gradient-text">${monthlyPrice}</span>
              <span className="text-2xl text-[var(--text-muted)]">CAD/mo</span>
            </div>
            <p className="text-[var(--text-secondary)] mt-2">
              ${PRICE_PER_USER_CAD} per user/month
            </p>
          </div>

          {/* User Count Slider */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <label className="text-lg font-semibold text-[var(--text-primary)]">
                Number of Users
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={userCount}
                  onChange={(e) => {
                    const val = Math.min(1000, Math.max(1, parseInt(e.target.value) || 1));
                    setUserCount(val);
                  }}
                  className="w-24 px-3 py-2 rounded-lg bg-white/50 border border-[var(--frost-border-light)] text-center font-bold text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-cyan)]"
                  min={1}
                  max={1000}
                />
                <span className="text-[var(--text-muted)]">users</span>
              </div>
            </div>

            {/* Slider */}
            <div className="relative">
              <input
                type="range"
                min={1}
                max={1000}
                value={userCount}
                onChange={(e) => setUserCount(parseInt(e.target.value))}
                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-cyan)] to-[var(--accent-purple)]"
                style={{
                  background: `linear-gradient(to right, var(--accent-cyan) 0%, var(--accent-cyan) ${(userCount / 1000) * 100}%, var(--frost-border-light) ${(userCount / 1000) * 100}%, var(--frost-border-light) 100%)`,
                }}
              />
              {/* Tick marks */}
              <div className="flex justify-between mt-2 text-xs text-[var(--text-muted)]">
                {tickMarks.map((tick) => (
                  <button
                    key={tick}
                    onClick={() => setUserCount(tick)}
                    className="hover:text-[var(--accent-cyan)] transition-colors"
                  >
                    {tick}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)] text-center">
              <div className="text-sm text-[var(--text-muted)]">Monthly</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">${monthlyPrice} CAD</div>
            </div>
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)] text-center">
              <div className="text-sm text-[var(--text-muted)]">Yearly</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">${yearlyPrice} CAD</div>
            </div>
            <div className="p-4 rounded-xl bg-white/50 border border-[var(--frost-border-light)] text-center">
              <div className="text-sm text-[var(--text-muted)]">Per User</div>
              <div className="text-xl font-bold text-[var(--text-primary)]">${PRICE_PER_USER_CAD}/mo</div>
            </div>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4">Everything included:</h3>
            <ul className="grid md:grid-cols-2 gap-3">
              {[
                'Unlimited courses',
                'Full SK curriculum',
                'Gamification features',
                'Parent portal',
                'Analytics & reports',
                'Email support',
                'Custom branding',
                'Data export',
              ].map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--accent-cyan)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-[var(--text-secondary)]">{feature}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-center">
              {error}
            </div>
          )}

          {/* CTA Button */}
          <button
            onClick={handleBuyNow}
            disabled={isLoading}
            className="w-full btn-3d btn-primary py-4 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              `Get Started - $${monthlyPrice} CAD/mo`
            )}
          </button>

          <p className="text-center text-sm text-[var(--text-muted)] mt-4">
            Secure payment via Stripe. Cancel anytime.
          </p>
        </div>

        {/* Enterprise callout */}
        <div className="mt-8 text-center">
          <p className="text-[var(--text-secondary)]">
            Need more than 1,000 users?{' '}
            <a href="mailto:contact@wolfwhale.ca" className="text-[var(--accent-cyan)] hover:underline">
              Contact us for enterprise pricing
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
