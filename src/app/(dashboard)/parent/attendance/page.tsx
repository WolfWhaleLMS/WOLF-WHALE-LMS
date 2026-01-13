'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChildSwitcher from '@/components/ChildSwitcher';

interface AttendanceRecord {
  id: string;
  date: string;
  courseName: string;
  courseCode: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  notes?: string;
}

export default function ParentAttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user?.children?.length && !selectedChildId) {
      setSelectedChildId(session.user.children[0].id);
    }
  }, [session, selectedChildId]);

  useEffect(() => {
    if (selectedChildId) {
      // Mock attendance data
      const records: AttendanceRecord[] = [];
      const courses = [
        { name: 'Introduction to Web Development', code: 'WEB101' },
        { name: 'Data Structures & Algorithms', code: 'CS201' },
        { name: 'User Experience Design', code: 'UX301' },
      ];
      const statuses: AttendanceRecord['status'][] = ['present', 'present', 'present', 'present', 'late', 'present', 'absent', 'excused'];

      for (let i = 0; i < 20; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const course = courses[i % courses.length];
        records.push({
          id: `${i}`,
          date: date.toISOString().split('T')[0],
          courseName: course.name,
          courseCode: course.code,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        });
      }
      setAttendance(records);
    }
  }, [selectedChildId]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">View your child&apos;s attendance records</p>
        </div>
        <ChildSwitcher
          selectedChildId={selectedChildId}
          onChildSelect={setSelectedChildId}
        />
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
