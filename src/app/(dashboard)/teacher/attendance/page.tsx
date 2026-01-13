'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

interface Student {
  id: string;
  name: string;
  avatar?: string;
  status: 'present' | 'absent' | 'late' | 'excused' | null;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Mock courses
    const mockCourses = [
      { id: '1', name: 'Introduction to Web Development', code: 'WEB101' },
      { id: '2', name: 'Data Structures & Algorithms', code: 'CS201' },
      { id: '3', name: 'Advanced JavaScript', code: 'WEB301' },
    ];
    setCourses(mockCourses);
    setSelectedCourse(mockCourses[0].id);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      // Mock students for selected course
      const mockStudents: Student[] = [
        { id: '1', name: 'Emma Johnson', status: null },
        { id: '2', name: 'John Davis', status: null },
        { id: '3', name: 'Sarah Miller', status: null },
        { id: '4', name: 'Mike Wilson', status: null },
        { id: '5', name: 'Lisa Anderson', status: null },
        { id: '6', name: 'David Brown', status: null },
        { id: '7', name: 'Jennifer Lee', status: null },
        { id: '8', name: 'Robert Taylor', status: null },
      ];
      setStudents(mockStudents);
    }
  }, [selectedCourse]);

  const setAllStatus = (status: Student['status']) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const setStudentStatus = (studentId: string, status: Student['status']) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, status } : s))
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    alert('Attendance saved successfully!');
  };

  const statusColors: Record<string, string> = {
    present: 'badge-present',
    absent: 'badge-absent',
    late: 'badge-late',
    excused: 'badge-excused',
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  const attendanceSummary = {
    present: students.filter((s) => s.status === 'present').length,
    absent: students.filter((s) => s.status === 'absent').length,
    late: students.filter((s) => s.status === 'late').length,
    excused: students.filter((s) => s.status === 'excused').length,
    unmarked: students.filter((s) => s.status === null).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600">Track daily student attendance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="glass-card-solid p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="input-label">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="select-field"
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full md:w-48">
            <label className="input-label">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="input-field"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-600 self-center mr-2">Mark all as:</span>
        <button
          onClick={() => setAllStatus('present')}
          className="btn-3d btn-accent btn-sm"
        >
          Present
        </button>
        <button
          onClick={() => setAllStatus('absent')}
          className="btn-3d btn-danger btn-sm"
        >
          Absent
        </button>
        <button
          onClick={() => setAllStatus(null)}
          className="btn-3d btn-ghost btn-sm"
        >
          Clear All
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-5 gap-4">
        {[
          { label: 'Present', value: attendanceSummary.present, color: 'text-green-600' },
          { label: 'Absent', value: attendanceSummary.absent, color: 'text-red-600' },
          { label: 'Late', value: attendanceSummary.late, color: 'text-yellow-600' },
          { label: 'Excused', value: attendanceSummary.excused, color: 'text-blue-600' },
          { label: 'Unmarked', value: attendanceSummary.unmarked, color: 'text-gray-600' },
        ].map((item, index) => (
          <div key={index} className="glass-card-flat p-3 text-center">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-gray-500">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <div className="glass-card-solid overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white text-xs font-medium">
                      {student.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <span className="font-medium">{student.name}</span>
                  </div>
                </td>
                <td>
                  {student.status ? (
                    <span className={`badge ${statusColors[student.status]}`}>
                      {student.status}
                    </span>
                  ) : (
                    <span className="badge badge-pending">Unmarked</span>
                  )}
                </td>
                <td>
                  <div className="flex gap-1">
                    {(['present', 'absent', 'late', 'excused'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setStudentStatus(student.id, status)}
                        className={`px-2 py-1 rounded text-xs font-medium capitalize transition-all ${
                          student.status === status
                            ? status === 'present'
                              ? 'bg-green-500 text-white'
                              : status === 'absent'
                              ? 'bg-red-500 text-white'
                              : status === 'late'
                              ? 'bg-yellow-500 text-white'
                              : 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {status.charAt(0).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} isLoading={isSaving} size="lg">
          Save Attendance
        </Button>
      </div>
    </div>
  );
}
