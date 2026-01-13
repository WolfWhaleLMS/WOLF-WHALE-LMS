'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/Button';

interface Module {
  id: string;
  name: string;
  description: string;
  items: ModuleItem[];
  isExpanded: boolean;
}

interface ModuleItem {
  id: string;
  title: string;
  type: 'ASSIGNMENT' | 'PAGE' | 'FILE' | 'LINK' | 'QUIZ';
  isCompleted: boolean;
  dueDate?: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  teacher: string;
  progress: number;
  modules: Module[];
}

export default function CourseDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'modules' | 'announcements' | 'discussions' | 'grades'>('modules');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Mock course data
    setCourse({
      id: courseId,
      name: 'Introduction to Web Development',
      code: 'WEB101',
      description: 'Learn HTML, CSS, and JavaScript to build modern websites from scratch. This comprehensive course covers everything from basic markup to responsive design and interactivity.',
      color: '#00d4aa',
      teacher: 'Dr. Sarah Smith',
      progress: 75,
      modules: [
        {
          id: '1',
          name: 'HTML Fundamentals',
          description: 'Learn the basics of HTML markup',
          isExpanded: true,
          items: [
            { id: '1-1', title: 'Introduction to HTML', type: 'PAGE', isCompleted: true },
            { id: '1-2', title: 'HTML Elements & Tags', type: 'PAGE', isCompleted: true },
            { id: '1-3', title: 'Build Your First Web Page', type: 'ASSIGNMENT', isCompleted: true, dueDate: '2024-01-10' },
            { id: '1-4', title: 'HTML Quiz', type: 'QUIZ', isCompleted: true },
          ],
        },
        {
          id: '2',
          name: 'CSS Styling',
          description: 'Master CSS for beautiful layouts',
          isExpanded: true,
          items: [
            { id: '2-1', title: 'CSS Basics', type: 'PAGE', isCompleted: true },
            { id: '2-2', title: 'Selectors & Properties', type: 'PAGE', isCompleted: true },
            { id: '2-3', title: 'CSS Grid Layout', type: 'ASSIGNMENT', isCompleted: false, dueDate: '2024-01-20' },
            { id: '2-4', title: 'Flexbox Tutorial', type: 'FILE', isCompleted: false },
          ],
        },
        {
          id: '3',
          name: 'JavaScript Basics',
          description: 'Introduction to JavaScript programming',
          isExpanded: false,
          items: [
            { id: '3-1', title: 'Variables & Data Types', type: 'PAGE', isCompleted: false },
            { id: '3-2', title: 'Functions & Scope', type: 'PAGE', isCompleted: false },
            { id: '3-3', title: 'DOM Manipulation', type: 'PAGE', isCompleted: false },
            { id: '3-4', title: 'Portfolio Website', type: 'ASSIGNMENT', isCompleted: false, dueDate: '2024-01-30' },
          ],
        },
      ],
    });
  }, [courseId]);

  const toggleModule = (moduleId: string) => {
    setCourse((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        modules: prev.modules.map((m) =>
          m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
        ),
      };
    });
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

  if (status === 'loading' || !course) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div
        className="glass-card-solid p-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${course.color}15, ${course.color}05)`,
          borderLeft: `4px solid ${course.color}`,
        }}
      >
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="badge badge-graded">{course.code}</span>
              <Link href="/courses" className="text-sm text-gray-500 hover:text-gray-700">
                ← Back to Courses
              </Link>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{course.name}</h1>
            <p className="text-gray-600 mt-1">Instructor: {course.teacher}</p>
            <p className="text-gray-500 mt-2 max-w-2xl">{course.description}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="text-right">
              <div className="text-sm text-gray-500">Course Progress</div>
              <div className="text-2xl font-bold gradient-text">{course.progress}%</div>
            </div>
            <div className="w-48">
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        {[
          { key: 'modules', label: 'Modules' },
          { key: 'announcements', label: 'Announcements' },
          { key: 'discussions', label: 'Discussions' },
          { key: 'grades', label: 'Grades' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-t-lg font-medium transition-all ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-[#00d4aa] to-[#00a8cc] text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
            <div key={module.id} className="glass-card-solid overflow-hidden">
              <button
                onClick={() => toggleModule(module.id)}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      module.isExpanded ? 'rotate-90' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{module.name}</h3>
                    <p className="text-sm text-gray-500">{module.description}</p>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {module.items.filter((i) => i.isCompleted).length}/{module.items.length} completed
                </div>
              </button>
              {module.isExpanded && (
                <div className="border-t border-gray-100">
                  {module.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 pl-12 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          item.isCompleted
                            ? 'bg-[#00d4aa] border-[#00d4aa]'
                            : 'border-gray-300'
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
                        <span className={item.isCompleted ? 'text-gray-500' : 'text-gray-900'}>
                          {item.title}
                        </span>
                      </div>
                      {item.dueDate && (
                        <span className="text-sm text-gray-400">
                          Due {new Date(item.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      <span className="text-xs uppercase text-gray-400 font-medium">
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
        <div className="glass-card-solid p-6">
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-[#00d4aa] bg-[#00d4aa]/5 rounded-r-lg">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">Welcome to Web Development!</h4>
                  <p className="text-sm text-gray-500 mt-1">Posted by Dr. Sarah Smith • Jan 10, 2024</p>
                </div>
                <span className="badge badge-graded">Pinned</span>
              </div>
              <p className="text-gray-700 mt-2">
                Welcome to WEB101! I am excited to have you in this course. Please review the syllabus and complete the first module by Friday.
              </p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-semibold text-gray-900">Office Hours Reminder</h4>
              <p className="text-sm text-gray-500 mt-1">Posted by Dr. Sarah Smith • Jan 8, 2024</p>
              <p className="text-gray-700 mt-2">
                My office hours are Tuesday and Thursday 2-4 PM. Feel free to drop by with any questions!
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'discussions' && (
        <div className="glass-card-solid p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Discussion Topics</h3>
            <Button size="sm">New Topic</Button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Introduce Yourself!', replies: 24, lastActivity: '2h ago' },
              { title: 'Question about CSS Grid vs Flexbox', replies: 8, lastActivity: '5h ago' },
              { title: 'Best resources for learning JavaScript?', replies: 12, lastActivity: '1d ago' },
            ].map((topic, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-gray-900">{topic.title}</h4>
                  <span className="text-sm text-gray-500">{topic.lastActivity}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{topic.replies} replies</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grades' && (
        <div className="glass-card-solid overflow-hidden">
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
              {[
                { name: 'Build Your First Web Page', due: 'Jan 10', status: 'Graded', grade: '92/100' },
                { name: 'CSS Grid Layout', due: 'Jan 20', status: 'Pending', grade: '-' },
                { name: 'Portfolio Website', due: 'Jan 30', status: 'Not Submitted', grade: '-' },
              ].map((assignment, i) => (
                <tr key={i}>
                  <td className="font-medium">{assignment.name}</td>
                  <td>{assignment.due}</td>
                  <td>
                    <span className={`badge ${
                      assignment.status === 'Graded' ? 'badge-graded' :
                      assignment.status === 'Pending' ? 'badge-pending' : 'badge-absent'
                    }`}>
                      {assignment.status}
                    </span>
                  </td>
                  <td className="font-medium">{assignment.grade}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
