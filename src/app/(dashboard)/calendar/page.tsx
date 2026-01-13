'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'assignment' | 'exam' | 'class' | 'personal';
  courseName?: string;
  color: string;
}

export default function CalendarPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Mock events
    const today = new Date();
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Portfolio Website Due',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
        type: 'assignment',
        courseName: 'WEB101',
        color: '#00d4aa',
      },
      {
        id: '2',
        title: 'Binary Tree Lab Due',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5).toISOString().split('T')[0],
        type: 'assignment',
        courseName: 'CS201',
        color: '#4facfe',
      },
      {
        id: '3',
        title: 'Midterm Exam',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10).toISOString().split('T')[0],
        type: 'exam',
        courseName: 'CS201',
        color: '#ff6b6b',
      },
      {
        id: '4',
        title: 'React Workshop',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7).toISOString().split('T')[0],
        type: 'class',
        courseName: 'WEB301',
        color: '#43e97b',
      },
      {
        id: '5',
        title: 'Study Group',
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split('T')[0],
        type: 'personal',
        color: '#ffd700',
      },
    ];
    setEvents(mockEvents);
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDayOfMonth = getFirstDayOfMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const getEventsForDate = (day: number) => {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toISOString()
      .split('T')[0];
    return events.filter((e) => e.date === dateStr);
  };

  const selectedDateEvents = selectedDate
    ? events.filter((e) => e.date === selectedDate)
    : [];

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  const today = new Date();
  const isToday = (day: number) => {
    return (
      today.getDate() === day &&
      today.getMonth() === currentDate.getMonth() &&
      today.getFullYear() === currentDate.getFullYear()
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600">Keep track of assignments, exams, and events</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 glass-card-solid p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={prevMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-gray-900">{monthName}</h2>
            <button
              onClick={nextMonth}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 p-1"></div>
            ))}

            {/* Days of the month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
                .toISOString()
                .split('T')[0];
              const dayEvents = getEventsForDate(day);

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`h-24 p-1 rounded-lg text-left transition-all ${
                    selectedDate === dateStr
                      ? 'bg-[#e0f7fa] ring-2 ring-[#00d4aa]'
                      : 'hover:bg-gray-50'
                  } ${isToday(day) ? 'bg-[#00d4aa]/10' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${
                    isToday(day) ? 'text-[#00d4aa]' : 'text-gray-900'
                  }`}>
                    {day}
                  </div>
                  <div className="space-y-0.5">
                    {dayEvents.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs truncate px-1 rounded"
                        style={{ backgroundColor: `${event.color}20`, color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-gray-400 px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Sidebar - Selected Date Events */}
        <div className="glass-card-solid p-5">
          <h3 className="font-bold text-gray-900 mb-4">
            {selectedDate
              ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('default', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                })
              : 'Upcoming Events'}
          </h3>

          <div className="space-y-3">
            {(selectedDate ? selectedDateEvents : events.slice(0, 5)).map((event) => (
              <div
                key={event.id}
                className="p-3 rounded-lg"
                style={{ backgroundColor: `${event.color}10` }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: event.color }}
                  ></div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    {event.courseName && (
                      <p className="text-sm text-gray-500">{event.courseName}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1 capitalize">{event.type}</p>
                    {!selectedDate && (
                      <p className="text-xs text-gray-400">
                        {new Date(event.date + 'T00:00:00').toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {(selectedDate ? selectedDateEvents : events).length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-gray-500">No events scheduled</p>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Event Types</h4>
            <div className="space-y-2">
              {[
                { type: 'Assignment', color: '#00d4aa' },
                { type: 'Exam', color: '#ff6b6b' },
                { type: 'Class', color: '#43e97b' },
                { type: 'Personal', color: '#ffd700' },
              ].map((item) => (
                <div key={item.type} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
