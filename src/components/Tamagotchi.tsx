'use client';

import { useState, useEffect, useCallback } from 'react';
import Button from './Button';

interface PetData {
  id: string;
  name: string;
  type: string;
  emoji: string;
  hunger: number;
  happiness: number;
  xp: number;
  level: number;
  xpNeeded: number;
  xpProgress: number;
  mood?: string;
  lastFed: string;
  lastPlayed: string;
}

const PET_TYPES = [
  { type: 'DINO', emoji: '🦖', name: 'Dino' },
  { type: 'CAT', emoji: '🐱', name: 'Cat' },
  { type: 'DOG', emoji: '🐕', name: 'Dog' },
  { type: 'BUNNY', emoji: '🐰', name: 'Bunny' },
  { type: 'DRAGON', emoji: '🐉', name: 'Dragon' },
];

// Demo pet data for demo mode
const DEMO_PET: PetData = {
  id: 'demo-pet',
  name: 'Buddy',
  type: 'DINO',
  emoji: '🦖',
  hunger: 75,
  happiness: 80,
  xp: 45,
  level: 2,
  xpNeeded: 200,
  xpProgress: 22.5,
  mood: 'happy',
  lastFed: new Date().toISOString(),
  lastPlayed: new Date().toISOString(),
};

interface TamagotchiProps {
  isDemo?: boolean;
}

