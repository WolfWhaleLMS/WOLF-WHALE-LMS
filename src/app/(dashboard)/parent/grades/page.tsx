'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import ChildSwitcher from '@/components/ChildSwitcher';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface Grade {
  id: string;
  assignmentTitle: string;
  courseName: string;
  courseCode: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  gradedAt: string;
}

// Demo data for Saskatchewan Grade 10
const DEMO_GRADES: Grade[] = [
  {
    id: '1',
    assignmentTitle: 'Polynomial Operations Quiz',
    courseName: 'Foundations of Mathematics 10',
    courseCode: 'FOM10',
    score: 88,
    maxScore: 100,
    submittedAt: '2026-01-10T10:30:00Z',
    gradedAt: '2026-01-12T14:00:00Z',
  },
  {
    id: '2',
    assignmentTitle: 'Literary Analysis Essay',
    courseName: 'English Language Arts A10',
    courseCode: 'ELA-A10',
    score: 92,
    maxScore: 100,
    submittedAt: '2026-01-08T09:15:00Z',
    gradedAt: '2026-01-10T11:30:00Z',
  },
  {
    id: '3',
    assignmentTitle: 'Chemistry Lab Report',
    courseName: 'Science 10',
    courseCode: 'SCI10',
    score: 78,
    maxScore: 100,
    submittedAt: '2026-01-05T16:45:00Z',
    gradedAt: '2026-01-07T10:00:00Z',
  },
  {
    id: '4',
    assignmentTitle: 'Canadian History Test',
    courseName: 'Social Studies 10',
    courseCode: 'SOC10',
    score: 85,
    maxScore: 100,
    submittedAt: '2026-01-03T12:00:00Z',
    gradedAt: '2026-01-05T15:30:00Z',
  },
];

export default function ParentGradesPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);
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

  const fetchGrades = useCallback(async () => {
    if (!selectedChildId) return;

    if (isDemo) {
      setGrades(DEMO_GRADES);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/parent/grades?childId=${selectedChildId}`);
      const data = await response.json();
      if (response.ok) {
        setGrades(data.grades);
      }
    } catch (error) {
      console.error('Failed to fetch grades:', error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedChildId, isDemo]);

  useEffect(() => {
    if (selectedChildId) {
      fetchGrades();
    }
  }, [selectedChildId, fetchGrades]);

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

  const averageGrade = grades.length > 0
    ? Math.round(grades.reduce((acc, g) => acc + (g.score / g.maxScore) * 100, 0) / grades.length)
    : 0;

  const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">👨‍👩‍👧</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Parent Grades</p>
              <p className="text-sm text-[var(--text-muted)]">Viewing sample grade data</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--evergreen)]">Grades</h1>
          <p className="text-[var(--text-muted)]">View your child&apos;s academic performance</p>
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
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <div className={`stat-card-value ${getGradeColor(averageGrade)}`}>{averageGrade}%</div>
          <div className="stat-card-label">Average Grade</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">{grades.length}</div>
          <div className="stat-card-label">Graded Assignments</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-value gradient-text">
            {grades.filter(g => (g.score / g.maxScore) >= 0.9).length}
          </div>
          <div className="stat-card-label">A Grades</div>
        </div>
      </div>

      {/* Grades Table */}
      <div className="glass-card-solid overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Course</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>Graded</th>
            </tr>
          </thead>
          <tbody>
            {grades.map((grade) => {
              const percentage = Math.round((grade.score / grade.maxScore) * 100);
              return (
                <tr key={grade.id}>
                  <td>
                    <p className="font-medium text-gray-900">{grade.assignmentTitle}</p>
                  </td>
                  <td>
                    <span className="badge badge-graded">{grade.courseCode}</span>
                  </td>
                  <td>
                    <span className="font-medium">{grade.score}/{grade.maxScore}</span>
                  </td>
                  <td>
                    <span className={`font-bold ${getGradeColor(percentage)}`}>
                      {percentage}%
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-500 text-sm">
                      {new Date(grade.gradedAt).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {grades.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No grades yet</h3>
          <p className="text-gray-600">Grades will appear here once assignments are graded</p>
        </div>
      )}
    </div>
  );
}
