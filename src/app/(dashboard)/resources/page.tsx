'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useDemoSession } from '@/components/DemoSessionProvider';
import HistoryTimeline from '@/components/resources/HistoryTimeline';
import TreatyMap from '@/components/resources/TreatyMap';

type ViewType = 'dashboard' | 'timeline' | 'treaties';

export default function ResourcesPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, isDemo, isDemoLoading]);

  if (isDemoLoading || (!isDemo && status === 'loading')) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  // Render Timeline view
  if (currentView === 'timeline') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--evergreen)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resources
        </button>
        <HistoryTimeline />
      </div>
    );
  }

  // Render Treaties Map view
  if (currentView === 'treaties') {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--evergreen)] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Resources
        </button>
        <TreatyMap />
      </div>
    );
  }

  // Resources Dashboard
  return (
    <div className="space-y-8">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Indigenous Education Resources</p>
              <p className="text-sm text-[var(--text-muted)]">Explore interactive learning tools</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="ice-block p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[var(--evergreen)]">Indigenous Education Resources</h1>
            <p className="text-[var(--text-muted)] mt-2">
              Interactive tools for learning about Indigenous history, treaties, and reconciliation in Canada
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-graded">Educational</span>
            <span className="badge badge-pending">Interactive</span>
          </div>
        </div>
      </div>

      {/* Land Acknowledgement */}
      <div className="glass-card p-6 border-l-4 border-[var(--aurora-green)]">
        <div className="flex items-start gap-4">
          <div className="text-3xl">🌿</div>
          <div>
            <h3 className="font-bold text-[var(--evergreen)] mb-2">Land Acknowledgement</h3>
            <p className="text-[var(--text-secondary)] leading-relaxed">
              We acknowledge that we are learning on the traditional territories of Indigenous peoples across Turtle Island (North America).
              These lands have been cared for by Indigenous nations since time immemorial. We are committed to
              learning about the histories, cultures, and ongoing contributions of Indigenous peoples, and to
              supporting reconciliation through education and understanding.
            </p>
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Canadian History Timeline Card */}
        <button
          onClick={() => setCurrentView('timeline')}
          className="group ice-block p-0 overflow-hidden text-left hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="h-48 bg-gradient-to-br from-[var(--accent-blue)]/20 via-[var(--accent-purple)]/20 to-[var(--accent-cyan)]/20 relative overflow-hidden">
            {/* Decorative Timeline Elements */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1 h-full bg-gradient-to-b from-transparent via-[var(--aurora-green)] to-transparent opacity-50"></div>
              {[20, 35, 50, 65, 80].map((top, i) => (
                <div
                  key={i}
                  className="absolute w-4 h-4 rounded-full bg-[var(--aurora-green)] border-2 border-white/50 shadow-lg"
                  style={{ top: `${top}%`, left: '50%', transform: 'translateX(-50%)' }}
                />
              ))}
            </div>
            {/* Floating Years */}
            <div className="absolute top-4 left-4 text-xs font-mono text-[var(--text-muted)] opacity-60">Time Immemorial</div>
            <div className="absolute top-1/4 right-4 text-xs font-mono text-[var(--text-muted)] opacity-60">1763</div>
            <div className="absolute top-1/2 left-4 text-xs font-mono text-[var(--text-muted)] opacity-60">1876</div>
            <div className="absolute bottom-1/4 right-4 text-xs font-mono text-[var(--text-muted)] opacity-60">1996</div>
            <div className="absolute bottom-4 left-4 text-xs font-mono text-[var(--text-muted)] opacity-60">2015</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--evergreen)] group-hover:text-[var(--aurora-green)] transition-colors">
                  Canadian History Timeline
                </h3>
                <p className="text-sm text-[var(--text-muted)]">Interactive chronological journey</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Explore key moments in Canadian-Indigenous history from time immemorial to present day reconciliation efforts.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">Royal Proclamation</span>
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">Indian Act</span>
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">TRC</span>
            </div>
          </div>
        </button>

        {/* Numbered Treaties Map Card */}
        <button
          onClick={() => setCurrentView('treaties')}
          className="group ice-block p-0 overflow-hidden text-left hover:shadow-lg transition-all duration-300 hover:scale-[1.02]"
        >
          <div className="h-48 bg-gradient-to-br from-[var(--accent-cyan)]/20 via-[var(--evergreen)]/20 to-[var(--accent-blue)]/20 relative overflow-hidden">
            {/* Decorative Map Elements */}
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 200 150">
              {/* Simplified Canada outline */}
              <path
                d="M20,80 Q40,60 60,70 Q80,55 100,65 Q120,50 140,60 Q160,45 180,55 L180,100 Q160,110 140,105 Q120,115 100,110 Q80,120 60,115 Q40,125 20,120 Z"
                fill="none"
                stroke="var(--aurora-green)"
                strokeWidth="1"
              />
              {/* Treaty regions hint */}
              <circle cx="80" cy="85" r="15" fill="var(--accent-cyan)" opacity="0.3" />
              <circle cx="110" cy="80" r="12" fill="var(--accent-cyan)" opacity="0.3" />
              <circle cx="140" cy="75" r="10" fill="var(--accent-cyan)" opacity="0.3" />
            </svg>
            {/* Treaty Numbers */}
            <div className="absolute top-4 left-4 px-2 py-1 rounded bg-[var(--accent-cyan)]/20 text-xs font-bold text-[var(--accent-cyan)]">Treaty 1-11</div>
            <div className="absolute bottom-4 right-4 text-xs text-[var(--text-muted)]">1871-1921</div>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--accent-cyan)] to-[var(--evergreen)] flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[var(--evergreen)] group-hover:text-[var(--aurora-green)] transition-colors">
                  Numbered Treaties Map
                </h3>
                <p className="text-sm text-[var(--text-muted)]">Interactive regional explorer</p>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] mb-4">
              Discover the 11 Numbered Treaties, the nations involved, and the sacred promises made between Indigenous peoples and the Crown.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">Cree Nations</span>
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">Treaty Rights</span>
              <span className="px-2 py-1 text-xs rounded-full bg-[var(--ice-blue)]/50 text-[var(--evergreen)]">Medicine Chest</span>
            </div>
          </div>
        </button>
      </div>

      {/* Educational Context */}
      <div className="ice-block p-6">
        <h3 className="font-bold text-[var(--evergreen)] mb-4 flex items-center gap-2">
          <span className="text-xl">📖</span>
          Why This Matters
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-4 rounded-xl bg-white/30 border border-[var(--frost-border-light)]">
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">Truth</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Understanding history is the first step toward reconciliation. Learning about the past helps us build a better future together.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/30 border border-[var(--frost-border-light)]">
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">Reconciliation</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              The TRC&apos;s 94 Calls to Action include education as a key pathway to healing and building meaningful relationships.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/30 border border-[var(--frost-border-light)]">
            <h4 className="font-semibold text-[var(--evergreen)] mb-2">Action</h4>
            <p className="text-sm text-[var(--text-secondary)]">
              Knowledge leads to action. By learning, we can become allies and advocates for Indigenous rights and self-determination.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Resources Link */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-[var(--evergreen)] mb-4">External Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <a
            href="https://nctr.ca/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-[var(--frost-border-light)]"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--evergreen)] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">National Centre for Truth and Reconciliation</p>
              <p className="text-xs text-[var(--text-muted)]">nctr.ca</p>
            </div>
          </a>
          <a
            href="https://www.rcaanc-cirnac.gc.ca/eng/1100100028574/1529354437231"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-xl bg-white/30 hover:bg-white/50 transition-colors border border-[var(--frost-border-light)]"
          >
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-blue)] flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Crown-Indigenous Relations Canada</p>
              <p className="text-xs text-[var(--text-muted)]">Treaties and Agreements</p>
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
