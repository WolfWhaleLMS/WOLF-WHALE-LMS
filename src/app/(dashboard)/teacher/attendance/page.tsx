'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import Button from '@/components/Button';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface Student {
  id: string;
  name: string;
  avatar?: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

// Demo data
const DEMO_COURSES: Course[] = [
  { id: 'demo-1', name: 'Foundations of Mathematics 10', code: 'FOM10' },
  { id: 'demo-2', name: 'Workplace & Apprenticeship Math 10', code: 'WAM10' },
  { id: 'demo-3', name: 'Pre-Calculus 10', code: 'PC10' },
];

const DEMO_STUDENTS: Student[] = [
  { id: 's1', name: 'Emma Johnson', status: null },
  { id: 's2', name: 'Lucas Kim', status: null },
  { id: 's3', name: 'Sophia Martinez', status: null },
  { id: 's4', name: 'Noah Wilson', status: null },
  { id: 's5', name: 'Olivia Brown', status: null },
  { id: 's6', name: 'Liam Anderson', status: null },
  { id: 's7', name: 'Ava Thompson', status: null },
  { id: 's8', name: 'Ethan Garcia', status: null },
];

export default function AttendancePage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo) {
      if (status === 'unauthenticated') {
        router.push('/login');
      } else if (!['TEACHER', 'ADMIN', 'MASTER'].includes(session?.user?.role || '')) {
        router.push('/dashboard');
      }
    } else if (isDemo && demoUser?.role !== 'TEACHER') {
      router.push('/dashboard');
    }
  }, [status, session, router, isDemo, demoUser, isDemoLoading]);

  // Fetch courses
  useEffect(() => {
    async function fetchCourses() {
      if (!isLoggedIn || !currentUser) return;

      if (isDemo) {
        setCourses(DEMO_COURSES);
        setSelectedCourse(DEMO_COURSES[0].id);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        if (response.ok && data.courses) {
          setCourses(data.courses);
          if (data.courses.length > 0) {
            setSelectedCourse(data.courses[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, [isLoggedIn, currentUser, isDemo]);

  // Fetch students and attendance when course or date changes
  const fetchAttendance = useCallback(async () => {
    if (!selectedCourse) return;

    if (isDemo) {
      setStudents(DEMO_STUDENTS);
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/attendance?courseId=${selectedCourse}&date=${selectedDate}`
      );
      const data = await response.json();
      if (response.ok) {
        setStudents(data.students);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    }
  }, [selectedCourse, selectedDate, isDemo]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendance();
    }
  }, [selectedCourse, selectedDate, fetchAttendance]);

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
    setSaveMessage('');

    if (isDemo) {
      // Demo mode - simulate save
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSaveMessage('Attendance saved! (Demo mode - not persisted)');
      setIsSaving(false);
      return;
    }

    try {
      const records = students
        .filter((s) => s.status !== null)
        .map((s) => ({
          studentId: s.id,
          status: s.status as string,
        }));

      const response = await fetch('/api/teacher/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse,
          date: selectedDate,
          records,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage('Attendance saved successfully!');
      } else {
        setSaveMessage(data.error || 'Failed to save attendance');
      }
    } catch {
      setSaveMessage('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const statusColors: Record<string, string> = {
    PRESENT: 'badge-present',
    ABSENT: 'badge-absent',
    LATE: 'badge-late',
    EXCUSED: 'badge-excused',
  };

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

  const attendanceSummary = {
    present: students.filter((s) => s.status === 'PRESENT').length,
    absent: students.filter((s) => s.status === 'ABSENT').length,
    late: students.filter((s) => s.status === 'LATE').length,
    excused: students.filter((s) => s.status === 'EXCUSED').length,
    unmarked: students.filter((s) => s.status === null).length,
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍🏫</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Attendance</p>
              <p className="text-sm text-[var(--text-muted)]">Changes will not be persisted</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--evergreen)]">Attendance</h1>
          <p className="text-[var(--text-muted)]">Track daily student attendance</p>
        </div>
      </div>

      {/* Controls */}
      <div className="ice-block p-4">
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
        <span className="text-sm text-[var(--text-muted)] self-center mr-2">Mark all as:</span>
        <button onClick={() => setAllStatus('PRESENT')} className="btn-3d btn-accent btn-sm">
          Present
        </button>
        <button onClick={() => setAllStatus('ABSENT')} className="btn-3d btn-danger btn-sm">
          Absent
        </button>
        <button onClick={() => setAllStatus(null)} className="btn-3d btn-ghost btn-sm">
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
          { label: 'Unmarked', value: attendanceSummary.unmarked, color: 'text-[var(--text-muted)]' },
        ].map((item, index) => (
          <div key={index} className="ice-block p-3 text-center">
            <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            <div className="text-xs text-[var(--text-muted)]">{item.label}</div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      {students.length === 0 ? (
        <div className="ice-block p-8 text-center">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="text-lg font-semibold text-[var(--evergreen)] mb-2">No Students Enrolled</h3>
          <p className="text-[var(--text-muted)]">
            {courses.length === 0
              ? 'Create a course first to take attendance'
              : 'This course has no enrolled students yet'}
          </p>
        </div>
      ) : (
        <div className="ice-block overflow-hidden p-0">
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
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--aurora-green)] to-[var(--accent-cyan)] flex items-center justify-center text-white text-xs font-medium">
                        {student.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-medium text-[var(--evergreen)]">{student.name}</span>
                    </div>
                  </td>
                  <td>
                    {student.status ? (
                      <span className={`badge ${statusColors[student.status]}`}>
                        {student.status.toLowerCase()}
                      </span>
                    ) : (
                      <span className="badge badge-pending">Unmarked</span>
                    )}
                  </td>
                  <td>
                    <div className="flex gap-1">
                      {(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const).map((status) => (
                        <button
                          key={status}
                          onClick={() => setStudentStatus(student.id, status)}
                          className={`px-2 py-1 rounded text-xs font-medium capitalize transition-all ${
                            student.status === status
                              ? status === 'PRESENT'
                                ? 'bg-green-500 text-white'
                                : status === 'ABSENT'
                                ? 'bg-red-500 text-white'
                                : status === 'LATE'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-blue-500 text-white'
                              : 'bg-[var(--ice-blue)]/50 text-[var(--text-secondary)] hover:bg-[var(--ice-blue)]'
                          }`}
                        >
                          {status.charAt(0)}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Save Button */}
      <div className="flex items-center justify-between">
        {saveMessage && (
          <div className={`text-sm font-medium ${saveMessage.includes('success') || saveMessage.includes('saved') ? 'text-green-600' : 'text-red-600'}`}>
            {saveMessage}
          </div>
        )}
        <div className="ml-auto">
          <Button onClick={handleSave} isLoading={isSaving} size="lg" disabled={students.length === 0}>
            Save Attendance
          </Button>
        </div>
      </div>
    </div>
  );
}
