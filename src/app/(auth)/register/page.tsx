'use client';

import Link from 'next/link';

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center">
              <span className="text-white font-bold text-xl">LQ</span>
            </div>
            <span className="text-2xl font-bold gradient-text">LearnQuest</span>
          </Link>
        </div>

        {/* Registration Disabled Card */}
        <div className="glass-card-solid p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Registration Disabled</h1>
          <p className="text-gray-600 mb-6">
            Public registration is not available. Please contact your school administrator to request an account.
          </p>

          <div className="p-4 bg-blue-50 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              <strong>For administrators:</strong> User accounts are created through the Admin Dashboard.
            </p>
          </div>

          <Link
            href="/login"
            className="btn-3d btn-primary inline-block"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
