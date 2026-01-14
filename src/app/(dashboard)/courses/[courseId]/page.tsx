'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';
import { useDemoSession } from '@/components/DemoSessionProvider';

interface Assignment {
  id: string;
  pointsPossible: number;
  dueDate: string | null;
  instructions: string | null;
  submissionTypes: string;
}

interface ModuleItem {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'PAGE' | 'FILE' | 'LINK' | 'QUIZ';
  content: string | null;
  fileUrl: string | null;
  linkUrl: string | null;
  position: number;
  assignment: Assignment | null;
  isCompleted: boolean;
  grade: number | null;
}

interface Module {
  id: string;
  name: string;
  description: string | null;
  position: number;
  items: ModuleItem[];
  isExpanded?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  content: string;
  isPinned: boolean;
  createdAt: string;
  author: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string | null;
  color: string;
  teacher: string;
  progress: number | null;
  modules: Module[];
  announcements: Announcement[];
}

// Demo data for demo mode
const DEMO_COURSE: Course = {
  id: 'demo-1',
  name: 'Foundations of Mathematics 10',
  code: 'FOM10',
  description: 'Saskatchewan curriculum focusing on measurement, surface area, volume, trigonometry, and problem-solving skills.',
  color: '#3b82f6',
  teacher: 'Mrs. Wilson',
  progress: 65,
  modules: [
    {
      id: 'm1',
      name: 'Unit 1: Measurement & Area',
      description: 'Learn the basics of measurement and surface area',
      position: 1,
      isExpanded: true,
      items: [
        { id: 'i1', title: 'Introduction to Measurement', type: 'PAGE', content: null, fileUrl: null, linkUrl: null, position: 1, assignment: null, isCompleted: true, grade: null },
        { id: 'i2', title: 'Surface Area Formulas', type: 'PAGE', content: null, fileUrl: null, linkUrl: null, position: 2, assignment: null, isCompleted: true, grade: null },
        { id: 'i3', title: 'Practice Problems Worksheet', type: 'FILE', content: null, fileUrl: '/files/worksheet.pdf', linkUrl: null, position: 3, assignment: null, isCompleted: true, grade: null },
        { id: 'i4', title: 'Unit 1 Quiz', type: 'ASSIGNMENT', content: null, fileUrl: null, linkUrl: null, position: 4, assignment: { id: 'a1', pointsPossible: 100, dueDate: '2026-01-15', instructions: 'Complete all problems. Show your work.', submissionTypes: 'FILE,TEXT' }, isCompleted: true, grade: 88 },
      ],
    },
    {
      id: 'm2',
      name: 'Unit 2: Volume & 3D Shapes',
      description: 'Understanding volume calculations for 3D objects',
      position: 2,
      isExpanded: true,
      items: [
        { id: 'i5', title: 'Volume of Prisms', type: 'PAGE', content: null, fileUrl: null, linkUrl: null, position: 1, assignment: null, isCompleted: true, grade: null },
        { id: 'i6', title: 'Volume of Cylinders', type: 'PAGE', content: null, fileUrl: null, linkUrl: null, position: 2, assignment: null, isCompleted: false, grade: null },
        { id: 'i7', title: 'Volume Assignment', type: 'ASSIGNMENT', content: null, fileUrl: null, linkUrl: null, position: 3, assignment: { id: 'a2', pointsPossible: 50, dueDate: '2026-01-22', instructions: 'Calculate the volume for each shape.', submissionTypes: 'FILE' }, isCompleted: false, grade: null },
      ],
    },
    {
      id: 'm3',
      name: 'Unit 3: Trigonometry',
      description: 'Introduction to trigonometric ratios',
      position: 3,
      isExpanded: false,
      items: [
        { id: 'i8', title: 'Intro to Trigonometry', type: 'PAGE', content: null, fileUrl: null, linkUrl: null, position: 1, assignment: null, isCompleted: false, grade: null },
        { id: 'i9', title: 'SOH-CAH-TOA Tutorial', type: 'LINK', content: null, fileUrl: null, linkUrl: 'https://example.com/trig', position: 2, assignment: null, isCompleted: false, grade: null },
        { id: 'i10', title: 'Trigonometry Test', type: 'ASSIGNMENT', content: null, fileUrl: null, linkUrl: null, position: 3, assignment: { id: 'a3', pointsPossible: 100, dueDate: '2026-02-01', instructions: 'Complete all trig problems.', submissionTypes: 'FILE,TEXT' }, isCompleted: false, grade: null },
      ],
    },
  ],
  announcements: [
    { id: 'ann1', title: 'Welcome to FOM10!', content: 'Welcome to Foundations of Math 10. Please review the syllabus and complete Unit 1 by end of week.', isPinned: true, createdAt: '2026-01-10', author: 'Mrs. Wilson' },
    { id: 'ann2', title: 'Office Hours', content: 'I will be available for extra help Tuesdays and Thursdays after school.', isPinned: false, createdAt: '2026-01-08', author: 'Mrs. Wilson' },
  ],
};

