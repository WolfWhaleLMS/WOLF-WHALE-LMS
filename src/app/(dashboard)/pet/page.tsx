'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Tamagotchi from '@/components/Tamagotchi';
import { useDemoSession } from '@/components/DemoSessionProvider';

export default function PetPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo && status === 'unauthenticated') {
      router.push('/login');
    } else if (!isDemo && status === 'authenticated' && session?.user?.role !== 'STUDENT') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, isDemoLoading]);

  if (isDemoLoading || (!isDemo && status === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Header */}
      <div className="ice-block p-6 text-center">
        <h1 className="text-2xl font-bold text-[var(--evergreen)] mb-2">My Pet</h1>
        <p className="text-[var(--text-muted)]">
          Take care of your virtual companion! Feed and play with your pet to keep them happy.
        </p>
      </div>

      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode</p>
              <p className="text-sm text-[var(--text-muted)]">Your pet progress is saved locally during this session</p>
            </div>
          </div>
        </div>
      )}

      {/* Tamagotchi Component */}
      <Tamagotchi isDemo={isDemo} />

      {/* Tips Section */}
      <div className="ice-block p-5">
        <h3 className="font-bold text-[var(--evergreen)] mb-3">Pet Care Tips</h3>
        <div className="space-y-2 text-sm text-[var(--text-secondary)]">
          <div className="flex items-start gap-2">
            <span>🍖</span>
            <p><strong>Feed</strong> your pet to restore hunger (+30) and earn XP (+10)</p>
          </div>
          <div className="flex items-start gap-2">
            <span>🎾</span>
            <p><strong>Play</strong> with your pet to boost happiness (+25) and earn XP (+15)</p>
          </div>
          <div className="flex items-start gap-2">
            <span>⭐</span>
            <p>Level up by earning XP! Each level needs (level x 100) XP</p>
          </div>
          <div className="flex items-start gap-2">
            <span>⚙️</span>
            <p>Click the gear icon to rename your pet or change their type</p>
          </div>
        </div>
      </div>
    </div>
  );
}
