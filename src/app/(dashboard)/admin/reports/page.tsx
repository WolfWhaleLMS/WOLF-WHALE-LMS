'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MASTER') {
      router.push('/dashboard');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-600">System-wide insights and statistics</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Users (30d)', value: '142', change: '+12%', positive: true },
          { label: 'Course Completions', value: '89', change: '+23%', positive: true },
          { label: 'Avg. Grade', value: '84%', change: '+2%', positive: true },
          { label: 'Attendance Rate', value: '92%', change: '-1%', positive: false },
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-card-value gradient-text">{stat.value}</div>
            <div className="stat-card-label">{stat.label}</div>
            <div className={`text-sm font-medium mt-1 ${stat.positive ? 'text-green-600' : 'text-red-600'}`}>
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Enrollment Trends */}
        <div className="glass-card-solid p-6">
          <h3 className="font-bold text-gray-900 mb-4">Enrollment Trends</h3>
          <div className="h-64 flex items-end justify-between gap-2">
            {[40, 55, 45, 70, 65, 80, 75, 90, 85, 95, 88, 100].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-gradient-to-t from-[#00d4aa] to-[#00a8cc] rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-gray-500">
                  {['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Course Performance */}
        <div className="glass-card-solid p-6">
          <h3 className="font-bold text-gray-900 mb-4">Top Performing Courses</h3>
          <div className="space-y-4">
            {[
              { name: 'WEB101', title: 'Intro to Web Dev', completion: 92, grade: 87 },
              { name: 'CS201', title: 'Data Structures', completion: 78, grade: 82 },
              { name: 'UX301', title: 'UX Design', completion: 95, grade: 91 },
              { name: 'WEB301', title: 'Advanced JS', completion: 68, grade: 79 },
            ].map((course, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="badge badge-graded w-20">{course.name}</span>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{course.title}</span>
                    <span className="text-sm text-gray-500">{course.completion}% completion</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${course.completion}%` }} />
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold gradient-text">{course.grade}%</div>
                  <div className="text-xs text-gray-500">avg grade</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Reports */}
      <div className="glass-card-solid p-6">
        <h3 className="font-bold text-gray-900 mb-4">Generate Reports</h3>
        <div className="grid md:grid-cols-4 gap-4">
          {[
            { icon: '📊', title: 'User Activity', desc: 'Login and engagement metrics' },
            { icon: '📚', title: 'Course Analytics', desc: 'Performance by course' },
            { icon: '📝', title: 'Grade Distribution', desc: 'Assignment and exam grades' },
            { icon: '📅', title: 'Attendance Report', desc: 'Attendance by class/date' },
          ].map((report, i) => (
            <button
              key={i}
              className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-left"
            >
              <div className="text-2xl mb-2">{report.icon}</div>
              <div className="font-medium text-gray-900">{report.title}</div>
              <div className="text-sm text-gray-500">{report.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
