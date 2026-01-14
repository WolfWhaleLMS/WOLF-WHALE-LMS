import Link from 'next/link';
import Navbar from '@/components/Navbar';
import PricingSection from '@/components/PricingSection';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section - Glass/Ice Premium */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 ice-block rounded-full text-sm font-semibold text-[var(--text-primary)]">
                <span className="w-2 h-2 rounded-full bg-[var(--accent-cyan)] animate-pulse"></span>
                Saskatchewan K-12 Curriculum
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-[var(--text-primary)] leading-tight">
                Learn. <span className="gradient-text-aurora">Achieve.</span> Level Up.
              </h1>
              <p className="text-xl text-[var(--text-secondary)]">
                Wolf Whale transforms education with beautiful Glass UI design, engaging gamification,
                and powerful tools designed for Saskatchewan K-12 schools.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/login" className="btn-3d btn-primary px-6 py-3 text-lg">
                  Try Demo
                </Link>
                <Link href="#features" className="btn-3d btn-secondary px-6 py-3 text-lg">
                  Explore Features
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">10+</div>
                  <div className="text-sm text-[var(--text-muted)]">SK Courses</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">Grade 10</div>
                  <div className="text-sm text-[var(--text-muted)]">Curriculum</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold gradient-text">4</div>
                  <div className="text-sm text-[var(--text-muted)]">User Roles</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="ice-block p-6 animate-float">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="level-badge">Lv.3</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-[var(--text-primary)]">Emma Johnson</div>
                      <div className="xp-bar-container mt-1">
                        <div className="xp-bar" style={{ width: '75%' }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="stat-card">
                      <div className="stat-card-value text-lg">4</div>
                      <div className="stat-card-label">Courses</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value text-lg">12</div>
                      <div className="stat-card-label">Badges</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-card-value text-lg">7</div>
                      <div className="stat-card-label">Streak</div>
                    </div>
                  </div>
                  <div className="achievement-badge">
                    <span className="text-xl">🏆</span>
                    <span className="text-sm text-[var(--text-primary)]">Math Whiz Achievement Unlocked!</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Built for <span className="gradient-text-aurora">Saskatchewan Schools</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-2xl mx-auto">
              Powerful features designed for K-12 education, aligned with Saskatchewan curriculum.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📚',
                title: 'SK Curriculum',
                description: 'Pre-loaded Grade 10 courses including FOM10, ELA-A10, SCI10, SOC10, and more.',
              },
              {
                icon: '🎮',
                title: 'Gamified Learning',
                description: 'Earn XP, level up, unlock achievements, and maintain learning streaks.',
              },
              {
                icon: '📊',
                title: 'Progress Tracking',
                description: 'Real-time analytics and insights into student performance and engagement.',
              },
              {
                icon: '💬',
                title: 'Communication',
                description: 'Built-in messaging, announcements, and discussion forums.',
              },
              {
                icon: '📅',
                title: 'Calendar & Events',
                description: 'Keep track of assignments, exams, and important dates.',
              },
              {
                icon: '👨‍👩‍👧',
                title: 'Parent Portal',
                description: 'Parents stay connected with grades, attendance, and teacher communications.',
              },
            ].map((feature, index) => (
              <div key={index} className="ice-block p-6 space-y-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center text-2xl shadow-lg border border-white/30" style={{ boxShadow: 'var(--accent-glow)' }}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-[var(--text-primary)]">{feature.title}</h3>
                <p className="text-[var(--text-secondary)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Cards Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Designed for <span className="gradient-text-aurora">Everyone</span>
            </h2>
            <p className="text-xl text-[var(--text-secondary)]">
              Tailored experiences for every user in the learning ecosystem.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                role: 'Students',
                icon: '🎓',
                color: 'from-[var(--accent-blue)] to-[var(--accent-purple)]',
                features: ['Track assignments', 'Earn XP & badges', 'View grades', 'Join discussions'],
              },
              {
                role: 'Teachers',
                icon: '👨‍🏫',
                color: 'from-[var(--accent-cyan)] to-[var(--accent-blue)]',
                features: ['Create courses', 'Grade submissions', 'Track attendance', 'Send announcements'],
              },
              {
                role: 'Parents',
                icon: '👨‍👩‍👧',
                color: 'from-[var(--success-start)] to-[var(--success-end)]',
                features: ['Monitor progress', 'View attendance', 'Check grades', 'Message teachers'],
              },
              {
                role: 'Admins',
                icon: '🛡️',
                color: 'from-[var(--gold-start)] to-[var(--gold-end)]',
                features: ['Manage users', 'System reports', 'Course admin', 'School settings'],
              },
            ].map((card, index) => (
              <div key={index} className="ice-block overflow-hidden">
                <div className={`h-24 bg-gradient-to-br ${card.color} flex items-center justify-center gap-3`} style={{ boxShadow: 'var(--accent-glow)' }}>
                  <span className="text-3xl">{card.icon}</span>
                  <h3 className="text-xl font-bold text-white">{card.role}</h3>
                </div>
                <div className="p-5">
                  <ul className="space-y-2">
                    {card.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-[var(--accent-cyan)]" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className="text-[var(--text-secondary)] text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="ice-block p-12 text-center">
            <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
              Not Ready to Commit?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Try our demo with Saskatchewan Grade 10 curriculum - no account required!
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login" className="btn-3d btn-secondary px-8 py-4 text-lg">
                Try Demo First
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Glass Style */}
      <footer className="py-12 px-4 border-t border-[var(--glass-border)] bg-[var(--glass-bg)]">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-blue)] to-[var(--accent-purple)] flex items-center justify-center shadow-lg border border-white/30" style={{ boxShadow: 'var(--accent-glow)' }}>
                  <span className="text-xl">🐋</span>
                </div>
                <span className="text-xl font-bold gradient-text">Wolf Whale</span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm">
                Modern learning management with Glass UI design for Saskatchewan K-12 schools.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="#features" className="hover:text-[var(--accent-cyan)] transition-colors">Features</Link></li>
                <li><Link href="/login" className="hover:text-[var(--accent-cyan)] transition-colors">Demo</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">Curriculum</h4>
              <ul className="space-y-2 text-sm text-[var(--text-muted)]">
                <li>Grade 10 Math</li>
                <li>Grade 10 ELA</li>
                <li>Grade 10 Science</li>
                <li>Grade 10 Social</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-[var(--text-primary)] mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
                <li><Link href="/privacy" className="hover:text-[var(--accent-cyan)] transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-[var(--accent-cyan)] transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-[var(--glass-border)] text-center text-sm text-[var(--text-muted)]">
            © {new Date().getFullYear()} Wolf Whale LMS. Saskatchewan K-12 Curriculum.
          </div>
        </div>
      </footer>
    </div>
  );
}
