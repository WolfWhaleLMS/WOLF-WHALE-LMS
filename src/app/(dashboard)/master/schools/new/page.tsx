'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

export default function NewSchoolPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    domain: '',
    primaryColor: '#3b82f6',
    subscriptionTier: 'FREE',
    maxUsers: 50,
    maxCourses: 10,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from name
    if (name === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData((prev) => ({
        ...prev,
        slug,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/master/schools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create school');
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
        <h1 className="text-3xl font-bold gradient-text">Create New School</h1>
        <p className="text-[var(--text-muted)] mt-1">
          Set up a new organization in Wolf Whale LMS
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
          {/* School Name */}
          <div>
            <label htmlFor="name" className="input-label">
              School Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Lincoln Elementary School"
            />
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="input-label">
              URL Slug *
            </label>
            <div className="flex items-center gap-2">
              <span className="text-[var(--text-muted)] text-sm">wolfwhale.com/</span>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                required
                className="input-field flex-1"
                placeholder="lincoln-elementary"
                pattern="[a-z0-9-]+"
              />
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Only lowercase letters, numbers, and hyphens
            </p>
          </div>

          {/* Custom Domain */}
          <div>
            <label htmlFor="domain" className="input-label">
              Custom Domain (Optional)
            </label>
            <input
              type="text"
              id="domain"
              name="domain"
              value={formData.domain}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., lms.lincolnschool.edu"
            />
          </div>

          {/* Primary Color */}
          <div>
            <label htmlFor="primaryColor" className="input-label">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={formData.primaryColor}
                onChange={handleChange}
                className="w-12 h-12 rounded-xl border border-[var(--glass-border)] cursor-pointer"
              />
              <input
                type="text"
                value={formData.primaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="input-field flex-1"
                placeholder="#3b82f6"
              />
            </div>
          </div>

          {/* Subscription Tier */}
          <div>
            <label htmlFor="subscriptionTier" className="input-label">
              Subscription Tier
            </label>
            <select
              id="subscriptionTier"
              name="subscriptionTier"
              value={formData.subscriptionTier}
              onChange={handleChange}
              className="select-field"
            >
              <option value="FREE">Free (50 users, 10 courses)</option>
              <option value="STARTER">Starter (200 users, 50 courses)</option>
              <option value="PRO">Pro (1000 users, unlimited courses)</option>
              <option value="ENTERPRISE">Enterprise (Unlimited)</option>
            </select>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="maxUsers" className="input-label">
                Max Users
              </label>
              <input
                type="number"
                id="maxUsers"
                name="maxUsers"
                value={formData.maxUsers}
                onChange={handleChange}
                min="1"
                className="input-field"
              />
            </div>
            <div>
              <label htmlFor="maxCourses" className="input-label">
                Max Courses
              </label>
              <input
                type="number"
                id="maxCourses"
                name="maxCourses"
                value={formData.maxCourses}
                onChange={handleChange}
                min="1"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-[var(--glass-border)]">
          <Link href="/master">
            <Button variant="ghost" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" isLoading={isLoading} soundType="submit">
            Create School
          </Button>
        </div>
      </form>
    </div>
  );
}
