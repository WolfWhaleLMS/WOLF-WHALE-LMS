import 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    name: string;
    firstName: string;
    lastName: string;
    role: string;
    xp: number;
    level: number;
    streak: number;
    avatar: string | null;
    children: Array<{ id: string; name: string }>;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      firstName: string;
      lastName: string;
      role: string;
      xp: number;
      level: number;
      streak: number;
      avatar: string | null;
      children: Array<{ id: string; name: string }>;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: string;
    firstName: string;
    lastName: string;
    xp: number;
    level: number;
    streak: number;
    avatar: string | null;
    children: Array<{ id: string; name: string }>;
  }
}
