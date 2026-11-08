import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Crown,
  Sparkles,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Flame,
  Zap,
  Sword,
  TrendingUp,
  Layers,
  Heart,
  RotateCcw,
  CheckCircle2,
  X,
  AlertTriangle,
  Coins,
  Medal,
  Star,
  Gift,
  ChevronRight,
} from 'lucide-react';
import {
  ObjectiveDef,
  ProgressionTier,
  ProgressionType,
  ProgressionState,
} from '../types/progression';
import {
  PROGRESSION_TIERS,
  ACHIEVEMENTS_DATA,
  AWARDS_DATA,
} from '../data/progressionData';
import { sounds } from '../utils/soundEffects';

interface ProgressionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewardClaimed?: (coins: number, xp: number) => void;
}

const STORAGE_KEY = 'euchre_progression_state_v3';

// Roman numerals converter
function toRoman(num: number): string {
  if (num <= 0) return '0';
  const romanMap: [number, string][] = [
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];
  let res = '';
  for (const [val, roman] of romanMap) {
    while (num >= val) {
      res += roman;
      num -= val;
    }
  }
  return res;
}

// Icon mapper for general objectives
const renderObjectiveIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Trophy':
      return <Trophy className={className} />;
    case 'Award':
      return <Award className={className} />;
    case 'Crown':
      return <Crown className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'ShieldAlert':
      return <ShieldAlert className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Zap':
      return <Zap className={className} />;
    case 'Sword':
      return <Sword className={className} />;
    case 'TrendingUp':
      return <TrendingUp className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Heart':
      return <Heart className={className} />;
    case 'RotateCcw':
      return <RotateCcw className={className} />;
    case 'Medal':
      return <Medal className={className} />;
    default:
      return <Star className={className} />;
  }
};

/**
 * Bespoke Visual Medal Component for Awards
 * Features luxurious multi-layer ribbon draping, 3D engraved medallion discs,
 * specular metal sheens, and tier-specific metallurgy.
 */
