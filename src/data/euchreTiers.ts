export interface EuchreTier {
  id: number;
  tierNumber: number;
  name: string;
  minElo: number;
  maxElo: number;
  image: string;
  badgeGradient: string;
  badgeBorder: string;
  textColor: string;
  glowColor: string;
  description: string;
}

export const EUCHRE_TIERS: EuchreTier[] = [
  {
    id: 1,
    tierNumber: 1,
    name: 'Dealer',
    minElo: 0,
    maxElo: 499,
    image: '/tiers/tier_1_dealer.jpg',
    badgeGradient: 'from-amber-900/80 via-stone-800 to-amber-950/80',
    badgeBorder: 'border-amber-700/60',
    textColor: 'text-amber-200',
    glowColor: 'rgba(217, 119, 6, 0.4)',
    description: 'Mastering the deal, kitty pickup, and foundational table tactics.',
  },
  {
    id: 2,
    tierNumber: 2,
    name: 'Caller',
    minElo: 500,
    maxElo: 999,
    image: '/tiers/tier_2_caller.jpg',
    badgeGradient: 'from-orange-900/80 via-zinc-800 to-amber-900/80',
    badgeBorder: 'border-orange-600/60',
    textColor: 'text-orange-200',
    glowColor: 'rgba(234, 88, 12, 0.4)',
    description: 'Calling trump with calculated risk and reading the dealer turn-up.',
  },
  {
    id: 3,
    tierNumber: 3,
    name: 'Taker',
    minElo: 1000,
    maxElo: 1499,
    image: '/tiers/tier_3_taker.jpg',
    badgeGradient: 'from-emerald-950/80 via-slate-800 to-teal-900/80',
    badgeBorder: 'border-emerald-600/60',
    textColor: 'text-emerald-200',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    description: 'Securing crucial tricks with off-suit aces and precision leads.',
  },
  {
    id: 4,
    tierNumber: 4,
    name: 'Guard',
    minElo: 1500,
    maxElo: 1999,
    image: '/tiers/tier_4_guard.jpg',
    badgeGradient: 'from-blue-950/80 via-slate-800 to-cyan-900/80',
    badgeBorder: 'border-blue-500/60',
    textColor: 'text-blue-200',
    glowColor: 'rgba(59, 130, 246, 0.4)',
    description: 'Impenetrable defense anchoring against opponent sweeps.',
  },
  {
    id: 5,
    tierNumber: 5,
    name: 'Maker',
    minElo: 2000,
    maxElo: 2499,
    image: '/tiers/tier_5_maker.jpg',
    badgeGradient: 'from-purple-950/80 via-slate-800 to-indigo-900/80',
    badgeBorder: 'border-purple-500/60',
    textColor: 'text-purple-200',
    glowColor: 'rgba(168, 85, 247, 0.4)',
    description: 'Consistently fulfilling the team contract under high pressure.',
  },
  {
    id: 6,
    tierNumber: 6,
    name: 'Artist',
    minElo: 2500,
    maxElo: 2999,
    image: '/tiers/tier_6_artist.jpg',
    badgeGradient: 'from-rose-950/80 via-zinc-800 to-pink-900/80',
    badgeBorder: 'border-rose-500/60',
    textColor: 'text-rose-200',
    glowColor: 'rgba(244, 63, 94, 0.4)',
    description: 'Deceptive trick manipulation, drawing out enemy high trumps.',
  },
  {
    id: 7,
    tierNumber: 7,
    name: 'Lonestar',
    minElo: 3000,
    maxElo: 3499,
    image: '/tiers/tier_7_lonestar.jpg',
    badgeGradient: 'from-red-950/90 via-stone-900 to-amber-950/90',
    badgeBorder: 'border-red-500/70',
    textColor: 'text-red-200',
    glowColor: 'rgba(239, 68, 68, 0.5)',
    description: 'Going alone with icy nerve to claim the legendary 4-point sweep.',
  },
  {
    id: 8,
    tierNumber: 8,
    name: 'Master',
    minElo: 3500,
    maxElo: 3999,
    image: '/tiers/tier_8_master.jpg',
    badgeGradient: 'from-amber-950/90 via-slate-900 to-yellow-900/90',
    badgeBorder: 'border-yellow-400/80',
    textColor: 'text-yellow-200',
    glowColor: 'rgba(234, 179, 8, 0.55)',
    description: 'Flawless card counting, probability reads, and table mastery.',
  },
  {
    id: 9,
    tierNumber: 9,
    name: 'Bower Power',
    minElo: 4000,
    maxElo: 4499,
    image: '/tiers/tier_9_bowerpower.jpg',
    badgeGradient: 'from-violet-950/90 via-indigo-950 to-amber-950/90',
    badgeBorder: 'border-violet-400/80',
    textColor: 'text-violet-200',
    glowColor: 'rgba(139, 92, 246, 0.6)',
    description: 'Absolute dominion over Right and Left Bowers across the realm.',
  },
  {
    id: 10,
    tierNumber: 10,
    name: 'Grand Euchre',
    minElo: 4500,
    maxElo: 9999,
    image: '/tiers/tier_10_grandeuchre.jpg',
    badgeGradient: 'from-amber-900/90 via-yellow-700/80 to-amber-950/90',
    badgeBorder: 'border-amber-300',
    textColor: 'text-amber-100',
    glowColor: 'rgba(251, 191, 36, 0.75)',
    description: 'The supreme pinnacle of Euchre Everything, crowned in eternal glory.',
  },
];

export function getTierForElo(elo: number): EuchreTier {
  for (let i = EUCHRE_TIERS.length - 1; i >= 0; i--) {
    if (elo >= EUCHRE_TIERS[i].minElo) {
      return EUCHRE_TIERS[i];
    }
  }
  return EUCHRE_TIERS[0];
}

export function getTierByName(name: string): EuchreTier {
  const match = EUCHRE_TIERS.find((t) => t.name.toLowerCase() === name.toLowerCase());
  return match || EUCHRE_TIERS[0];
}
