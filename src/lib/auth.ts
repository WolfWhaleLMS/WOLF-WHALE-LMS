import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from './db';

// XP System Constants
export const XP_PER_LEVEL = 1000;

export const XP_REWARDS = {
  SUBMIT_ASSIGNMENT: 50,
  COMPLETE_MODULE: 100,
  PERFECT_SCORE: 200,
  STREAK_BONUS: 25,
  EARLY_SUBMISSION: 30,
  FIRST_LOGIN_OF_DAY: 10,
};

// XP Helper Functions
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpToNextLevel(xp: number): number {
  const currentLevelXp = xp % XP_PER_LEVEL;
  return XP_PER_LEVEL - currentLevelXp;
}

export function xpProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL * 100;
}

export async function addXP(userId: string, amount: number): Promise<{ newXp: number; newLevel: number; leveledUp: boolean }> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error('User not found');

  const oldLevel = user.level;
  const newXp = user.xp + amount;
  const newLevel = calculateLevel(newXp);
  const leveledUp = newLevel > oldLevel;

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXp, level: newLevel },
  });

  return { newXp, newLevel, leveledUp };
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            children: {
              include: {
                child: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        // Update last active timestamp and potentially streak
        const now = new Date();
        const lastActive = user.lastActiveAt;
        let newStreak = user.streak;

        if (lastActive) {
          const daysSinceLastActive = Math.floor(
            (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
          );
          if (daysSinceLastActive === 1) {
            newStreak += 1;
          } else if (daysSinceLastActive > 1) {
            newStreak = 1;
          }
        } else {
          newStreak = 1;
        }

        await prisma.user.update({
          where: { id: user.id },
          data: { lastActiveAt: now, streak: newStreak },
        });

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          xp: user.xp,
          level: user.level,
          streak: newStreak,
          avatar: user.avatar,
          children: user.children.map((pc) => ({
            id: pc.child.id,
            name: `${pc.child.firstName} ${pc.child.lastName}`,
          })),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.xp = user.xp;
        token.level = user.level;
        token.streak = user.streak;
        token.avatar = user.avatar;
        token.children = user.children;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.xp = token.xp as number;
        session.user.level = token.level as number;
        session.user.streak = token.streak as number;
        session.user.avatar = token.avatar as string | null;
        session.user.children = token.children as Array<{ id: string; name: string }>;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
