'use client';

import { useState } from 'react';
import { useMusic } from './MusicContext';

export default function RadioWidget() {
  const { isPlaying, currentTrack, volume, togglePlay, nextTrack, setVolume } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`
        fixed bottom-6 right-6 z-50
        transition-all duration-300 ease-out
        ${isExpanded ? 'w-72' : 'w-14'}
      `}
    >
      {/* Main Widget Container - Boreal Ice Block */}
      <div
        className="
          relative overflow-hidden
          bg-gradient-to-br from-white/90 via-[var(--ice-blue)]/80 to-white/85
          backdrop-blur-xl
          border-2 border-white/80
          rounded-2xl
          shadow-[0_8px_32px_rgba(0,77,64,0.15),0_0_60px_rgba(178,235,242,0.4)]
        "
        style={{
          boxShadow: `
            0 8px 32px rgba(0, 77, 64, 0.15),
            0 0 60px rgba(178, 235, 242, 0.4),
            inset 0 2px 0 rgba(255, 255, 255, 0.8),
            inset 0 0 0 1px rgba(255, 255, 255, 0.5)
          `,
        }}
      >
        {/* Ice Shine Effect */}
        <div
          className="absolute top-0 left-0 right-0 h-1/2 pointer-events-none rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0) 100%)',
          }}
        />

        <div className="relative p-3">
          {/* Collapsed View - Just the toggle button */}
          {!isExpanded ? (
            <button
              onClick={() => setIsExpanded(true)}
              className="
                w-8 h-8 flex items-center justify-center
                rounded-xl
                bg-gradient-to-br from-[var(--evergreen)] to-[var(--evergreen-light)]
                text-white
                hover:scale-105
                transition-transform
                border border-white/30
                shadow-lg
              "
              aria-label="Open radio"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
              </svg>
            </button>
          ) : (
            /* Expanded View - Full Controls */
            <div className="space-y-3">
              {/* Header with Close Button */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--evergreen)] to-[var(--evergreen-light)] flex items-center justify-center border border-white/30">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-[var(--evergreen)] uppercase tracking-wide">
                    Wolf Radio
                  </span>
                </div>
                <button
                  onClick={() => setIsExpanded(false)}
                  className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[var(--ice-blue)]/50 text-[var(--text-muted)] hover:text-[var(--evergreen)] transition-colors"
                  aria-label="Minimize"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Now Playing */}
              <div className="bg-white/50 rounded-xl p-3 border border-[var(--frost-border-light)]">
                <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1">Now Playing</p>
                <p className="text-sm font-bold text-[var(--evergreen)] truncate">{currentTrack.title}</p>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                {/* Play/Pause Button */}
                <button
                  onClick={togglePlay}
                  className="
                    w-12 h-12 flex items-center justify-center
                    rounded-full
                    bg-gradient-to-br from-[var(--evergreen)] to-[var(--evergreen-light)]
                    text-white
                    hover:scale-105 active:scale-95
                    transition-transform
                    border-2 border-white/40
                    shadow-lg shadow-[var(--evergreen)]/30
                  "
                  aria-label={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                {/* Next Button */}
                <button
                  onClick={nextTrack}
                  className="
                    w-10 h-10 flex items-center justify-center
                    rounded-full
                    bg-white/60 hover:bg-white/80
                    text-[var(--evergreen)]
                    hover:scale-105 active:scale-95
                    transition-all
                    border-2 border-[var(--frost-border)]
                  "
                  aria-label="Next track"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 18l8.5-6L6 6v12zm2-8.14L11.03 12 8 14.14V9.86zM16 6h2v12h-2z" />
                  </svg>
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 px-1">
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="
                    flex-1 h-2 rounded-full appearance-none cursor-pointer
                    bg-[var(--ice-blue)]/50
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-gradient-to-br
                    [&::-webkit-slider-thumb]:from-[var(--evergreen)]
                    [&::-webkit-slider-thumb]:to-[var(--evergreen-light)]
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-white/50
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-[var(--evergreen)]
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-white/50
                  "
                  aria-label="Volume"
                />
                <svg className="w-4 h-4 text-[var(--text-muted)]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
