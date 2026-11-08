// Leveling and Arithmetic XP Progression System
// Level 0 -> 1: 1,000 XP
// Level 1 -> 2: 2,000 XP (Total 3,000 XP)
// Level 2 -> 3: 3,000 XP (Total 6,000 XP)
// Level 3 -> 4: 4,000 XP (Total 10,000 XP)
// Level N -> N+1: (N + 1) * 1,000 XP

export interface LevelInfo {
  level: number;
  currentXP: number;
  xpInCurrentLevel: number;
  xpRequiredForNextLevel: number;
  progressPercent: number;
  totalXPForCurrentLevelStart: number;
  totalXPForNextLevel: number;
  title: string;
}

/**
 * Returns cumulative total XP required to reach a given level from level 0.
 */
export function getTotalXPForLevel(level: number): number {
  if (level <= 0) return 0;
  // Sum of 1..N * 1000 = (N * (N + 1) / 2) * 1000
  return ((level * (level + 1)) / 2) * 1000;
}

/**
 * Returns XP needed to advance from level N to N+1.
 */
export function getXPRequiredForNextLevel(currentLevel: number): number {
  return (currentLevel + 1) * 1000;
}

/**
 * Titles associated with levels
 */
export const LEVEL_TITLES: Record<number, string> = {
  0: 'Greenhorn Rookie',
  1: 'Card Sharp Apprentice',
  2: 'Saloon Trickster',
  3: 'Trump Caller',
  4: 'Frontier Gambler',
  5: 'Bower Master',
  6: 'Texas High Roller',
  7: 'Saloon Syndicate Lead',
  8: 'Governor of the Deck',
  9: 'Grand Euchre Sovereign',
  10: 'Legendary Card Immortal',
};

/**
 * Calculates exact level info given any total cumulative XP.
 */
export function calculateLevelFromXP(totalXP: number): LevelInfo {
  const safeXP = Math.max(0, Math.floor(totalXP || 0));
  
  let level = 0;
  while (getTotalXPForLevel(level + 1) <= safeXP) {
    level++;
  }

  const totalXPForCurrentLevelStart = getTotalXPForLevel(level);
  const totalXPForNextLevel = getTotalXPForLevel(level + 1);
  const xpRequiredForNextLevel = getXPRequiredForNextLevel(level);
  const xpInCurrentLevel = safeXP - totalXPForCurrentLevelStart;
  const progressPercent = Math.min(100, Math.max(0, (xpInCurrentLevel / xpRequiredForNextLevel) * 100));

  const title = LEVEL_TITLES[level] || `Level ${level} Card Master`;

  return {
    level,
    currentXP: safeXP,
    xpInCurrentLevel,
    xpRequiredForNextLevel,
    progressPercent,
    totalXPForCurrentLevelStart,
    totalXPForNextLevel,
    title,
  };
}
