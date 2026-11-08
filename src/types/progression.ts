export type ProgressionTier = 'beginner' | 'novice' | 'semi_pro' | 'pro' | 'world_class';
export type ProgressionType = 'achievement' | 'award';

export interface ObjectiveDef {
  id: string;
  type: ProgressionType;
  tier: ProgressionTier;
  tierIndex: number; // 0 to 4 within tier
  title: string;
  description: string;
  iconName: string;
  baseXP: number;
  baseCoins: number;
  target: number;
  categoryTag?: string;
  secret?: boolean;
}

export interface TierInfo {
  id: ProgressionTier;
  label: string;
  name: string;
  multiplier: number;
  multiplierText: string;
  accentColor: string;
  borderColor: string;
  badgeBg: string;
  badgeBorder: string;
  description: string;
}

export interface PrestigeHistoryEntry {
  id: string;
  date: string;
  category: 'Achievements' | 'Awards';
  prestigeLevel: number;
  multiplierGranted: number;
  note: string;
}

export interface ProgressionState {
  achievementProgress: Record<string, number>;
  achievementClaimed: Record<string, boolean>;
  awardProgress: Record<string, number>;
  awardClaimed: Record<string, boolean>;
  achievementPrestige: number;
  awardPrestige: number;
  prestigeHistory: PrestigeHistoryEntry[];
  lifetimeStats: {
    achievementsCompleted: number;
    awardsEarned: number;
    objectivesCompletedAllCycles: number;
    lifetimeXP: number;
    lifetimeCoins: number;
  };
}
