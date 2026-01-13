'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';
import XPBar from '@/components/XPBar';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      setFormData({
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        email: session.user.email || '',
      });
    }
  }, [session]);

  const handleSave = () => {
    // Simulate save
    setIsEditing(false);
    alert('Profile updated successfully!');
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="glass-card-solid p-6">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white text-3xl font-bold">
            {session.user.firstName?.[0]}{session.user.lastName?.[0]}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{session.user.name}</h1>
            <p className="text-gray-600">{session.user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge badge-graded">{session.user.role}</span>
              {session.user.role === 'STUDENT' && (
                <span className="level-badge">Level {session.user.level}</span>
              )}
            </div>
          </div>
          <Button variant="ghost" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </div>

      {/* XP Bar for Students */}
      {session.user.role === 'STUDENT' && (
        <div className="glass-card-solid p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Progress & Achievements</h2>
          <XPBar xp={session.user.xp} level={session.user.level} showDetails />

          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-3">Recent Achievements</h3>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'First Steps', icon: '🎯' },
                { name: 'Week Warrior', icon: '🔥' },
                { name: 'Perfect Score', icon: '⭐' },
              ].map((achievement, i) => (
                <div key={i} className="achievement-badge">
                  <span className="text-xl">{achievement.icon}</span>
                  <span>{achievement.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Form */}
      <div className="glass-card-solid p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="input-label">First Name</label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field"
                disabled={!isEditing}
              />
            </div>
            <div>
              <label className="input-label">Last Name</label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field"
                disabled={!isEditing}
              />
            </div>
          </div>
          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              value={formData.email}
              className="input-field"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          <div>
            <label className="input-label">Role</label>
            <input
              type="text"
              value={session.user.role}
              className="input-field"
              disabled
            />
          </div>
          {isEditing && (
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                Save Changes
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Account Stats */}
      <div className="glass-card-solid p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {session.user.role === 'STUDENT' && (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">3</div>
                <div className="text-sm text-gray-500">Enrolled Courses</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">12</div>
                <div className="text-sm text-gray-500">Completed Assignments</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">{session.user.streak}</div>
                <div className="text-sm text-gray-500">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text-gold">{session.user.xp}</div>
                <div className="text-sm text-gray-500">Total XP</div>
              </div>
            </>
          )}
          {session.user.role === 'TEACHER' && (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">4</div>
                <div className="text-sm text-gray-500">Active Courses</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">127</div>
                <div className="text-sm text-gray-500">Total Students</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">89</div>
                <div className="text-sm text-gray-500">Graded This Month</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">4.8</div>
                <div className="text-sm text-gray-500">Avg. Rating</div>
              </div>
            </>
          )}
          {session.user.role === 'PARENT' && (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">{session.user.children?.length || 0}</div>
                <div className="text-sm text-gray-500">Children</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">15</div>
                <div className="text-sm text-gray-500">Messages Sent</div>
              </div>
            </>
          )}
          {session.user.role === 'ADMIN' && (
            <>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">156</div>
                <div className="text-sm text-gray-500">Total Users</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold gradient-text">12</div>
                <div className="text-sm text-gray-500">Active Courses</div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="glass-card-solid p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
        <div className="space-y-4">
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="font-medium">Change Password</span>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Two-Factor Authentication</span>
            </div>
            <span className="text-sm text-gray-500">Not enabled</span>
          </button>
        </div>
      </div>
    </div>
  );
}
