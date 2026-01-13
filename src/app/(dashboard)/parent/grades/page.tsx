'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ChildSwitcher from '@/components/ChildSwitcher';

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

export default function ParentGradesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Grade[]>([]);

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
      // Mock grades data
      setGrades([
        {
          id: '1',
          assignmentTitle: 'Portfolio Website',
          courseName: 'Introduction to Web Development',
          courseCode: 'WEB101',
          score: 92,
          maxScore: 100,
          submittedAt: '2024-01-10T10:30:00Z',
          gradedAt: '2024-01-12T14:00:00Z',
        },
        {
          id: '2',
          assignmentTitle: 'CSS Grid Layout',
          courseName: 'Introduction to Web Development',
          courseCode: 'WEB101',
          score: 88,
          maxScore: 100,
          submittedAt: '2024-01-08T09:15:00Z',
          gradedAt: '2024-01-10T11:30:00Z',
        },
        {
          id: '3',
          assignmentTitle: 'Binary Tree Implementation',
          courseName: 'Data Structures & Algorithms',
          courseCode: 'CS201',
          score: 85,
          maxScore: 100,
          submittedAt: '2024-01-05T16:45:00Z',
          gradedAt: '2024-01-07T10:00:00Z',
        },
        {
          id: '4',
          assignmentTitle: 'User Research Report',
          courseName: 'User Experience Design',
          courseCode: 'UX301',
          score: 95,
          maxScore: 100,
          submittedAt: '2024-01-03T12:00:00Z',
          gradedAt: '2024-01-05T15:30:00Z',
        },
      ]);
    }
  }, [selectedChildId]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Grades</h1>
          <p className="text-gray-600">View your child&apos;s academic performance</p>
        </div>
        <ChildSwitcher
          selectedChildId={selectedChildId}
          onChildSelect={setSelectedChildId}
        />
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
