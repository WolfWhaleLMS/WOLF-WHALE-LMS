'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

interface Submission {
  id: string;
  studentName: string;
  studentAvatar?: string;
  assignmentTitle: string;
  courseName: string;
  submittedAt: string;
  isLate: boolean;
  status: 'pending' | 'graded';
  grade?: number;
  maxGrade: number;
  content?: string;
  fileUrl?: string;
}

export default function GradebookPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'graded'>('pending');
  const [gradeInput, setGradeInput] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Mock submissions data
    const mockSubmissions: Submission[] = [
      {
        id: '1',
        studentName: 'Emma Johnson',
        assignmentTitle: 'Portfolio Website',
        courseName: 'WEB101',
        submittedAt: '2024-01-15T14:30:00Z',
        isLate: false,
        status: 'pending',
        maxGrade: 100,
        content: 'Here is my portfolio website submission. I focused on responsive design and accessibility.',
      },
      {
        id: '2',
        studentName: 'John Davis',
        assignmentTitle: 'Binary Tree Implementation',
        courseName: 'CS201',
        submittedAt: '2024-01-15T10:00:00Z',
        isLate: true,
        status: 'pending',
        maxGrade: 100,
        content: 'Binary tree implementation with insert, delete, and traversal methods.',
      },
      {
        id: '3',
        studentName: 'Sarah Miller',
        assignmentTitle: 'React Components Lab',
        courseName: 'WEB301',
        submittedAt: '2024-01-14T16:45:00Z',
        isLate: false,
        status: 'pending',
        maxGrade: 100,
        content: 'Created reusable React components including Button, Card, and Modal.',
      },
      {
        id: '4',
        studentName: 'Mike Wilson',
        assignmentTitle: 'CSS Grid Layout',
        courseName: 'WEB101',
        submittedAt: '2024-01-14T09:20:00Z',
        isLate: false,
        status: 'graded',
        grade: 92,
        maxGrade: 100,
        content: 'Grid layout implementation for a magazine-style website.',
      },
      {
        id: '5',
        studentName: 'Lisa Anderson',
        assignmentTitle: 'Linked List Operations',
        courseName: 'CS201',
        submittedAt: '2024-01-13T11:30:00Z',
        isLate: false,
        status: 'graded',
        grade: 88,
        maxGrade: 100,
        content: 'Implemented singly and doubly linked lists with all standard operations.',
      },
    ];
    setSubmissions(mockSubmissions);
    setSelectedSubmission(mockSubmissions[0]);
  }, []);

  const filteredSubmissions = submissions.filter((s) => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleGrade = () => {
    if (!selectedSubmission || !gradeInput) return;

    const grade = parseFloat(gradeInput);
    if (isNaN(grade) || grade < 0 || grade > selectedSubmission.maxGrade) {
      alert(`Please enter a valid grade between 0 and ${selectedSubmission.maxGrade}`);
      return;
    }

    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSubmission.id
          ? { ...s, status: 'graded' as const, grade }
          : s
      )
    );

    setSelectedSubmission((prev) =>
      prev ? { ...prev, status: 'graded', grade } : null
    );

    // Find next pending submission
    const nextPending = submissions.find(
      (s) => s.status === 'pending' && s.id !== selectedSubmission.id
    );
    if (nextPending) {
      setSelectedSubmission(nextPending);
      setGradeInput('');
      setFeedback('');
    }
  };

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SpeedGrader</h1>
          <p className="text-gray-600">
            {filteredSubmissions.filter((s) => s.status === 'pending').length} submissions to grade
          </p>
        </div>
        <div className="flex gap-2">
          {(['pending', 'graded', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-gradient-to-r from-[#00d4aa] to-[#00a8cc] text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Submissions List */}
        <div className="lg:col-span-3 glass-card-solid p-4 max-h-[70vh] overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-3">Submissions</h3>
          <div className="space-y-2">
            {filteredSubmissions.map((submission) => (
              <button
                key={submission.id}
                onClick={() => {
                  setSelectedSubmission(submission);
                  setGradeInput(submission.grade?.toString() || '');
                  setFeedback('');
                }}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedSubmission?.id === submission.id
                    ? 'bg-[#e0f7fa] border-2 border-[#00d4aa]'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white text-xs font-medium">
                    {submission.studentName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {submission.studentName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{submission.assignmentTitle}</p>
                  </div>
                  {submission.isLate && (
                    <span className="badge badge-late text-xs">Late</span>
                  )}
                  {submission.status === 'graded' && (
                    <span className="badge badge-graded text-xs">{submission.grade}</span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Submission Preview */}
        <div className="lg:col-span-6 glass-card-solid p-6">
          {selectedSubmission ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {selectedSubmission.assignmentTitle}
                  </h2>
                  <p className="text-gray-600">{selectedSubmission.courseName}</p>
                </div>
                {selectedSubmission.isLate && (
                  <span className="badge badge-late">Late Submission</span>
                )}
              </div>

              <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white font-medium">
                  {selectedSubmission.studentName.split(' ').map((n) => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedSubmission.studentName}</p>
                  <p className="text-sm text-gray-500">
                    Submitted {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h3 className="font-semibold text-gray-900 mb-2">Submission Content</h3>
                <div className="p-4 rounded-lg bg-gray-50 min-h-[200px]">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {selectedSubmission.content}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-600">Select a submission to view</p>
            </div>
          )}
        </div>

        {/* Grading Panel */}
        <div className="lg:col-span-3 glass-card-solid p-5">
          <h3 className="font-semibold text-gray-900 mb-4">Grade Submission</h3>

          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="input-label">
                  Grade (out of {selectedSubmission.maxGrade})
                </label>
                <input
                  type="number"
                  min="0"
                  max={selectedSubmission.maxGrade}
                  value={gradeInput}
                  onChange={(e) => setGradeInput(e.target.value)}
                  className="input-field"
                  placeholder="Enter grade"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {[100, 90, 80, 70, 60].map((grade) => (
                  <button
                    key={grade}
                    onClick={() => setGradeInput(grade.toString())}
                    className="px-3 py-1 rounded-lg text-sm font-medium bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    {grade}%
                  </button>
                ))}
              </div>

              <div>
                <label className="input-label">Feedback (optional)</label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="textarea-field"
                  placeholder="Add feedback for the student..."
                  rows={4}
                />
              </div>

              <Button
                onClick={handleGrade}
                className="w-full"
                disabled={!gradeInput}
              >
                {selectedSubmission.status === 'graded' ? 'Update Grade' : 'Submit Grade'}
              </Button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const currentIndex = filteredSubmissions.findIndex(
                      (s) => s.id === selectedSubmission.id
                    );
                    if (currentIndex > 0) {
                      setSelectedSubmission(filteredSubmissions[currentIndex - 1]);
                      setGradeInput(filteredSubmissions[currentIndex - 1].grade?.toString() || '');
                    }
                  }}
                  className="flex-1 btn-3d btn-ghost btn-sm"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => {
                    const currentIndex = filteredSubmissions.findIndex(
                      (s) => s.id === selectedSubmission.id
                    );
                    if (currentIndex < filteredSubmissions.length - 1) {
                      setSelectedSubmission(filteredSubmissions[currentIndex + 1]);
                      setGradeInput(filteredSubmissions[currentIndex + 1].grade?.toString() || '');
                    }
                  }}
                  className="flex-1 btn-3d btn-ghost btn-sm"
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
