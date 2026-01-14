'use client';

import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import Button from './Button';

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

interface SubscriptionButtonProps {
  schoolId: string;
  tier: 'STARTER' | 'PRO' | 'ENTERPRISE';
  currentTier?: string;
  className?: string;
}

const TIER_DISPLAY = {
  STARTER: {
    name: 'Starter',
    price: '$49/mo',
    color: 'primary',
  },
  PRO: {
    name: 'Pro',
    price: '$149/mo',
    color: 'accent',
  },
  ENTERPRISE: {
    name: 'Enterprise',
    price: '$499/mo',
    color: 'gold',
  },
} as const;

export default function SubscriptionButton({
  schoolId,
  tier,
  currentTier,
  className = '',
}: SubscriptionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tierInfo = TIER_DISPLAY[tier];
  const isCurrentTier = currentTier === tier;
  const isUpgrade = !currentTier || currentTier === 'FREE' ||
    (currentTier === 'STARTER' && (tier === 'PRO' || tier === 'ENTERPRISE')) ||
    (currentTier === 'PRO' && tier === 'ENTERPRISE');

  const handleSubscribe = async () => {
    if (isCurrentTier) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          schoolId,
          tier,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe && data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={className}>
      <Button
        variant={tierInfo.color as 'primary' | 'accent' | 'gold'}
        onClick={handleSubscribe}
        isLoading={isLoading}
        disabled={isCurrentTier}
        soundType="submit"
        className="w-full"
      >
        {isCurrentTier ? (
          'Current Plan'
        ) : isUpgrade ? (
          <>Upgrade to {tierInfo.name}</>
        ) : (
          <>Switch to {tierInfo.name}</>
        )}
      </Button>
      {error && (
        <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}

// Pricing Card Component for displaying subscription options
export function PricingCard({
  tier,
  schoolId,
  currentTier,
  features,
}: {
  tier: 'FREE' | 'STARTER' | 'PRO' | 'ENTERPRISE';
  schoolId?: string;
  currentTier?: string;
  features: string[];
}) {
  const isCurrentTier = currentTier === tier;
  const isFree = tier === 'FREE';

  const tierStyles = {
    FREE: {
      gradient: 'from-gray-400 to-gray-500',
      glow: 'none',
      price: 'Free',
      name: 'Free',
    },
    STARTER: {
      gradient: 'from-[var(--accent-blue)] to-[var(--accent-purple)]',
      glow: 'var(--accent-glow)',
      price: '$49',
      name: 'Starter',
    },
    PRO: {
      gradient: 'from-[var(--accent-cyan)] to-[var(--accent-blue)]',
      glow: 'var(--accent-glow-cyan)',
      price: '$149',
      name: 'Pro',
    },
    ENTERPRISE: {
      gradient: 'from-[var(--gold-start)] to-[var(--gold-end)]',
      glow: 'var(--gold-glow)',
      price: '$499',
      name: 'Enterprise',
    },
  };

  const style = tierStyles[tier];

  return (
    <div
      className={`ice-block p-6 flex flex-col ${
        isCurrentTier ? 'ring-2 ring-[var(--accent-blue)]' : ''
      }`}
      style={{ boxShadow: isCurrentTier ? style.glow : undefined }}
    >
      {/* Header */}
      <div className="text-center mb-6">
        <h3
          className={`text-xl font-bold bg-gradient-to-r ${style.gradient} bg-clip-text text-transparent`}
        >
          {style.name}
        </h3>
        <div className="mt-2">
          <span className="text-3xl font-bold text-[var(--text-primary)]">
            {style.price}
          </span>
          {!isFree && <span className="text-[var(--text-muted)]">/month</span>}
        </div>
        {isCurrentTier && (
          <span className="inline-block mt-2 text-xs font-medium text-[var(--accent-blue)] bg-[var(--glass-bg)] px-3 py-1 rounded-full border border-[var(--glass-border)]">
            Current Plan
          </span>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-3 mb-6 flex-1">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <svg
              className={`w-5 h-5 flex-shrink-0 ${
                isFree ? 'text-gray-400' : 'text-[var(--accent-cyan)]'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span className="text-[var(--text-secondary)]">{feature}</span>
          </li>
        ))}
      </ul>

      {/* Action */}
      {schoolId && !isFree && (
        <SubscriptionButton
          schoolId={schoolId}
          tier={tier as 'STARTER' | 'PRO' | 'ENTERPRISE'}
          currentTier={currentTier}
        />
      )}
      {isFree && isCurrentTier && (
        <div className="text-center text-sm text-[var(--text-muted)]">
          Upgrade to unlock more features
        </div>
      )}
    </div>
  );
}