export default function CourseDetailPage() {
  const { data: session, status } = useSession();
  const { isDemo, demoUser, isDemoLoading } = useDemoSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'modules' | 'announcements' | 'grades'>('modules');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());

  // Submission modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<{ item: ModuleItem; assignment: Assignment } | null>(null);
  const [submissionContent, setSubmissionContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const currentUser = isDemo && demoUser ? demoUser : session?.user;
  const isLoggedIn = isDemo || status === 'authenticated';
  const isStudent = currentUser?.role === 'STUDENT';

  useEffect(() => {
    if (isDemoLoading) return;

    if (!isDemo && status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router, isDemo, isDemoLoading]);

  useEffect(() => {
    async function fetchCourse() {
      if (!isLoggedIn || !currentUser) return;

      // Demo mode - use mock data
      if (isDemo) {
        setCourse(DEMO_COURSE);
        setExpandedModules(new Set(DEMO_COURSE.modules.filter(m => m.isExpanded).map(m => m.id)));
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/${courseId}`);
        const data = await response.json();

        if (response.ok) {
          setCourse(data.course);
          // Expand first module by default
          if (data.course.modules.length > 0) {
            setExpandedModules(new Set([data.course.modules[0].id]));
          }
        } else {
          console.error('Failed to fetch course:', data.error);
        }
      } catch (error) {
        console.error('Failed to fetch course:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourse();
  }, [courseId, isLoggedIn, currentUser, isDemo]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const openSubmitModal = (item: ModuleItem) => {
    if (item.assignment) {
      setSelectedAssignment({ item, assignment: item.assignment });
      setSubmissionContent('');
      setSubmitMessage('');
      setShowSubmitModal(true);
    }
  };

  const handleSubmit = async () => {
    if (!selectedAssignment || !submissionContent.trim()) {
      setSubmitMessage('Please enter your submission content');
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage('');

    if (isDemo) {
      // Demo mode - simulate submission
      await new Promise((resolve) => setTimeout(resolve, 500));
      setCourse((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          modules: prev.modules.map((m) => ({
            ...m,
            items: m.items.map((i) =>
              i.id === selectedAssignment.item.id ? { ...i, isCompleted: true } : i
            ),
          })),
        };
      });
      setSubmitMessage('Submitted! +10 XP (Demo mode)');
      setTimeout(() => {
        setShowSubmitModal(false);
      }, 1500);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/student/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assignmentId: selectedAssignment.assignment.id,
          content: submissionContent,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitMessage(data.message || 'Submitted successfully!');
        // Update the item as completed
        setCourse((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            modules: prev.modules.map((m) => ({
              ...m,
              items: m.items.map((i) =>
                i.id === selectedAssignment.item.id ? { ...i, isCompleted: true } : i
              ),
            })),
          };
        });
        setTimeout(() => {
          setShowSubmitModal(false);
        }, 1500);
      } else {
        setSubmitMessage(data.error || 'Failed to submit');
      }
    } catch {
      setSubmitMessage('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getItemIcon = (type: ModuleItem['type']) => {
    switch (type) {
      case 'ASSIGNMENT':
        return (
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      case 'PAGE':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'FILE':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        );
      case 'QUIZ':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'LINK':
        return (
          <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        );
    }
  };

  if (isDemoLoading || (!isDemo && status === 'loading') || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--evergreen)]"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-[var(--evergreen)] mb-2">Course Not Found</h3>
        <p className="text-[var(--text-muted)] mb-4">This course may not exist or you don&apos;t have access.</p>
        <Link href="/courses">
          <Button>Back to Courses</Button>
        </Link>
      </div>
    );
  }

  // Calculate grades for grades tab
  const gradedItems = course.modules.flatMap((m) =>
    m.items.filter((i) => i.assignment && i.isCompleted)
  );

  return (
    <div className="space-y-6">
      {/* Demo Banner */}
      {isDemo && (
        <div className="ice-block p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📚</span>
            <div>
              <p className="font-semibold text-[var(--evergreen)]">Demo Mode - Course View</p>
              <p className="text-sm text-[var(--text-muted)]">Exploring with sample curriculum data</p>
            </div>
          </div>
        </div>
      )}

      {/* Course Header */}
      <div
        className="ice-block p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${course.color}15, ${course.color}05)`,
          borderLeft: `4px solid ${course.color}`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-graded">{course.code}</span>
              <Link href="/courses" className="text-sm text-[var(--text-muted)] hover:text-[var(--evergreen)]">
                ← Back to Courses
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-[var(--evergreen)]">{course.name}</h1>
            <p className="text-[var(--text-secondary)] mt-1">Instructor: {course.teacher}</p>
            {course.description && (
              <p className="text-[var(--text-muted)] mt-2 max-w-2xl">{course.description}</p>
            )}
          </div>
          {course.progress !== null && (
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className="text-sm text-[var(--text-muted)]">Course Progress</div>
                <div className="text-2xl font-bold gradient-text">{course.progress}%</div>
              </div>
              <div className="w-48">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-[var(--frost-border)] pb-2">
        {[
          { key: 'modules', label: 'Modules' },
          { key: 'announcements', label: 'Announcements' },
          { key: 'grades', label: 'Grades' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[var(--aurora-green)] to-[var(--accent-cyan)] text-white'
                : 'text-[var(--text-secondary)] hover:bg-[var(--ice-blue)]/50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'modules' && (
        <div className="space-y-4">
          {course.modules.map((module) => (
            <div key={module.id} className="ice-block overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-[var(--ice-blue)]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-[var(--text-muted)] transition-transform ${
                      expandedModules.has(module.id) ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <h3 className="font-semibold text-[var(--evergreen)]">{module.name}</h3>
                    {module.description && (
                      <p className="text-sm text-[var(--text-muted)]">{module.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-sm text-[var(--text-muted)]">
                  {module.items.filter((i) => i.isCompleted).length}/{module.items.length} completed
                </div>
              </button>
              {expandedModules.has(module.id) && (
                <div className="border-t border-[var(--frost-border-light)]">
                  {module.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 pl-12 hover:bg-[var(--ice-blue)]/20 transition-colors"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.isCompleted
                            ? 'bg-[var(--aurora-green)] border-[var(--aurora-green)]'
                            : 'border-[var(--frost-border)]'
                        }`}
                      >
                        {item.isCompleted && (
                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                      {getItemIcon(item.type)}
                      <div className="flex-1">
                        <span className={item.isCompleted ? 'text-[var(--text-muted)]' : 'text-[var(--evergreen)]'}>
                          {item.title}
                        </span>
                      </div>
                      {item.assignment?.dueDate && (
                        <span className="text-sm text-[var(--text-muted)]">
                          Due {new Date(item.assignment.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {item.grade !== null && (
                        <span className="badge badge-graded">{item.grade}%</span>
                      )}
                      {item.type === 'ASSIGNMENT' && isStudent && !item.isCompleted && (
                        <Button size="sm" onClick={() => openSubmitModal(item)}>
                          Submit
                        </Button>
                      )}
                      <span className="text-xs uppercase text-[var(--text-muted)] font-medium">
                        {item.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === 'announcements' && (
        <div className="ice-block p-6">
          {course.announcements.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No announcements yet</p>
          ) : (
            <div className="space-y-4">
              {course.announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 rounded-xl ${
                    announcement.isPinned
                      ? 'bg-[var(--aurora-green)]/10 border-l-4 border-[var(--aurora-green)]'
                      : 'bg-[var(--ice-blue)]/30'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-[var(--evergreen)]">{announcement.title}</h4>
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        Posted by {announcement.author} • {new Date(announcement.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {announcement.isPinned && <span className="badge badge-graded">Pinned</span>}
                  </div>
                  <p className="text-[var(--text-secondary)] mt-2">{announcement.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="ice-block overflow-hidden p-0">
          {gradedItems.length === 0 ? (
            <p className="text-[var(--text-muted)] text-center py-8">No graded assignments yet</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Assignment</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                {course.modules.flatMap((m) =>
                  m.items
                    .filter((i) => i.assignment)
                    .map((item) => (
                      <tr key={item.id}>
                        <td className="font-medium text-[var(--evergreen)]">{item.title}</td>
                        <td className="text-[var(--text-muted)]">
                          {item.assignment?.dueDate
                            ? new Date(item.assignment.dueDate).toLocaleDateString()
                            : 'No due date'}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              item.grade !== null
                                ? 'badge-graded'
                                : item.isCompleted
                                ? 'badge-pending'
                                : 'badge-absent'
                            }`}
                          >
                            {item.grade !== null ? 'Graded' : item.isCompleted ? 'Submitted' : 'Not Submitted'}
                          </span>
                        </td>
                        <td className="font-medium">
                          {item.grade !== null ? `${item.grade}/${item.assignment?.pointsPossible}` : '-'}
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Submit Assignment Modal */}
      {showSubmitModal && selectedAssignment && (
        <div className="modal-overlay" onClick={() => setShowSubmitModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="text-xl font-bold text-[var(--evergreen)]">Submit Assignment</h2>
            </div>
            <div className="modal-body space-y-4">
              <div>
                <h3 className="font-semibold text-[var(--evergreen)]">{selectedAssignment.item.title}</h3>
                {selectedAssignment.assignment.dueDate && (
                  <p className="text-sm text-[var(--text-muted)]">
                    Due: {new Date(selectedAssignment.assignment.dueDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-[var(--text-muted)]">
                  Points: {selectedAssignment.assignment.pointsPossible}
                </p>
              </div>

              {selectedAssignment.assignment.instructions && (
                <div className="p-3 rounded-xl bg-[var(--ice-blue)]/30 border border-[var(--frost-border-light)]">
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-1">Instructions:</p>
                  <p className="text-sm text-[var(--text-muted)]">{selectedAssignment.assignment.instructions}</p>
                </div>
              )}

              <div>
                <label className="input-label">Your Submission</label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  className="textarea-field"
                  rows={6}
                  placeholder="Enter your answer or paste your work here..."
                />
              </div>

              {submitMessage && (
                <div
                  className={`p-3 rounded-lg text-sm ${
                    submitMessage.includes('Submitted') || submitMessage.includes('success')
                      ? 'bg-green-50 text-green-600 border border-green-200'
                      : 'bg-red-50 text-red-600 border border-red-200'
                  }`}
                >
                  {submitMessage}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <Button variant="ghost" onClick={() => setShowSubmitModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} isLoading={isSubmitting}>
                Submit Assignment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
