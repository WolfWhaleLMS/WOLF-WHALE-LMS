'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';

interface ChildSwitcherProps {
  selectedChildId: string | null;
  onChildSelect: (childId: string) => void;
}

export default function ChildSwitcher({ selectedChildId, onChildSelect }: ChildSwitcherProps) {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  if (!session || session.user.role !== 'PARENT' || !session.user.children?.length) {
    return null;
  }

  const selectedChild = session.user.children.find((c) => c.id === selectedChildId);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 glass-card-solid rounded-lg hover:shadow-md transition-all"
      >
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center">
          <span className="text-white font-medium text-sm">
            {selectedChild?.name.split(' ').map((n) => n[0]).join('')}
          </span>
        </div>
        <span className="font-medium text-gray-700">
          {selectedChild?.name || 'Select Child'}
        </span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-full glass-card-solid rounded-lg shadow-lg py-2 z-50">
          {session.user.children.map((child) => (
            <button
              key={child.id}
              onClick={() => {
                onChildSelect(child.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 transition-colors ${
                child.id === selectedChildId ? 'bg-[#e0f7fa]' : ''
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#4facfe] to-[#00f2fe] flex items-center justify-center">
                <span className="text-white font-medium text-sm">
                  {child.name.split(' ').map((n) => n[0]).join('')}
                </span>
              </div>
              <span className="font-medium text-gray-700">{child.name}</span>
              {child.id === selectedChildId && (
                <svg className="w-4 h-4 text-[#00d4aa] ml-auto" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
