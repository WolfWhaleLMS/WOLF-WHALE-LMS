'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface DemoUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: 'STUDENT' | 'TEACHER' | 'PARENT' | 'ADMIN';
  xp: number;
  level: number;
  streak: number;
  children?: { id: string; name: string }[];
}

interface DemoSessionContextType {
  isDemo: boolean;
  demoUser: DemoUser | null;
  isDemoLoading: boolean;
  clearDemoSession: () => void;
  setDemoSession: (user: DemoUser) => void;
}

const DemoSessionContext = createContext<DemoSessionContextType>({
  isDemo: false,
  demoUser: null,
  isDemoLoading: true,
  clearDemoSession: () => {},
  setDemoSession: () => {},
});

export function useDemoSession() {
  return useContext(DemoSessionContext);
}

interface Props {
  children: ReactNode;
}

export default function DemoSessionProvider({ children }: Props) {
  const router = useRouter();
  const [isDemo, setIsDemo] = useState(false);
  const [demoUser, setDemoUser] = useState<DemoUser | null>(null);
  const [isDemoLoading, setIsDemoLoading] = useState(true);

  useEffect(() => {
    // Check for demo session on mount
    const checkDemoSession = () => {
      if (typeof window !== 'undefined') {
        const isDemoMode = localStorage.getItem('isDemo') === 'true';
        const demoSessionData = localStorage.getItem('demoSession');

        if (isDemoMode && demoSessionData) {
          try {
            const userData = JSON.parse(demoSessionData) as DemoUser;
            setIsDemo(true);
            setDemoUser(userData);
          } catch {
            // Invalid session data, clear it
            localStorage.removeItem('isDemo');
            localStorage.removeItem('demoSession');
            setIsDemo(false);
            setDemoUser(null);
          }
        } else {
          setIsDemo(false);
          setDemoUser(null);
        }
        setIsDemoLoading(false);
      }
    };

    checkDemoSession();

    // Listen for storage changes (e.g., login from another tab)
    window.addEventListener('storage', checkDemoSession);
    return () => window.removeEventListener('storage', checkDemoSession);
  }, []);

  const clearDemoSession = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isDemo');
      localStorage.removeItem('demoSession');
      setIsDemo(false);
      setDemoUser(null);
      router.push('/login');
    }
  }, [router]);

  const setDemoSession = useCallback((user: DemoUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demoSession', JSON.stringify(user));
      localStorage.setItem('isDemo', 'true');
      setIsDemo(true);
      setDemoUser(user);
    }
  }, []);

  return (
    <DemoSessionContext.Provider value={{ isDemo, demoUser, isDemoLoading, clearDemoSession, setDemoSession }}>
      {children}
    </DemoSessionContext.Provider>
  );
}
