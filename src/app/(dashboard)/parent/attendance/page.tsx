'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import ChildSwitcher from '@/components/ChildSwitcher';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface AttendanceRecord {
  id: string;
  date: string;
  courseName: string;
  courseCode: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

// Generate demo attendance data
function generateDemoAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const courses = [
    { name: 'Foundations of Mathematics 10', code: 'FOM10' },
    { name: 'English Language Arts A10', code: 'ELA-A10' },
    { name: 'Science 10', code: 'SCI10' },
    { name: 'Social Studies 10', code: 'SOC10' },
  ];
  const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'late', 'present', 'excused'];

  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const course = courses[i % courses.length];
    records.push({
      id: `${i}`,
      date: date.toISOString().split('T')[0],
      courseName: course.name,
      courseCode: course.code,
      status: statuses[i % statuses.length],
    });
  }
  return records;
}

export default function ParentAttendancePage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (session?.user?.role !== 'PARENT') {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'PARENT') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  useEffect(() => {
    if (isDemo && demoUser?.children?.length) {
      setSelectedChildId(demoUser.children[0].id);
    } else if (session?.user?.children?.length && !selectedChildId) {
      setSelectedChildId(session.user.children[0].id);
    }
  }, [session, selectedChildId, isDemo, demoUser]);

  const fetchAttendance = useCallback(async () => {
    if (!selectedChildId) return;

    if (isDemo) {
      setAttendance(generateDemoAttendance());
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/parent/attendance?childId=${selectedChildId}`);
      const data = await response.json();
      if (response.ok) {
        setAttendance(data.attendance);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId, isDemo]);

  useEffect(() => {
    if (selectedChildId) {
      fetchAttendance();
    }
  }, [selectedChildId, fetchAttendance]);

  if (isDemoLoading || (!isDemo && status === 'loading') || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!isLoggedIn || !currentUser) {
    return null;
  }

  const summary = {
    present: attendance.filter(a => a.status === 'present').length,
    absent: attendance.filter(a => a.status === 'absent').length,
    late: attendance.filter(a => a.status === 'late').length,
    excused: attendance.filter(a => a.status === 'excused').length,
  };

  const attendanceRate = attendance.length > 0
    ? Math.round(((summary.present + summary.late + summary.excused) / attendance.length) * 100)
    : 0;

  const statusColors: Record<string, string> = {
    present: 'badge-present',
    absent: 'badge-absent',
    late: 'badge-late',
    excused: 'badge-excused',
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Parent Attendance</p>
              <p className="text-sm text-[var(--text-muted)]">Viewing sample attendance data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--evergreen)]">Attendance</h1>
          <p className="text-[var(--text-muted)]">View your child&apos;s attendance records</p>
        </div>
        {!isDemo && (
          <ChildSwitcher
            selectedChildId={selectedChildId}
            onChildSelect={setSelectedChildId}
          />
        )}
        {isDemo && demoUser?.children && (
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--ice-blue)]/50 border-2 border-[var(--frost-border)] rounded-xl">
            <span className="text-[var(--evergreen)] font-semibold">{demoUser.children[0].name}</span>
            <span className="badge badge-graded text-xs">Grade 10</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4">
        <div className="stat-card">
          <div className={`stat-card-value ${attendanceRate >= 90 ? 'text-green-600' : attendanceRate >= 80 ? 'text-yellow-600' : 'text-red-600'}`}>
            {attendanceRate}%
          </div>
          <div className="stat-card-label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value text-green-600">{summary.present}</div>
          <div className="stat-card-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value text-red-600">{summary.absent}</div>
          <div className="stat-card-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value text-yellow-600">{summary.late}</div>
          <div className="stat-card-label">Late</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value text-blue-600">{summary.excused}</div>
          <div className="stat-card-label">Excused</div>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="glass-card-solid overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Course</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {attendance.map((record) => (
              <tr key={record.id}>
                <td>
                  <span className="font-medium">
                    {new Date(record.date + 'T00:00:00').toLocaleDateString('default', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </td>
                <td>
                  <div>
                    <span className="badge badge-graded">{record.courseCode}</span>
                  </div>
                </td>
                <td>
                  <span className={`badge ${statusColors[record.status]} capitalize`}>
                    {record.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
