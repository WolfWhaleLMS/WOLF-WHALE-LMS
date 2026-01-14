'use client';

import { useCallback, useEffect, useRef } from 'react';
import { Howl } from 'howler';

// Sound effect types
export type SoundEffect =
  | 'click'
  | 'hover'
  | 'success'
  | 'error'
  | 'notification'
  | 'levelUp'
  | 'achievement'
  | 'submit'
  | 'navigate'
  | 'toggle';

// Sound file paths and settings
const SOUND_CONFIG: Record<SoundEffect, { src: string; volume: number }> = {
  click: { src: '/sounds/click.mp3', volume: 0.4 },
  hover: { src: '/sounds/hover.mp3', volume: 0.2 },
  success: { src: '/sounds/success.mp3', volume: 0.5 },
  error: { src: '/sounds/error.mp3', volume: 0.5 },
  notification: { src: '/sounds/notification.mp3', volume: 0.5 },
  levelUp: { src: '/sounds/level-up.mp3', volume: 0.6 },
  achievement: { src: '/sounds/achievement.mp3', volume: 0.6 },
  submit: { src: '/sounds/submit.mp3', volume: 0.4 },
  navigate: { src: '/sounds/navigate.mp3', volume: 0.3 },
  toggle: { src: '/sounds/toggle.mp3', volume: 0.3 },
};

// Generate placeholder sounds using Web Audio API as fallback
function createPlaceholderSound(type: SoundEffect): Howl | null {
  // Return null - sounds will be silent if files don't exist
  // In production, you'd add the actual sound files
  return null;
}

// Singleton sound manager
class SoundManager {
  private sounds: Map<SoundEffect, Howl> = new Map();
  private enabled: boolean = true;
  private initialized: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check localStorage for sound preference
      const savedPref = localStorage.getItem('sfx-enabled');
      this.enabled = savedPref !== 'false';
    }
  }

  private initSound(effect: SoundEffect): Howl | null {
    const config = SOUND_CONFIG[effect];

    try {
      const sound = new Howl({
        src: [config.src],
        volume: config.volume,
        preload: true,
        onloaderror: () => {
          // Sound file doesn't exist - use placeholder or stay silent
          console.log(`[SFX] Sound file not found: ${config.src} - using placeholder`);
        },
      });

      return sound;
    } catch {
      return createPlaceholderSound(effect);
    }
  }

  getSound(effect: SoundEffect): Howl | null {
    if (!this.sounds.has(effect)) {
      const sound = this.initSound(effect);
      if (sound) {
        this.sounds.set(effect, sound);
      }
    }
    return this.sounds.get(effect) || null;
  }

  play(effect: SoundEffect): void {
    if (!this.enabled) return;

    const sound = this.getSound(effect);
    if (sound) {
      sound.play();
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sfx-enabled', String(enabled));
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // Preload commonly used sounds
  preload(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Preload click sound as it's used most often
    this.getSound('click');
    this.getSound('hover');
  }
}

// Global sound manager instance
let soundManager: SoundManager | null = null;

function getSoundManager(): SoundManager {
  if (typeof window === 'undefined') {
    // Return a dummy manager for SSR
    return {
      play: () => {},
      setEnabled: () => {},
      isEnabled: () => true,
      preload: () => {},
      getSound: () => null,
    } as unknown as SoundManager;
  }

  if (!soundManager) {
    soundManager = new SoundManager();
  }
  return soundManager;
}

// Main hook
export function useSfx() {
  const manager = useRef<SoundManager>(getSoundManager());

  // Preload sounds on mount
  useEffect(() => {
    manager.current.preload();
  }, []);

  const play = useCallback((effect: SoundEffect) => {
    manager.current.play(effect);
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    manager.current.setEnabled(enabled);
  }, []);

  const isEnabled = useCallback(() => {
    return manager.current.isEnabled();
  }, []);

  return {
    play,
    setEnabled,
    isEnabled,
  };
}

// Utility function for one-off sound plays (doesn't require hook)
export function playSfx(effect: SoundEffect): void {
  getSoundManager().play(effect);
}

// Export sound manager for global access
export { getSoundManager };
