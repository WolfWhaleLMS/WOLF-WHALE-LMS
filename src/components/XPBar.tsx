'use client';

interface XPBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
  compact?: boolean;
}

const XP_PER_LEVEL = 1000;

export default function XPBar({ xp, level, showDetails = false, compact = false }: XPBarProps) {
  const currentLevelXp = xp % XP_PER_LEVEL;
  const progressPercent = (currentLevelXp / XP_PER_LEVEL) * 100;
  const xpToNext = XP_PER_LEVEL - currentLevelXp;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="level-badge">Lv.{level}</span>
        <div className="flex-1 xp-bar-container">
          <div className="xp-bar" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="level-badge">Level {level}</span>
          <span className="text-sm font-medium text-gray-600">
            {currentLevelXp.toLocaleString()} / {XP_PER_LEVEL.toLocaleString()} XP
          </span>
        </div>
        <span className="text-sm text-gray-500">{xpToNext.toLocaleString()} XP to next level</span>
      </div>
      <div className="xp-bar-container">
        <div className="xp-bar" style={{ width: `${progressPercent}%` }} />
      </div>
      {showDetails && (
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="stat-card">
            <div className="stat-card-value">{xp.toLocaleString()}</div>
            <div className="stat-card-label">Total XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{level}</div>
            <div className="stat-card-label">Current Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-value">{Math.round(progressPercent)}%</div>
            <div className="stat-card-label">Progress</div>
          </div>
        </div>
      )}
    </div>
  );
}
