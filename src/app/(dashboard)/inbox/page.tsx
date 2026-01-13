'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/Button';

interface Message {
  id: string;
  senderName: string;
  senderRole: string;
  subject: string;
  preview: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export default function InboxPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newMessage, setNewMessage] = useState({ to: '', subject: '', content: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    // Mock messages
    setMessages([
      {
        id: '1',
        senderName: 'Dr. Sarah Smith',
        senderRole: 'TEACHER',
        subject: 'Great progress on your portfolio project!',
        preview: 'I wanted to reach out and let you know that your portfolio website is coming along nicely...',
        content: `Hi there,

I wanted to reach out and let you know that your portfolio website is coming along nicely. Your implementation of responsive design is particularly impressive.

A few suggestions for improvement:
1. Consider adding more contrast to your color scheme
2. The navigation could benefit from some smooth scrolling
3. Add some loading states for better UX

Keep up the great work!

Best regards,
Dr. Sarah Smith`,
        isRead: false,
        createdAt: '2024-01-15T10:30:00Z',
      },
      {
        id: '2',
        senderName: 'Prof. Michael Johnson',
        senderRole: 'TEACHER',
        subject: 'Upcoming exam reminder',
        preview: 'This is a reminder that the midterm exam for CS201 will be held next week...',
        content: `Dear Student,

This is a reminder that the midterm exam for CS201 (Data Structures & Algorithms) will be held next week on Friday.

Topics covered:
- Arrays and Linked Lists
- Stacks and Queues
- Binary Trees
- Basic sorting algorithms

Please make sure to review all lecture materials and practice problems.

Good luck!

Prof. Johnson`,
        isRead: true,
        createdAt: '2024-01-14T15:00:00Z',
      },
      {
        id: '3',
        senderName: 'LearnQuest System',
        senderRole: 'SYSTEM',
        subject: 'Achievement Unlocked: Week Warrior!',
        preview: 'Congratulations! You\'ve maintained a 7-day learning streak...',
        content: `Congratulations!

You've unlocked a new achievement: Week Warrior!

You've maintained a 7-day learning streak. Keep up the momentum!

Reward: +100 XP

Keep learning and earning!

The LearnQuest Team`,
        isRead: true,
        createdAt: '2024-01-13T09:00:00Z',
      },
    ]);
  }, []);

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setIsComposing(false);
    // Mark as read
    setMessages((prev) =>
      prev.map((m) => (m.id === message.id ? { ...m, isRead: true } : m))
    );
  };

  const handleSendMessage = () => {
    if (!newMessage.to || !newMessage.subject || !newMessage.content) {
      alert('Please fill in all fields');
      return;
    }
    // Simulate sending
    alert('Message sent successfully!');
    setIsComposing(false);
    setNewMessage({ to: '', subject: '', content: '' });
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00d4aa]"></div>
      </div>
    );
  }

  const unreadCount = messages.filter((m) => !m.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inbox</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'All caught up!'}
          </p>
        </div>
        <Button onClick={() => { setIsComposing(true); setSelectedMessage(null); }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Compose
        </Button>
      </div>

      <div className="grid lg:grid-cols-12 gap-6">
        {/* Messages List */}
        <div className="lg:col-span-4 glass-card-solid p-4 max-h-[70vh] overflow-y-auto">
          <div className="space-y-2">
            {messages.map((message) => (
              <button
                key={message.id}
                onClick={() => handleSelectMessage(message)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  selectedMessage?.id === message.id
                    ? 'bg-[#e0f7fa] border-2 border-[#00d4aa]'
                    : message.isRead
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'bg-white hover:bg-gray-50 border-l-4 border-[#00d4aa]'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {message.senderName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`font-medium text-gray-900 text-sm truncate ${!message.isRead ? 'font-bold' : ''}`}>
                        {message.senderName}
                      </p>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${!message.isRead ? 'text-gray-900 font-medium' : 'text-gray-600'}`}>
                      {message.subject}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-1">{message.preview}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Message Content / Compose */}
        <div className="lg:col-span-8 glass-card-solid p-6">
          {isComposing ? (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900">New Message</h2>
              <div>
                <label className="input-label">To</label>
                <input
                  type="text"
                  value={newMessage.to}
                  onChange={(e) => setNewMessage({ ...newMessage, to: e.target.value })}
                  className="input-field"
                  placeholder="Recipient name or email"
                />
              </div>
              <div>
                <label className="input-label">Subject</label>
                <input
                  type="text"
                  value={newMessage.subject}
                  onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
                  className="input-field"
                  placeholder="Message subject"
                />
              </div>
              <div>
                <label className="input-label">Message</label>
                <textarea
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
                  className="textarea-field"
                  rows={10}
                  placeholder="Write your message..."
                />
              </div>
              <div className="flex gap-3">
                <Button onClick={handleSendMessage}>Send Message</Button>
                <Button variant="ghost" onClick={() => setIsComposing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : selectedMessage ? (
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
                <div className="flex items-center gap-3 mt-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4aa] to-[#00a8cc] flex items-center justify-center text-white text-sm font-medium">
                    {selectedMessage.senderName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedMessage.senderName}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(selectedMessage.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <span className="badge badge-graded ml-auto">{selectedMessage.senderRole}</span>
                </div>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsComposing(true);
                    setNewMessage({
                      to: selectedMessage.senderName,
                      subject: `Re: ${selectedMessage.subject}`,
                      content: '',
                    });
                  }}
                >
                  Reply
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📬</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Select a message</h3>
              <p className="text-gray-600">Choose a message from the list to read it</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