interface AwardMedalVisualProps {
  tier: ProgressionTier;
  iconName: string;
  isClaimed: boolean;
  isFinished: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const AwardMedalVisual: React.FC<AwardMedalVisualProps> = ({
  tier,
  iconName,
  isClaimed,
  isFinished,
  size = 'md',
}) => {
  // Metallurgy configurations per tier
  const tierMedalStyles: Record<
    ProgressionTier,
    {
      ribbonBg: string;
      ribbonBorder: string;
      ribbonStripe: string;
      hangerMetal: string;
      discOuter: string;
      discInner: string;
      discBorder: string;
      iconColor: string;
      glowColor: string;
      name: string;
    }
  > = {
    beginner: {
      ribbonBg: 'bg-gradient-to-b from-[#78350f] via-[#b45309] to-[#451a03]',
      ribbonBorder: 'border-amber-700/60',
      ribbonStripe: 'bg-amber-300/40',
      hangerMetal: 'bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700',
      discOuter: 'bg-gradient-to-br from-[#d97706] via-[#92400e] to-[#451a03]',
      discInner: 'bg-gradient-to-tr from-[#78350f] via-[#b45309] to-[#d97706]',
      discBorder: 'border-[#f59e0b] shadow-[0_2px_8px_rgba(180,83,9,0.5)]',
      iconColor: 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
      glowColor: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
      name: 'Bronze Medallion',
    },
    novice: {
      ribbonBg: 'bg-gradient-to-b from-[#1e3a8a] via-[#2563eb] to-[#0f172a]',
      ribbonBorder: 'border-blue-400/60',
      ribbonStripe: 'bg-sky-300/50',
      hangerMetal: 'bg-gradient-to-r from-slate-400 via-sky-200 to-slate-500',
      discOuter: 'bg-gradient-to-br from-slate-300 via-slate-500 to-slate-800',
      discInner: 'bg-gradient-to-tr from-blue-900 via-slate-600 to-sky-300',
      discBorder: 'border-sky-300 shadow-[0_2px_8px_rgba(56,189,248,0.5)]',
      iconColor: 'text-sky-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
      glowColor: 'shadow-[0_0_20px_rgba(56,189,248,0.4)]',
      name: 'Sterling Silver Medallion',
    },
    semi_pro: {
      ribbonBg: 'bg-gradient-to-b from-[#064e3b] via-[#059669] to-[#022c22]',
      ribbonBorder: 'border-emerald-400/60',
      ribbonStripe: 'bg-emerald-200/50',
      hangerMetal: 'bg-gradient-to-r from-emerald-600 via-yellow-300 to-emerald-700',
      discOuter: 'bg-gradient-to-br from-emerald-500 via-teal-700 to-[#022c22]',
      discInner: 'bg-gradient-to-tr from-[#064e3b] via-emerald-600 to-emerald-300',
      discBorder: 'border-emerald-300 shadow-[0_2px_8px_rgba(52,211,153,0.5)]',
      iconColor: 'text-emerald-50 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
      glowColor: 'shadow-[0_0_20px_rgba(16,185,129,0.45)]',
      name: 'Emerald Jade Medallion',
    },
    pro: {
      ribbonBg: 'bg-gradient-to-b from-[#881337] via-[#e11d48] to-[#4c0519]',
      ribbonBorder: 'border-rose-400/60',
      ribbonStripe: 'bg-rose-200/50',
      hangerMetal: 'bg-gradient-to-r from-rose-500 via-amber-300 to-rose-700',
      discOuter: 'bg-gradient-to-br from-rose-600 via-amber-700 to-[#4c0519]',
      discInner: 'bg-gradient-to-tr from-[#881337] via-rose-600 to-amber-300',
      discBorder: 'border-rose-300 shadow-[0_2px_8px_rgba(244,63,94,0.5)]',
      iconColor: 'text-amber-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]',
      glowColor: 'shadow-[0_0_20px_rgba(244,63,94,0.5)]',
      name: 'Imperial Ruby Medallion',
    },
    world_class: {
      ribbonBg: 'bg-gradient-to-b from-[#18181b] via-[#3f3f46] to-[#09090b]',
      ribbonBorder: 'border-amber-400/80',
      ribbonStripe: 'bg-gradient-to-b from-amber-300 via-yellow-200 to-amber-500',
      hangerMetal: 'bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-600',
      discOuter: 'bg-gradient-to-br from-amber-400 via-yellow-600 to-stone-950',
      discInner: 'bg-gradient-to-tr from-stone-950 via-amber-600 to-yellow-300',
      discBorder: 'border-yellow-300 shadow-[0_2px_12px_rgba(251,191,36,0.7)]',
      iconColor: 'text-amber-200 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]',
      glowColor: 'shadow-[0_0_25px_rgba(251,191,36,0.6)]',
      name: '24K Grandmaster Medallion',
    },
  };

  const style = tierMedalStyles[tier] || tierMedalStyles.beginner;

  return (
    <div className="relative flex flex-col items-center justify-center shrink-0 select-none group">
      {/* 1. TOP METALLIC RIBBON HANGER BAR */}
      <div
        className={`w-9 h-1.5 rounded-full ${style.hangerMetal} shadow-[0_1px_3px_rgba(0,0,0,0.6)] border border-white/40 z-10`}
      />

      {/* 2. GROSGRAIN SILK RIBBON WITH V-CUT BOTTOM */}
      <div
        className={`relative w-7 h-5.5 -mt-0.5 ${style.ribbonBg} border-x ${style.ribbonBorder} flex items-center justify-center overflow-hidden shadow-md`}
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 85%, 50% 100%, 0% 85%)',
        }}
      >
        {/* Ribbon center vertical stripe */}
        <div className={`w-2 h-full ${style.ribbonStripe} opacity-80`} />
        {/* Diagonal silk texture shimmer */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] [background-size:6px_6px]" />
      </div>

      {/* 3. 3D METALLIC MEDALLION DISC */}
      <div
        className={`relative -mt-1.5 w-11 h-11 rounded-full p-[2px] ${style.discOuter} ${style.discBorder} border flex items-center justify-center ${
          isFinished && !isClaimed ? style.glowColor : ''
        } transition-transform duration-200 group-hover:scale-105`}
      >
        {/* Specular sheen on outer bevel */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/30 via-transparent to-black/40 pointer-events-none" />

        {/* Inner Coin Dish */}
        <div
          className={`relative w-full h-full rounded-full ${style.discInner} border border-white/25 flex items-center justify-center shadow-inner overflow-hidden`}
        >
          {/* Subtle star notches or engraved coin ring */}
          <div className="absolute inset-0.5 rounded-full border border-black/30 opacity-60" />

          {/* Diagonal Glass Reflection Highlight */}
          <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-to-br from-white/40 via-white/5 to-transparent pointer-events-none" />

          {/* Central Embossed Insignia */}
          <div className={`relative z-10 ${style.iconColor}`}>
            {isClaimed ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-300 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]" />
            ) : (
              renderObjectiveIcon(iconName, 'w-5 h-5')
            )}
          </div>
        </div>

        {/* Floating Star or Checked Badge for Claimed Status */}
        {isClaimed && (
          <div className="absolute -bottom-1 -right-1 w-4.5 h-4.5 rounded-full bg-emerald-500 border border-emerald-200 text-stone-950 flex items-center justify-center text-[9px] font-black shadow-md">
            ✓
          </div>
        )}

        {/* Glowing pulse when ready to claim */}
        {isFinished && !isClaimed && (
          <div className="absolute inset-0 rounded-full border-2 border-amber-300 animate-ping opacity-75 pointer-events-none" />
        )}
      </div>
    </div>
  );
};

