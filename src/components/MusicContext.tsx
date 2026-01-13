'use client';

import { createContext, useContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';

interface Track {
  title: string;
  file: string;
}

interface MusicContextType {
  isPlaying: boolean;
  currentTrackIndex: number;
  currentTrack: Track;
  volume: number;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  nextTrack: () => void;
  setVolume: (volume: number) => void;
}

// Hardcoded playlist - Saskatchewan-inspired mix
const PLAYLIST: Track[] = [
  { title: 'Classical', file: '/music/track1.mp3' },
  { title: 'Powwow', file: '/music/track2.mp3' },
  { title: 'Native Flute', file: '/music/track3.mp3' },
  { title: 'Lofi Beats', file: '/music/track4.mp3' },
  { title: 'House', file: '/music/track5.mp3' },
];

const MusicContext = createContext<MusicContextType | null>(null);

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}

interface MusicProviderProps {
  children: ReactNode;
}

export default function MusicProvider({ children }: MusicProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [volume, setVolumeState] = useState(0.5);
  const [isClient, setIsClient] = useState(false);

  // Only run on client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize audio element on client
  useEffect(() => {
    if (!isClient) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(PLAYLIST[currentTrackIndex].file);
      audioRef.current.volume = volume;

      // Auto-play next track when current ends
      audioRef.current.addEventListener('ended', () => {
        setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [isClient]);

  // Update audio source when track changes
  useEffect(() => {
    if (!isClient || !audioRef.current) return;

    const wasPlaying = isPlaying;
    audioRef.current.src = PLAYLIST[currentTrackIndex].file;
    audioRef.current.load();

    if (wasPlaying) {
      audioRef.current.play().catch(() => {
        // Handle autoplay restrictions
        setIsPlaying(false);
      });
    }
  }, [currentTrackIndex, isClient]);

  // Update volume when changed
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        // Handle autoplay restrictions silently
      });
    }
  }, []);

  const pause = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const nextTrack = useCallback(() => {
    setCurrentTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(Math.max(0, Math.min(1, newVolume)));
  }, []);

  const currentTrack = PLAYLIST[currentTrackIndex];

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrackIndex,
        currentTrack,
        volume,
        play,
        pause,
        togglePlay,
        nextTrack,
        setVolume,
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}