export default function Tamagotchi({ isDemo = false }: TamagotchiProps) {
  const [pet, setPet] = useState<PetData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [actionMessage, setActionMessage] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [newName, setNewName] = useState('');
  const [walkDirection, setWalkDirection] = useState<'left' | 'right'>('right');

  // Fetch pet data
  const fetchPet = useCallback(async () => {
    if (isDemo) {
      setPet(DEMO_PET);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/student/pet');
      const data = await response.json();
      if (response.ok) {
        setPet(data.pet);
      }
    } catch (error) {
      console.error('Failed to fetch pet:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  // Walking animation - change direction periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setWalkDirection((prev) => (prev === 'left' ? 'right' : 'left'));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Perform pet action
  const performAction = async (action: 'FEED' | 'PLAY') => {
    if (isDemo) {
      // Demo mode - just show animation
      setIsActing(true);
      setActionMessage(action === 'FEED' ? '🍖 Yum yum!' : '🎾 Wheee!');
      setPet((prev) =>
        prev
          ? {
              ...prev,
              hunger: action === 'FEED' ? Math.min(100, prev.hunger + 30) : prev.hunger,
              happiness: action === 'PLAY' ? Math.min(100, prev.happiness + 25) : prev.happiness,
              xp: prev.xp + (action === 'FEED' ? 10 : 15),
            }
          : prev
      );
      setTimeout(() => {
        setIsActing(false);
        setActionMessage('');
      }, 2000);
      return;
    }

    setIsActing(true);
    try {
      const response = await fetch('/api/student/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();

      if (response.ok) {
        setPet(data.pet);
        setActionMessage(data.message);
      } else {
        setActionMessage(data.error || 'Something went wrong');
      }
    } catch {
      setActionMessage('Failed to perform action');
    } finally {
      setTimeout(() => {
        setIsActing(false);
        setActionMessage('');
      }, 2000);
    }
  };

  // Rename pet
  const renamePet = async () => {
    if (!newName.trim()) return;

    if (isDemo) {
      setPet((prev) => (prev ? { ...prev, name: newName } : prev));
      setNewName('');
      setShowSettings(false);
      return;
    }

    try {
      const response = await fetch('/api/student/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'RENAME', name: newName }),
      });

      const data = await response.json();
      if (response.ok) {
        setPet(data.pet);
        setNewName('');
        setShowSettings(false);
      }
    } catch (error) {
      console.error('Failed to rename pet:', error);
    }
  };

  // Change pet type
  const changePetType = async (newType: string) => {
    if (isDemo) {
      const petInfo = PET_TYPES.find((p) => p.type === newType);
      setPet((prev) =>
        prev ? { ...prev, type: newType, emoji: petInfo?.emoji || '🦖' } : prev
      );
      return;
    }

    try {
      const response = await fetch('/api/student/pet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'CHANGE_TYPE', type: newType }),
      });

      const data = await response.json();
      if (response.ok) {
        setPet(data.pet);
      }
    } catch (error) {
      console.error('Failed to change pet type:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="ice-block p-6">
        <div className="animate-pulse">
          <div className="h-40 bg-[var(--ice-blue)]/50 rounded-xl mb-4"></div>
          <div className="h-4 bg-[var(--ice-blue)]/50 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-[var(--ice-blue)]/50 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!pet) {
    return null;
  }

  const getStatColor = (value: number) => {
    if (value >= 70) return 'bg-[var(--aurora-green)]';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMoodEmoji = () => {
    const avgStats = (pet.hunger + pet.happiness) / 2;
    if (avgStats >= 70) return '😊';
    if (avgStats >= 40) return '😐';
    return '😢';
  };

  return (
    <div className="ice-block p-6">
      {/* Header with settings */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-[var(--evergreen)]">My Pet</h3>
          <span className="badge badge-graded">Lv. {pet.level}</span>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-[var(--ice-blue)]/50 transition-colors"
          title="Pet Settings"
        >
          <svg className="w-5 h-5 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="mb-4 p-4 rounded-xl bg-[var(--ice-blue)]/30 border border-[var(--frost-border-light)]">
          <div className="space-y-4">
            {/* Rename */}
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-1 block">
                Rename Pet
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder={pet.name}
                  maxLength={20}
                  className="input-field flex-1 text-sm"
                />
                <Button size="sm" onClick={renamePet} disabled={!newName.trim()}>
                  Save
                </Button>
              </div>
            </div>

            {/* Change Type */}
            <div>
              <label className="text-sm font-medium text-[var(--text-secondary)] mb-2 block">
                Change Pet Type
              </label>
              <div className="flex flex-wrap gap-2">
                {PET_TYPES.map((p) => (
                  <button
                    key={p.type}
                    onClick={() => changePetType(p.type)}
                    className={`px-3 py-2 rounded-lg text-lg transition-all ${
                      pet.type === p.type
                        ? 'bg-[var(--aurora-green)] ring-2 ring-[var(--aurora-green)]'
                        : 'bg-white/50 hover:bg-white/80 border border-[var(--frost-border-light)]'
                    }`}
                    title={p.name}
                  >
                    {p.emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Glass Tank / Pet Container */}
      <div className="relative mb-4">
        <div
          className="relative h-32 rounded-2xl overflow-hidden"
          style={{
            background: 'linear-gradient(180deg, rgba(135, 206, 235, 0.3) 0%, rgba(70, 130, 180, 0.2) 100%)',
            border: '3px solid rgba(255, 255, 255, 0.4)',
            boxShadow: 'inset 0 2px 10px rgba(255, 255, 255, 0.3), 0 4px 15px rgba(0, 0, 0, 0.1)',
          }}
        >
          {/* Ground */}
          <div
            className="absolute bottom-0 left-0 right-0 h-6"
            style={{
              background: 'linear-gradient(180deg, #90EE90 0%, #228B22 100%)',
              borderTop: '2px solid #228B22',
            }}
          />

          {/* Pet with walking animation */}
          <div
            className={`absolute bottom-6 transition-all duration-[3000ms] ease-linear ${
              walkDirection === 'right' ? 'left-[70%]' : 'left-[10%]'
            }`}
            style={{
              transform: walkDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            }}
          >
            <div
              className={`text-5xl ${isActing ? 'animate-bounce' : 'animate-pulse'}`}
              style={{
                filter: 'drop-shadow(2px 2px 2px rgba(0,0,0,0.2))',
              }}
            >
              {pet.emoji}
            </div>
          </div>

          {/* Mood indicator */}
          <div className="absolute top-2 right-2 text-lg">{getMoodEmoji()}</div>

          {/* Action message */}
          {actionMessage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-white/90 px-4 py-2 rounded-full shadow-lg text-sm font-medium text-[var(--evergreen)] animate-bounce">
                {actionMessage}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pet Name */}
      <div className="text-center mb-4">
        <p className="text-lg font-bold text-[var(--evergreen)]">{pet.name}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {PET_TYPES.find((p) => p.type === pet.type)?.name || 'Pet'}
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-3 mb-4">
        {/* Hunger */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
              🍖 Hunger
            </span>
            <span className="text-xs text-[var(--text-muted)]">{pet.hunger}%</span>
          </div>
          <div className="h-2 bg-[var(--ice-blue)]/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getStatColor(pet.hunger)}`}
              style={{ width: `${pet.hunger}%` }}
            />
          </div>
        </div>

        {/* Happiness */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
              💖 Happiness
            </span>
            <span className="text-xs text-[var(--text-muted)]">{pet.happiness}%</span>
          </div>
          <div className="h-2 bg-[var(--ice-blue)]/30 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${getStatColor(pet.happiness)}`}
              style={{ width: `${pet.happiness}%` }}
            />
          </div>
        </div>

        {/* XP Progress */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-[var(--text-secondary)] flex items-center gap-1">
              ⭐ XP
            </span>
            <span className="text-xs text-[var(--text-muted)]">
              {pet.xp} / {pet.xpNeeded}
            </span>
          </div>
          <div className="h-2 bg-[var(--ice-blue)]/30 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all bg-gradient-to-r from-[var(--gold-start)] to-[var(--gold-end)]"
              style={{ width: `${pet.xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => performAction('FEED')}
          disabled={isActing || pet.hunger >= 95}
          className="flex items-center justify-center gap-2"
        >
          🍖 Feed
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => performAction('PLAY')}
          disabled={isActing || pet.happiness >= 95}
          className="flex items-center justify-center gap-2"
        >
          🎾 Play
        </Button>
      </div>

      {/* Tips */}
      {(pet.hunger < 30 || pet.happiness < 30) && (
        <div className="mt-3 p-2 rounded-lg bg-amber-50 border border-amber-200">
          <p className="text-xs text-amber-700">
            {pet.hunger < 30 && '🍖 Your pet is hungry! Feed them to restore energy.'}
            {pet.hunger >= 30 && pet.happiness < 30 && '🎾 Your pet seems sad. Play with them!'}
          </p>
        </div>
      )}
    </div>
  );
}