export const ProgressionModal: React.FC<ProgressionModalProps> = ({
  isOpen,
  onClose,
  onRewardClaimed,
}) => {
  const [activeTab, setActiveTab] = useState<'achievements' | 'awards'>('achievements');
  const [selectedTier, setSelectedTier] = useState<ProgressionTier>('beginner');

  // Progression State
  const [state, setState] = useState<ProgressionState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing progression state', e);
      }
    }
    // Default initial progress
    return {
      achievementProgress: {
        ach_beginner_1: 1,
        ach_beginner_2: 1,
        ach_beginner_3: 3,
        ach_beginner_4: 1,
        ach_beginner_5: 8,
        ach_beginner_6: 3,
        ach_novice_1: 4,
        ach_novice_2: 15,
      },
      achievementClaimed: {
        ach_beginner_1: true,
        ach_beginner_2: true,
        ach_beginner_3: true,
        ach_beginner_4: false,
      },
      awardProgress: {
        awd_beginner_1: 1,
        awd_beginner_2: 1,
        awd_beginner_3: 1,
        awd_beginner_4: 2,
        awd_beginner_5: 1,
      },
      awardClaimed: {
        awd_beginner_1: true,
        awd_beginner_2: true,
        awd_beginner_3: true,
      },
      achievementPrestige: 0,
      awardPrestige: 0,
      prestigeHistory: [],
      lifetimeStats: {
        achievementsCompleted: 4,
        awardsEarned: 3,
        objectivesCompletedAllCycles: 7,
        lifetimeXP: 14500,
        lifetimeCoins: 7250,
      },
    };
  });

  // Modals for Prestige and Reset
  const [showPrestigeConfirm, setShowPrestigeConfirm] = useState<ProgressionType | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState<ProgressionType | null>(null);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Save to localStorage on state change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  if (!isOpen) return null;

  // Calculators
  const totalPrestiges = state.achievementPrestige + state.awardPrestige;
  const globalMultiplier = 1.0 + totalPrestiges * 0.1;
  const globalMultiplierText = `${globalMultiplier.toFixed(2)}x`;

  // Completed counts for the current pool
  const currentPool = activeTab === 'achievements' ? ACHIEVEMENTS_DATA : AWARDS_DATA;
  const currentTierData = PROGRESSION_TIERS.find((t) => t.id === selectedTier)!;
  const tierObjectives = currentPool.filter((o) => o.tier === selectedTier);

  const getTierCompletedCount = (type: ProgressionType, tier: ProgressionTier) => {
    const pool = type === 'achievement' ? ACHIEVEMENTS_DATA : AWARDS_DATA;
    const objectives = pool.filter((o) => o.tier === tier);
    const progressMap = type === 'achievement' ? state.achievementProgress : state.awardProgress;
    return objectives.filter((o) => (progressMap[o.id] || 0) >= o.target).length;
  };

  // Claim Objective Reward
  const handleClaimReward = (obj: ObjectiveDef) => {
    sounds.playWin();
    const tierInfo = PROGRESSION_TIERS.find((t) => t.id === obj.tier)!;
    const finalXP = Math.round(obj.baseXP * tierInfo.multiplier * globalMultiplier);
    const finalCoins = Math.round(obj.baseCoins * tierInfo.multiplier * globalMultiplier);

    setState((prev) => {
      const isAch = obj.type === 'achievement';
      const newClaimedMap = isAch
        ? { ...prev.achievementClaimed, [obj.id]: true }
        : { ...prev.awardClaimed, [obj.id]: true };

      return {
        ...prev,
        achievementClaimed: isAch ? newClaimedMap : prev.achievementClaimed,
        awardClaimed: !isAch ? newClaimedMap : prev.awardClaimed,
        lifetimeStats: {
          ...prev.lifetimeStats,
          lifetimeXP: prev.lifetimeStats.lifetimeXP + finalXP,
          lifetimeCoins: prev.lifetimeStats.lifetimeCoins + finalCoins,
        },
      };
    });

    if (onRewardClaimed) {
      onRewardClaimed(finalCoins, finalXP);
    }

    setToastMessage({
      title: `${obj.type === 'achievement' ? 'ACHIEVEMENT CLAIMED' : 'MEDAL AWARD COLLECTED'}!`,
      subtitle: `+${finalCoins.toLocaleString()} Coins  •  +${finalXP.toLocaleString()} XP (${tierInfo.multiplierText} Tier x ${globalMultiplierText} Global)`,
    });
  };

  // Execute Prestige
  const handleExecutePrestige = (type: ProgressionType) => {
    sounds.playWin();
    const isAch = type === 'achievement';
    const currentTierPrestige = isAch ? state.achievementPrestige + 1 : state.awardPrestige + 1;
    const newBonusMultiplier = 1.0 + (totalPrestiges + 1) * 0.1;

    setState((prev) => {
      const historyEntry = {
        id: `prest_${Date.now()}`,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        category: isAch ? ('Achievements' as const) : ('Awards' as const),
        prestigeLevel: currentTierPrestige,
        multiplierGranted: 0.1,
        note: `Prestiged ${isAch ? 'Achievements' : 'Awards'} to Rank ${toRoman(currentTierPrestige)}. Permanent +0.10x Global Multiplier.`,
      };

      return {
        ...prev,
        achievementProgress: isAch ? {} : prev.achievementProgress,
        achievementClaimed: isAch ? {} : prev.achievementClaimed,
        awardProgress: !isAch ? {} : prev.awardProgress,
        awardClaimed: !isAch ? {} : prev.awardClaimed,
        achievementPrestige: isAch ? prev.achievementPrestige + 1 : prev.achievementPrestige,
        awardPrestige: !isAch ? prev.awardPrestige + 1 : prev.awardPrestige,
        prestigeHistory: [historyEntry, ...prev.prestigeHistory],
        lifetimeStats: {
          ...prev.lifetimeStats,
          objectivesCompletedAllCycles: prev.lifetimeStats.objectivesCompletedAllCycles + 25,
        },
      };
    });

    setShowPrestigeConfirm(null);
    setToastMessage({
      title: `👑 ${type.toUpperCase()} PRESTIGE ACTIVATED!`,
      subtitle: `Now Rank ${toRoman(currentTierPrestige)}! Global Multiplier is now ${newBonusMultiplier.toFixed(2)}x!`,
    });
  };

  // Manual Reset Handler
  const handleManualReset = (type: ProgressionType) => {
    sounds.playClick();
    const isAch = type === 'achievement';
    setState((prev) => ({
      ...prev,
      achievementProgress: isAch ? {} : prev.achievementProgress,
      achievementClaimed: isAch ? {} : prev.achievementClaimed,
      awardProgress: !isAch ? {} : prev.awardProgress,
      awardClaimed: !isAch ? {} : prev.awardClaimed,
    }));
    setShowResetConfirm(null);
    setToastMessage({
      title: `${type === 'achievement' ? 'Achievements' : 'Awards'} Progress Reset`,
      subtitle: 'Task progression cleared to 0/25. Earned coins and XP were preserved.',
    });
  };

  const currentTierCompleted = getTierCompletedCount(
    activeTab === 'achievements' ? 'achievement' : 'award',
    selectedTier
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Outer Shell */}
      <div
        style={{
          width: 'min(1180px, calc(100vw - 32px))',
          height: 'min(820px, calc(100vh - 32px))',
        }}
        className="relative bg-[#0b111e] border-2 border-slate-800 rounded-3xl shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white flex flex-col overflow-hidden shrink-0"
      >
        {/* Subtle Background Pattern & Gold Rim Accent */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-600" />

        {/* 1. TOP HEADER WITH TITLE & CLOSE BUTTON */}
        <div className="relative shrink-0 px-6 pt-4 pb-2 bg-gradient-to-b from-[#131c31] to-[#0c1220] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20">
              {activeTab === 'achievements' ? (
                <Trophy className="w-6 h-6 text-stone-950" />
              ) : (
                <Award className="w-6 h-6 text-stone-950" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black uppercase tracking-wider text-amber-300 drop-shadow">
                  Achievements & Awards
                </h2>
                <span className="bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  25 PER TIER
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                Milestones, Sovereign Medals & Multipliers (25 Unique Challenges Per Tier)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Global multiplier status badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-amber-500/30 text-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-stone-400">Global Bonus:</span>
              <span className="font-black text-amber-300">{globalMultiplierText}</span>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-amber-400/30 text-amber-200 flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. ACHIEVEMENTS & AWARDS TAB BAR UNDERNEATH THE TITLE */}
        <div className="shrink-0 px-6 py-2.5 bg-[#090e1a] border-b border-amber-500/20 z-10">
          <div className="w-full max-w-xl mx-auto grid grid-cols-2 p-1 rounded-2xl bg-[#040811] border border-slate-800 shadow-inner">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('achievements');
              }}
              className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-stone-950 shadow-md scale-101 border border-yellow-300'
                  : 'text-stone-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>ACHIEVEMENTS (125)</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('awards');
              }}
              className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
                activeTab === 'awards'
                  ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-stone-950 shadow-md scale-101 border border-emerald-300'
                  : 'text-stone-400 hover:text-white hover:bg-slate-900/50'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>MEDAL AWARDS (125)</span>
            </button>
          </div>
        </div>

        {/* 3. MAIN SPLIT BODY: VERTICAL STACK FOR TIERS ON LEFT, CHALLENGES ON RIGHT */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* LEFT SIDEBAR: VERTICALLY STACKED TIERS (Beginner, Novice, Semi-Pro, Pro, World-Class) */}
          <div className="w-full md:w-64 shrink-0 bg-[#070c17] border-b md:border-b-0 md:border-r border-slate-800 p-3.5 flex flex-col justify-between overflow-y-auto z-10 gap-3">
            <div>
              <div className="px-2 pb-2 text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center justify-between">
                <span>Select Tier</span>
                <span className="text-stone-500">5 Tiers</span>
              </div>

              {/* VERTICAL STACK OF 5 TIERS */}
              <div className="flex flex-col gap-2">
                {PROGRESSION_TIERS.map((tier, idx) => {
                  const isSelected = selectedTier === tier.id;
                  const completedCount = getTierCompletedCount(
                    activeTab === 'achievements' ? 'achievement' : 'award',
                    tier.id
                  );
                  const isTierFinished = completedCount === 25;

                  return (
                    <button
                      key={tier.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedTier(tier.id);
                      }}
                      className={`w-full p-3 rounded-2xl border-2 text-left transition-all duration-200 flex flex-col gap-2 cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? `${tier.badgeBorder} ${tier.badgeBg} shadow-lg scale-102 z-10 ring-1 ring-amber-400/40`
                          : 'bg-[#0f172a]/90 border-slate-800/90 hover:border-slate-700 opacity-85 hover:opacity-100'
                      }`}
                    >
                      {/* Active Indicator Arrow */}
                      {isSelected && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-amber-400">
                          <ChevronRight className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}

                      {/* Top: Tier Name & Multiplier */}
                      <div className="flex items-center justify-between pr-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono font-bold text-stone-400">
                            0{idx + 1}
                          </span>
                          <span className={`text-xs font-black uppercase tracking-wider ${isSelected ? 'text-white' : 'text-stone-300'}`}>
                            {tier.label}
                          </span>
                        </div>

                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 border border-amber-400/30">
                          {tier.multiplierText}
                        </span>
                      </div>

                      {/* Middle: Completion Status */}
                      <div className="flex items-center justify-between text-[10px]">
                        {isTierFinished ? (
                          <div className="flex items-center gap-1 text-emerald-400 font-black">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>All 25 Complete</span>
                          </div>
                        ) : (
                          <span className="text-stone-400 font-bold">
                            Completed: <strong className="text-amber-300">{completedCount}</strong>/25
                          </span>
                        )}

                        <span className="text-[9px] font-mono text-stone-500">
                          {Math.round((completedCount / 25) * 100)}%
                        </span>
                      </div>

                      {/* Bottom: Progress Bar */}
                      <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800/80">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isTierFinished ? 'bg-emerald-400' : 'bg-amber-400'
                          }`}
                          style={{ width: `${(completedCount / 25) * 100}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Footer Info */}
            <div className="p-3 bg-[#040811] rounded-2xl border border-slate-800/80 text-[11px] text-stone-400 space-y-1">
              <div className="flex items-center justify-between text-stone-300 font-bold">
                <span>Total Prestiges:</span>
                <span className="text-amber-300">{totalPrestiges} Ranks</span>
              </div>
              <p className="text-[10px] text-stone-500 leading-tight">
                Complete all 25 tier challenges to prestige for a permanent +0.10x reward multiplier.
              </p>
            </div>
          </div>

          {/* RIGHT VIEW AREA: 25 CHALLENGES FOR SELECTED TIER */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-[#0a0f1c]">
            
            {/* TIER HEADER BANNER */}
            <div className="bg-[#0e1628] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl ${currentTierData.badgeBg} border ${currentTierData.badgeBorder} flex items-center justify-center text-amber-300 shadow-md`}>
                  {activeTab === 'achievements' ? <Trophy className="w-6 h-6" /> : <Award className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-sm uppercase tracking-wide text-white">
                      {currentTierData.label} TIER {activeTab === 'achievements' ? 'ACHIEVEMENTS' : 'AWARDS'}
                    </h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ALL 25 CHALLENGES
                    </span>
                  </div>
                  <p className="text-xs text-stone-400">{currentTierData.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="text-xs font-black text-stone-300 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
                  Tier Progress:{' '}
                  <span className="text-amber-300 font-bold">
                    {currentTierCompleted} / 25 Completed
                  </span>
                </div>

                {currentTierCompleted === 25 && (
                  <button
                    onClick={() => setShowPrestigeConfirm(activeTab === 'achievements' ? 'achievement' : 'award')}
                    className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-stone-950 rounded-xl text-xs font-black uppercase transition shadow-md cursor-pointer"
                  >
                    PRESTIGE (+0.10x)
                  </button>
                )}

                <button
                  onClick={() => setShowResetConfirm(activeTab === 'achievements' ? 'achievement' : 'award')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-rose-950 border border-slate-800 hover:border-rose-700/60 text-stone-400 hover:text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  title="Reset tier objectives progress"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>
            </div>

            {/* ALL 25 OBJECTIVE CARDS IN A 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3.5">
              {tierObjectives.map((obj, i) => {
                const isAch = obj.type === 'achievement';
                const currentProgress = (isAch ? state.achievementProgress[obj.id] : state.awardProgress[obj.id]) || 0;
                const isClaimed = (isAch ? state.achievementClaimed[obj.id] : state.awardClaimed[obj.id]) || false;
                const isFinished = currentProgress >= obj.target;
                const progressPercent = Math.min(100, Math.round((currentProgress / obj.target) * 100));

                const finalXP = Math.round(obj.baseXP * currentTierData.multiplier * globalMultiplier);
                const finalCoins = Math.round(obj.baseCoins * currentTierData.multiplier * globalMultiplier);

                return (
                  <div
                    key={obj.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-3 ${
                      isClaimed
                        ? 'bg-[#080d19]/90 border-slate-800/80 opacity-80'
                        : isFinished
                        ? 'bg-gradient-to-r from-[#12233f] to-[#0c182b] border-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.2)]'
                        : 'bg-[#0f172a] border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {/* Top: Header Info with Visual Medal (if award) or Trophy Badge (if achievement) */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        {/* ICON / MEDAL CONTAINER */}
                        {activeTab === 'awards' ? (
                          <AwardMedalVisual
                            tier={obj.tier}
                            iconName={obj.iconName}
                            isClaimed={isClaimed}
                            isFinished={isFinished}
                          />
                        ) : (
                          <div
                            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border mt-0.5 ${
                              isClaimed
                                ? 'bg-emerald-950/60 border-emerald-600 text-emerald-400'
                                : isFinished
                                ? 'bg-amber-500 border-amber-300 text-stone-950 shadow-md'
                                : 'bg-[#18233c] border-slate-700 text-stone-300'
                            }`}
                          >
                            {isClaimed ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              renderObjectiveIcon(obj.iconName, 'w-5 h-5')
                            )}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-mono font-black text-amber-400">
                              #{i + 1}
                            </span>
                            <h4 className="font-black text-xs sm:text-sm text-white truncate">
                              {obj.title}
                            </h4>
                            {obj.categoryTag && (
                              <span className="text-[8px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-800 text-stone-400 border border-slate-700">
                                {obj.categoryTag}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-stone-300 mt-1 line-clamp-2 leading-relaxed">
                            {obj.description}
                          </p>
                        </div>
                      </div>

                      {/* Rewards Summary */}
                      <div className="text-right flex flex-col items-end shrink-0">
                        <div className="flex items-center gap-1 text-xs font-black text-amber-300">
                          <Coins className="w-3.5 h-3.5 text-amber-400" />
                          <span>+{finalCoins.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black text-purple-300">
                          <Sparkles className="w-3 h-3 text-purple-400" />
                          <span>+{finalXP.toLocaleString()} XP</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom: Progress Bar & Claim Button */}
                    <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isFinished ? 'bg-emerald-400' : 'bg-amber-400'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-black text-stone-400 shrink-0 font-mono">
                          {Math.min(currentProgress, obj.target)} / {obj.target}
                        </span>
                      </div>

                      {/* Action Button */}
                      {isClaimed ? (
                        <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[10px] font-black text-stone-500 uppercase tracking-wider">
                          Claimed
                        </div>
                      ) : isFinished ? (
                        <button
                          onClick={() => handleClaimReward(obj)}
                          className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider shadow-md transition transform active:scale-95 animate-pulse cursor-pointer"
                        >
                          Claim
                        </button>
                      ) : (
                        <div className="px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                          In Progress
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* PRESTIGE CONFIRMATION MODAL OVERLAY */}
        {showPrestigeConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0e1526] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 text-stone-950 mx-auto flex items-center justify-center shadow-xl">
                <Crown className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  INITIATE {showPrestigeConfirm.toUpperCase()} PRESTIGE
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  You are about to ascend to Prestige Rank{' '}
                  <strong className="text-amber-200 font-black">
                    {toRoman(
                      (showPrestigeConfirm === 'achievement'
                        ? state.achievementPrestige
                        : state.awardPrestige) + 1
                    )}
                  </strong>
                  !
                </p>
              </div>

              <div className="bg-[#080d17] p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-400">Current Global Multiplier:</span>
                  <span className="font-black text-white">{globalMultiplierText}</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="font-bold">After Prestige Multiplier:</span>
                  <span className="font-black">{(globalMultiplier + 0.1).toFixed(2)}x (+0.10x)</span>
                </div>
                <div className="pt-2 border-t border-slate-800 text-[11px] text-stone-400 leading-relaxed">
                  ✓ Resets this tier&apos;s objectives so you can earn task rewards again.
                  <br />
                  ✓ All collected coins, XP, badges, hats, and profile stats remain intact!
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowPrestigeConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-stone-300 font-black text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleExecutePrestige(showPrestigeConfirm)}
                  className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow-lg transition cursor-pointer"
                >
                  CONFIRM PRESTIGE
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MANUAL RESET CONFIRMATION MODAL OVERLAY */}
        {showResetConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0e1526] border-2 border-rose-600 rounded-3xl p-6 shadow-2xl text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-600/20 border border-rose-500 text-rose-400 mx-auto flex items-center justify-center shadow-xl">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div>
                <h3 className="text-lg font-black text-rose-400 uppercase tracking-wide">
                  RESET {showResetConfirm.toUpperCase()} TASKS?
                </h3>
                <p className="text-xs text-stone-300 mt-1">
                  This will clear your current {showResetConfirm} objective progress back to 0/25 so you can replay them.
                </p>
              </div>

              <div className="bg-rose-950/20 p-3.5 rounded-2xl border border-rose-800/40 text-left text-xs text-rose-200 leading-relaxed">
                ⚠️ Note: Manual reset does NOT grant a Prestige multiplier bonus. Your earned Coins, XP, and Prestige ranks remain safe.
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setShowResetConfirm(null)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-stone-300 font-black text-xs uppercase rounded-xl transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={() => handleManualReset(showResetConfirm)}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-xl shadow-lg transition cursor-pointer"
                >
                  RESET PROGRESS
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TOAST NOTIFICATION */}
        {toastMessage && (
          <div className="absolute bottom-6 right-6 z-50 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 p-4 rounded-2xl shadow-2xl border-2 border-yellow-300 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
            <Gift className="w-6 h-6 shrink-0" />
            <div>
              <div className="font-black text-xs uppercase tracking-wider">{toastMessage.title}</div>
              <div className="text-[11px] font-bold text-stone-900">{toastMessage.subtitle}</div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
