'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

interface School {
  id: string;
  name: string;
  slug: string;
}

export default function NewAdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(true);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    schoolId: '',
  });

  // Fetch schools on mount
  useEffect(() => {
    async function fetchSchools() {
      try {
        const res = await fetch('/api/master/schools');
        if (res.ok) {
          const data = await res.json();
          setSchools(data);
        }
      } catch (err) {
        console.error('Failed to fetch schools:', err);
      } finally {
        setLoadingSchools(false);
      }
    }
    fetchSchools();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password strength
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/master/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          schoolId: formData.schoolId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      router.push('/master');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/master"
          className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold gradient-text">Create Admin User</h1>
        <p className="text-[var(--text-muted)] mt-1">
          Add a new administrator to manage a school
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="ice-block p-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="input-label">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="John"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="input-label">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Doe"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="input-label">
              Email Address *
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="admin@school.edu"
            />
          </div>

          {/* School Selection */}
          <div>
            <label htmlFor="schoolId" className="input-label">
              Assign to School *
            </label>
            {loadingSchools ? (
              <div className="input-field bg-[var(--glass-bg)]">
                Loading schools...
              </div>
            ) : schools.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
                <p className="font-medium">No schools available</p>
                <p className="text-sm mt-1">
                  Please{' '}
                  <Link href="/master/schools/new" className="underline">
                    create a school
                  </Link>{' '}
                  first before adding an admin.
                </p>
              </div>
            ) : (
              <select
                id="schoolId"
                name="schoolId"
                value={formData.schoolId}
                onChange={handleChange}
                required
                className="select-field"
              >
                <option value="">Select a school...</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="input-label">
              Password *
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={8}
              className="input-field"
              placeholder="Minimum 8 characters"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="input-label">
              Confirm Password *
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="Re-enter password"
            />
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 rounded-xl bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h4 className="font-medium text-[var(--text-primary)] mb-2">Admin Permissions</h4>
          <ul className="text-sm text-[var(--text-muted)] space-y-1">
            <li>• Manage teachers, students, and parents within their school</li>
            <li>• Create and manage courses</li>
            <li>• View reports and analytics</li>
            <li>• Configure school settings</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--glass-border)]">
          <Link href="/master">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button
            type="submit"
            isLoading={isLoading}
            soundType="submit"
            disabled={schools.length === 0 || loadingSchools}
          >
            Create Admin
          </Button>
        </div>
      </form>
    </div>
  );
}
