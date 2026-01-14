import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/db';
import { authOptions } from '@/lib/auth';

// Pet types with their emojis
const PET_TYPES = {
  DINO: '🦖',
  CAT: '🐱',
  DOG: '🐕',
  BUNNY: '🐰',
  DRAGON: '🐉',
};

// Calculate stat decay based on time passed
function calculateDecay(lastInteraction: Date, currentValue: number): number {
  const now = new Date();
  const hoursPassed = (now.getTime() - lastInteraction.getTime()) / (1000 * 60 * 60);

  // Decay rate: lose 5 points per hour, minimum 0
  const decay = Math.floor(hoursPassed * 5);
  return Math.max(0, currentValue - decay);
}

// Calculate XP needed for next level
function xpForLevel(level: number): number {
  return level * 100;
}

// GET - Fetch pet stats with decay calculation
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students have pets' }, { status: 403 });
    }

    const userId = session.user.id;

    // Get or create pet
    let pet = await prisma.pet.findUnique({
      where: { studentId: userId },
    });

    if (!pet) {
      // Create default pet for new students
      pet = await prisma.pet.create({
        data: {
          studentId: userId,
          name: 'Buddy',
          type: 'DINO',
        },
      });
    }

    // Calculate current stats with decay
    const currentHunger = calculateDecay(pet.lastFed, pet.hunger);
    const currentHappiness = calculateDecay(pet.lastPlayed, pet.happiness);

    // Update decayed stats in database if significantly changed
    if (currentHunger !== pet.hunger || currentHappiness !== pet.happiness) {
      await prisma.pet.update({
        where: { id: pet.id },
        data: {
          hunger: currentHunger,
          happiness: currentHappiness,
        },
      });
    }

    // Calculate level progress
    const xpNeeded = xpForLevel(pet.level);
    const xpProgress = Math.min((pet.xp / xpNeeded) * 100, 100);

    // Determine pet mood based on stats
    let mood = 'happy';
    const avgStats = (currentHunger + currentHappiness) / 2;
    if (avgStats < 30) mood = 'sad';
    else if (avgStats < 60) mood = 'neutral';

    return NextResponse.json({
      pet: {
        id: pet.id,
        name: pet.name,
        type: pet.type,
        emoji: PET_TYPES[pet.type as keyof typeof PET_TYPES] || '🦖',
        hunger: currentHunger,
        happiness: currentHappiness,
        xp: pet.xp,
        level: pet.level,
        xpNeeded,
        xpProgress,
        mood,
        lastFed: pet.lastFed,
        lastPlayed: pet.lastPlayed,
      },
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json({ error: 'Failed to fetch pet' }, { status: 500 });
  }
}

// POST - Pet actions (FEED, PLAY, RENAME, CHANGE_TYPE)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students have pets' }, { status: 403 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { action, name, type } = body as {
      action: 'FEED' | 'PLAY' | 'RENAME' | 'CHANGE_TYPE';
      name?: string;
      type?: string;
    };

    // Get pet
    let pet = await prisma.pet.findUnique({
      where: { studentId: userId },
    });

    if (!pet) {
      return NextResponse.json({ error: 'Pet not found' }, { status: 404 });
    }

    // Calculate current stats with decay
    const currentHunger = calculateDecay(pet.lastFed, pet.hunger);
    const currentHappiness = calculateDecay(pet.lastPlayed, pet.happiness);

    let xpGained = 0;
    let message = '';
    const updateData: {
      hunger?: number;
      happiness?: number;
      xp?: number;
      level?: number;
      lastFed?: Date;
      lastPlayed?: Date;
      name?: string;
      type?: string;
    } = {};

    switch (action) {
      case 'FEED':
        // Can't feed if already full
        if (currentHunger >= 95) {
          return NextResponse.json({
            error: 'Your pet is not hungry right now!',
            pet: {
              ...pet,
              hunger: currentHunger,
              happiness: currentHappiness,
            }
          }, { status: 400 });
        }

        // Feed increases hunger (satiety) and gives XP
        xpGained = 10;
        updateData.hunger = Math.min(100, currentHunger + 30);
        updateData.lastFed = new Date();
        updateData.xp = pet.xp + xpGained;
        message = `${pet.name} enjoyed the food! +${xpGained} XP`;
        break;

      case 'PLAY':
        // Can't play if already very happy
        if (currentHappiness >= 95) {
          return NextResponse.json({
            error: 'Your pet is already very happy!',
            pet: {
              ...pet,
              hunger: currentHunger,
              happiness: currentHappiness,
            }
          }, { status: 400 });
        }

        // Play increases happiness and gives XP
        xpGained = 15;
        updateData.happiness = Math.min(100, currentHappiness + 25);
        updateData.lastPlayed = new Date();
        updateData.xp = pet.xp + xpGained;
        message = `${pet.name} had fun playing! +${xpGained} XP`;
        break;

      case 'RENAME':
        if (!name || name.trim().length === 0) {
          return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }
        if (name.length > 20) {
          return NextResponse.json({ error: 'Name must be 20 characters or less' }, { status: 400 });
        }
        updateData.name = name.trim();
        message = `Your pet is now named ${name}!`;
        break;

      case 'CHANGE_TYPE':
        if (!type || !PET_TYPES[type as keyof typeof PET_TYPES]) {
          return NextResponse.json({ error: 'Invalid pet type' }, { status: 400 });
        }
        updateData.type = type;
        message = `Your pet transformed into a ${type.toLowerCase()}!`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Check for level up
    if (updateData.xp) {
      const newXp = updateData.xp;
      const xpNeeded = xpForLevel(pet.level);
      if (newXp >= xpNeeded) {
        updateData.level = pet.level + 1;
        updateData.xp = newXp - xpNeeded;
        message += ` 🎉 Level up! Now level ${updateData.level}!`;
      }
    }

    // Update pet
    const updatedPet = await prisma.pet.update({
      where: { id: pet.id },
      data: updateData,
    });

    // Get final stats
    const finalHunger = updateData.hunger ?? currentHunger;
    const finalHappiness = updateData.happiness ?? currentHappiness;

    return NextResponse.json({
      message,
      xpGained,
      pet: {
        id: updatedPet.id,
        name: updatedPet.name,
        type: updatedPet.type,
        emoji: PET_TYPES[updatedPet.type as keyof typeof PET_TYPES] || '🦖',
        hunger: finalHunger,
        happiness: finalHappiness,
        xp: updatedPet.xp,
        level: updatedPet.level,
        xpNeeded: xpForLevel(updatedPet.level),
        xpProgress: Math.min((updatedPet.xp / xpForLevel(updatedPet.level)) * 100, 100),
        lastFed: updatedPet.lastFed,
        lastPlayed: updatedPet.lastPlayed,
      },
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json({ error: 'Failed to update pet' }, { status: 500 });
  }
}
