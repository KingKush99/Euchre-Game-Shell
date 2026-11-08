import React, { useState } from 'react';
import { PlayerProfile } from '../types/poker';
import { Check, Sparkles, X, Info } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface DailyCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onClaimReward: (chips: number, sovereigns: number, day: number) => void;
}

// -------------------------------------------------------------
// High-Fidelity SVG Item Renderers Matching the Reference Image
// -------------------------------------------------------------

// 1. Blue Mana Crystals / Texas Gems (e.g. 5000, 10000, 15000, 20000)
export const BlueCrystalIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="blueGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#0284c7" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="facetTop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#bae6fd" />
        <stop offset="100%" stopColor="#38bdf8" />
      </linearGradient>
      <linearGradient id="facetMid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="facetDark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#075985" />
        <stop offset="100%" stopColor="#0c4a6e" />
      </linearGradient>
    </defs>
    {/* Ambient Glow */}
    <circle cx="50" cy="50" r="42" fill="url(#blueGlow)" opacity="0.45" />
    
    {/* Left Sub-Crystal */}
    <polygon points="22,60 36,42 42,68 28,78" fill="url(#facetMid)" stroke="#38bdf8" strokeWidth="1.5" />
    <polygon points="22,60 36,42 26,48" fill="url(#facetTop)" />
    <polygon points="42,68 36,42 46,55" fill="url(#facetDark)" />

    {/* Right Sub-Crystal */}
    <polygon points="76,64 62,45 58,72 70,80" fill="url(#facetDark)" stroke="#38bdf8" strokeWidth="1.5" />
    <polygon points="76,64 62,45 72,50" fill="url(#facetTop)" />
    
    {/* Main Center Crystal */}
    <polygon points="50,14 68,36 60,78 40,78 32,36" fill="url(#facetMid)" stroke="#7dd3fc" strokeWidth="2" />
    {/* Top Diamond Facet */}
    <polygon points="50,14 62,32 50,42 38,32" fill="url(#facetTop)" />
    {/* Front Left Facet */}
    <polygon points="38,32 50,42 40,78 32,36" fill="url(#facetMid)" />
    {/* Front Right Facet */}
    <polygon points="62,32 50,42 60,78 68,36" fill="url(#facetDark)" />
    {/* Central Pillar Facet */}
    <polygon points="50,42 56,78 44,78" fill="#38bdf8" opacity="0.9" />

    {/* Specular White Glint */}
    <polygon points="49,18 52,24 50,22 47,20" fill="#ffffff" />
    <circle cx="50" cy="42" r="2.5" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
  </svg>
);

// 2. Golden Lightning Energy Bolt (e.g. 20, 50, 100)
export const EnergyBoltIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="boltGrad" x1="0.2" y1="0" x2="0.8" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="40%" stopColor="#facc15" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="boltRim" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
      <filter id="boltGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    {/* Energy Backdrop Halo */}
    <ellipse cx="50" cy="50" rx="36" ry="40" fill="#eab308" opacity="0.2" filter="blur(8px)" />
    
    {/* Shadow / Bevel Underlayer */}
    <polygon
      points="58,10 24,52 48,52 38,92 82,44 54,44"
      fill="#854d0e"
      transform="translate(2, 3)"
    />
    
    {/* Main Golden Lightning Bolt */}
    <polygon
      points="58,10 24,52 48,52 38,92 82,44 54,44"
      fill="url(#boltGrad)"
      stroke="#fef08a"
      strokeWidth="2.5"
      strokeLinejoin="round"
      filter="url(#boltGlow)"
    />
    
    {/* Highlight Edge Ridge */}
    <polyline
      points="56,14 28,50 49,50 42,84"
      stroke="url(#boltRim)"
      strokeWidth="2"
      strokeLinecap="round"
      opacity="0.85"
    />
  </svg>
);

// 3. Pink Ruby Crystal Cluster (e.g. 30, 100)
export const RubyGemIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="rubyGlow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.7" />
        <stop offset="100%" stopColor="#881337" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="rubyFaceTop" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="100%" stopColor="#f43f5e" />
      </linearGradient>
      <linearGradient id="rubyFaceMid" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#e11d48" />
        <stop offset="100%" stopColor="#be123c" />
      </linearGradient>
      <linearGradient id="rubyFaceDark" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#9f1239" />
        <stop offset="100%" stopColor="#4c0519" />
      </linearGradient>
    </defs>
    {/* Glow */}
    <circle cx="50" cy="50" r="40" fill="url(#rubyGlow)" opacity="0.4" />
    
    {/* Main Faceted Ruby */}
    <polygon points="50,15 78,38 72,78 50,90 28,78 22,38" fill="url(#rubyFaceMid)" stroke="#fda4af" strokeWidth="2" />
    {/* Crown Facet */}
    <polygon points="50,15 68,34 50,44 32,34" fill="url(#rubyFaceTop)" />
    {/* Left Pavilion */}
    <polygon points="32,34 50,44 42,82 28,78 22,38" fill="url(#rubyFaceMid)" />
    {/* Right Pavilion */}
    <polygon points="68,34 50,44 58,82 72,78 78,38" fill="url(#rubyFaceDark)" />
    {/* Lower Point */}
    <polygon points="50,44 58,82 50,90 42,82" fill="#be123c" />

    {/* Sparkle Glint */}
    <polygon points="50,20 53,27 60,30 53,33 50,40 47,33 40,30 47,27" fill="#ffffff" opacity="0.9" />
  </svg>
);

// 4. Golden Ancient Scroll (Day 12)
export const GoldenScrollIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="parchmentGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="50%" stopColor="#eab308" />
        <stop offset="100%" stopColor="#a16207" />
      </linearGradient>
      <linearGradient id="ribbonGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#ef4444" />
        <stop offset="100%" stopColor="#991b1b" />
      </linearGradient>
    </defs>
    {/* Scroll Body (Rolled diagonally matching screenshot) */}
    <g transform="rotate(-25 50 50)">
      {/* Back roll shadow */}
      <rect x="25" y="24" width="50" height="52" rx="4" fill="#78350f" />
      {/* Main parchment roll */}
      <rect x="24" y="22" width="52" height="48" rx="6" fill="url(#parchmentGrad)" stroke="#fde047" strokeWidth="2.5" />
      {/* Top Roll Cylinder */}
      <ellipse cx="26" cy="46" rx="6" ry="24" fill="#ca8a04" stroke="#fde047" strokeWidth="2" />
      <ellipse cx="74" cy="46" rx="6" ry="24" fill="#eab308" stroke="#fef08a" strokeWidth="2" />
      {/* Red Ribbon Tied Around Center */}
      <rect x="46" y="20" width="10" height="52" fill="url(#ribbonGrad)" stroke="#fca5a5" strokeWidth="1" />
      {/* Golden Seal Badge */}
      <circle cx="51" cy="46" r="8" fill="#facc15" stroke="#78350f" strokeWidth="2" />
      <circle cx="51" cy="46" r="5" fill="#ca8a04" />
    </g>
  </svg>
);

// 5. XP Boost 12h Laurel Crest (Day 21)
export const XpBoostIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#15803d" />
        <stop offset="100%" stopColor="#14532d" />
      </linearGradient>
      <linearGradient id="goldWing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    {/* Laurel Wings */}
    <path
      d="M20,55 C15,40 22,25 36,22 C32,28 32,38 38,44 C28,45 22,50 20,55 Z"
      fill="url(#goldWing)"
      stroke="#ca8a04"
      strokeWidth="1.5"
    />
    <path
      d="M80,55 C85,40 78,25 64,22 C68,28 68,38 62,44 C72,45 78,50 80,55 Z"
      fill="url(#goldWing)"
      stroke="#ca8a04"
      strokeWidth="1.5"
    />
    {/* Shield in Center */}
    <path
      d="M50,18 L68,28 C68,54 50,78 50,78 C50,78 32,54 32,28 Z"
      fill="url(#shieldGrad)"
      stroke="#facc15"
      strokeWidth="3"
    />
    {/* Green Upward Arrow */}
    <polygon points="50,28 58,40 54,40 54,50 46,50 46,40 42,40" fill="#4ade80" stroke="#14532d" strokeWidth="1" />
    {/* Bold XP Text */}
    <text x="50" y="66" textAnchor="middle" fill="#fef08a" fontSize="13" fontWeight="900" fontFamily="sans-serif">
      XP
    </text>
  </svg>
);

// 6. Mystical Royal Sealed Scroll (Day 24 Grand Jackpot)
export const MysticScrollIcon: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="purpleScrollGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#f472b6" />
        <stop offset="40%" stopColor="#c026d3" />
        <stop offset="100%" stopColor="#701a75" />
      </linearGradient>
      <linearGradient id="goldRibbon" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#fde047" />
        <stop offset="100%" stopColor="#ca8a04" />
      </linearGradient>
    </defs>
    {/* Glow */}
    <ellipse cx="50" cy="50" rx="38" ry="38" fill="#d946ef" opacity="0.3" filter="blur(6px)" />
    {/* Rotated Scroll matching screenshot */}
    <g transform="rotate(-30 50 50)">
      {/* Scroll Roll */}
      <rect x="22" y="24" width="56" height="48" rx="6" fill="url(#purpleScrollGrad)" stroke="#f472b6" strokeWidth="2.5" />
      {/* End caps */}
      <ellipse cx="24" cy="48" rx="6" ry="24" fill="#a21caf" stroke="#fbcfe8" strokeWidth="2" />
      <ellipse cx="76" cy="48" rx="6" ry="24" fill="#d946ef" stroke="#fdf2f8" strokeWidth="2" />
      {/* Golden Runes ribbon */}
      <rect x="44" y="22" width="12" height="52" fill="url(#goldRibbon)" stroke="#fef08a" strokeWidth="1" />
      {/* Glowing Star Seal */}
      <polygon points="50,40 53,46 59,48 53,50 50,56 47,50 41,48 47,46" fill="#ffffff" filter="drop-shadow(0 0 3px #ffffff)" />
    </g>
  </svg>
);

// -------------------------------------------------------------
// 24-Day Event Calendar Items Configuration (1:1 with Screenshot)
// -------------------------------------------------------------
export interface CalendarEventDay {
  dayNum: number;
  itemType: 'blue_crystal' | 'energy_bolt' | 'ruby_gem' | 'golden_scroll' | 'xp_boost' | 'mystic_scroll';
  amountText: string;
  chipsReward: number;
  sovereignsReward: number;
  title: string;
  description: string;
}

export const MONTHLY_EVENT_DAYS: CalendarEventDay[] = [
  // ROW 1: Days 1 to 6
  {
    dayNum: 1,
    itemType: 'blue_crystal',
    amountText: '5000',
    chipsReward: 5000,
    sovereignsReward: 2,
    title: 'Blue Mana Crystals',
    description: 'A glowing cluster of cut crystals granting 5,000 Saloon Chips!',
  },
  {
    dayNum: 2,
    itemType: 'blue_crystal',
    amountText: '5000',
    chipsReward: 5000,
    sovereignsReward: 2,
    title: 'Blue Mana Crystals',
    description: 'A glowing cluster of cut crystals granting 5,000 Saloon Chips!',
  },
  {
    dayNum: 3,
    itemType: 'energy_bolt',
    amountText: '20',
    chipsReward: 2000,
    sovereignsReward: 20,
    title: 'Golden Energy Surge',
    description: 'Infuse your poker stamina with 20 Sovereigns + 2,000 Chips!',
  },
  {
    dayNum: 4,
    itemType: 'blue_crystal',
    amountText: '5000',
    chipsReward: 5000,
    sovereignsReward: 2,
    title: 'Blue Mana Crystals',
    description: 'A glowing cluster of cut crystals granting 5,000 Saloon Chips!',
  },
  {
    dayNum: 5,
    itemType: 'blue_crystal',
    amountText: '5000',
    chipsReward: 5000,
    sovereignsReward: 2,
    title: 'Blue Mana Crystals',
    description: 'A glowing cluster of cut crystals granting 5,000 Saloon Chips!',
  },
  {
    dayNum: 6,
    itemType: 'ruby_gem',
    amountText: '30',
    chipsReward: 3000,
    sovereignsReward: 30,
    title: 'Precious Ruby Clusters',
    description: 'Brilliant deep-cut rubies granting 30 Sovereigns + 3,000 Chips!',
  },

  // ROW 2: Days 7 to 12
  {
    dayNum: 7,
    itemType: 'blue_crystal',
    amountText: '10000',
    chipsReward: 10000,
    sovereignsReward: 5,
    title: 'Tier II Blue Crystals',
    description: 'Expanded high-roller cache granting 10,000 Saloon Chips!',
  },
  {
    dayNum: 8,
    itemType: 'blue_crystal',
    amountText: '10000',
    chipsReward: 10000,
    sovereignsReward: 5,
    title: 'Tier II Blue Crystals',
    description: 'Expanded high-roller cache granting 10,000 Saloon Chips!',
  },
  {
    dayNum: 9,
    itemType: 'energy_bolt',
    amountText: '50',
    chipsReward: 5000,
    sovereignsReward: 50,
    title: 'Charged Golden Surge',
    description: 'Electrifying 50 Sovereigns + 5,000 Chips added to your pouch!',
  },
  {
    dayNum: 10,
    itemType: 'blue_crystal',
    amountText: '10000',
    chipsReward: 10000,
    sovereignsReward: 5,
    title: 'Tier II Blue Crystals',
    description: 'Expanded high-roller cache granting 10,000 Saloon Chips!',
  },
  {
    dayNum: 11,
    itemType: 'blue_crystal',
    amountText: '10000',
    chipsReward: 10000,
    sovereignsReward: 5,
    title: 'Tier II Blue Crystals',
    description: 'Expanded high-roller cache granting 10,000 Saloon Chips!',
  },
  {
    dayNum: 12,
    itemType: 'golden_scroll',
    amountText: '1',
    chipsReward: 15000,
    sovereignsReward: 35,
    title: 'Golden Ancient Parchment',
    description: 'Ancient Texas Golden Scroll granting 15,000 Chips & 35 Sovereigns!',
  },

  // ROW 3: Days 13 to 18
  {
    dayNum: 13,
    itemType: 'blue_crystal',
    amountText: '15000',
    chipsReward: 15000,
    sovereignsReward: 8,
    title: 'Tier III Blue Crystals',
    description: 'Major crystal deposit granting 15,000 Saloon Chips!',
  },
  {
    dayNum: 14,
    itemType: 'blue_crystal',
    amountText: '15000',
    chipsReward: 15000,
    sovereignsReward: 8,
    title: 'Tier III Blue Crystals',
    description: 'Major crystal deposit granting 15,000 Saloon Chips!',
  },
  {
    dayNum: 15,
    itemType: 'energy_bolt',
    amountText: '100',
    chipsReward: 8000,
    sovereignsReward: 100,
    title: 'Overcharged Energy Bolt',
    description: 'Massive surge of 100 Sovereigns + 8,000 Chips!',
  },
  {
    dayNum: 16,
    itemType: 'blue_crystal',
    amountText: '15000',
    chipsReward: 15000,
    sovereignsReward: 8,
    title: 'Tier III Blue Crystals',
    description: 'Major crystal deposit granting 15,000 Saloon Chips!',
  },
  {
    dayNum: 17,
    itemType: 'blue_crystal',
    amountText: '15000',
    chipsReward: 15000,
    sovereignsReward: 8,
    title: 'Tier III Blue Crystals',
    description: 'Major crystal deposit granting 15,000 Saloon Chips!',
  },
  {
    dayNum: 18,
    itemType: 'ruby_gem',
    amountText: '100',
    chipsReward: 12000,
    sovereignsReward: 100,
    title: 'Flawless Imperial Rubies',
    description: 'A crown-jewel cache granting 100 Sovereigns + 12,000 Chips!',
  },

  // ROW 4: Days 19 to 24
  {
    dayNum: 19,
    itemType: 'blue_crystal',
    amountText: '20000',
    chipsReward: 20000,
    sovereignsReward: 15,
    title: 'Tier IV Blue Crystals',
    description: 'Grand crystal horde granting 20,000 Saloon Chips!',
  },
  {
    dayNum: 20,
    itemType: 'blue_crystal',
    amountText: '20000',
    chipsReward: 20000,
    sovereignsReward: 15,
    title: 'Tier IV Blue Crystals',
    description: 'Grand crystal horde granting 20,000 Saloon Chips!',
  },
  {
    dayNum: 21,
    itemType: 'xp_boost',
    amountText: '12h',
    chipsReward: 25000,
    sovereignsReward: 30,
    title: '12-Hour Master XP Crest',
    description: 'Saloon champion booster + 25,000 Chips + 30 Sovereigns!',
  },
  {
    dayNum: 22,
    itemType: 'blue_crystal',
    amountText: '20000',
    chipsReward: 20000,
    sovereignsReward: 15,
    title: 'Tier IV Blue Crystals',
    description: 'Grand crystal horde granting 20,000 Saloon Chips!',
  },
  {
    dayNum: 23,
    itemType: 'blue_crystal',
    amountText: '20000',
    chipsReward: 20000,
    sovereignsReward: 15,
    title: 'Tier IV Blue Crystals',
    description: 'Grand crystal horde granting 20,000 Saloon Chips!',
  },
  {
    dayNum: 24,
    itemType: 'mystic_scroll',
    amountText: '1',
    chipsReward: 50000,
    sovereignsReward: 100,
    title: 'Mystical Grand Saloon Scroll',
    description: 'ULTIMATE JACKPOT: 50,000 Chips + 100 Sovereigns!',
  },
];

export const DailyCalendarModal: React.FC<DailyCalendarModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onClaimReward,
}) => {
  const [selectedDayInfo, setSelectedDayInfo] = useState<CalendarEventDay | null>(null);

  if (!isOpen) return null;

  // Calculate dynamic remaining days in current month (matching "Resets in 17 days")
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.max(1, endOfMonth.getDate() - now.getDate());

  const claimedDays = new Set(playerProfile.claimedDailyDays || []);
  const todayIndex = Math.min(24, (claimedDays.size || 0) + 1);

  const handleClaim = (day: CalendarEventDay) => {
    sounds.playWin();
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.55 },
      colors: ['#38bdf8', '#facc15', '#f43f5e', '#ffffff'],
    });
    onClaimReward(day.chipsReward, day.sovereignsReward, day.dayNum);
    setSelectedDayInfo(day);
  };

  const renderRewardIcon = (type: CalendarEventDay['itemType']) => {
    switch (type) {
      case 'blue_crystal':
        return <BlueCrystalIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_8px_rgba(56,189,248,0.4)]" />;
      case 'energy_bolt':
        return <EnergyBoltIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_8px_rgba(250,204,21,0.5)]" />;
      case 'ruby_gem':
        return <RubyGemIcon className="w-11 h-11 sm:w-13 sm:h-13 drop-shadow-[0_2px_8px_rgba(244,63,94,0.5)]" />;
      case 'golden_scroll':
        return <GoldenScrollIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_8px_rgba(234,179,8,0.5)]" />;
      case 'xp_boost':
        return <XpBoostIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_8px_rgba(34,197,94,0.5)]" />;
      case 'mystic_scroll':
        return <MysticScrollIcon className="w-12 h-12 sm:w-14 sm:h-14 drop-shadow-[0_2px_12px_rgba(217,70,239,0.6)]" />;
      default:
        return <BlueCrystalIcon className="w-12 h-12 sm:w-14 sm:h-14" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 animate-in fade-in duration-200 select-none">
      {/* Outer Wood & Leather Saloon Frame matching reference image */}
      <div className="relative w-full max-w-4xl bg-[#362215] border-[3px] border-[#8b5a2b] rounded-2xl shadow-[0_15px_60px_rgba(0,0,0,0.9),inset_0_2px_6px_rgba(255,225,180,0.2)] overflow-hidden flex flex-col max-h-[96vh]">
        
        {/* Top Header Section */}
        <div className="relative pt-3 pb-1 px-4 flex items-center justify-between border-b border-[#533219]">
          {/* Left balance placeholder to balance centered plaque */}
          <div className="w-10 sm:w-12" />

          {/* Centered Ornate Wooden & Gold Plaque: "Monthly Event" */}
          <div className="relative -mt-1 shadow-2xl">
            <div className="relative px-6 sm:px-10 py-1.5 sm:py-2 bg-gradient-to-b from-[#4e321d] via-[#3d2514] to-[#2b190c] border-2 border-[#a7753e] rounded-md flex items-center justify-center shadow-[inset_0_1px_3px_rgba(255,230,180,0.3),0_4px_12px_rgba(0,0,0,0.7)]">
              {/* Left Diamond Rivet */}
              <span className="text-[#e2b069] text-xs sm:text-sm mr-2.5 drop-shadow">◆</span>
              
              <h1 className="text-base sm:text-xl font-serif font-black tracking-wider text-[#ffe8c2] drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                Monthly Event
              </h1>

              {/* Right Diamond Rivet */}
              <span className="text-[#e2b069] text-xs sm:text-sm ml-2.5 drop-shadow">◆</span>

              {/* Corner brass studs */}
              <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-[#e2b069] shadow-sm" />
              <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#e2b069] shadow-sm" />
              <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-[#e2b069] shadow-sm" />
              <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#e2b069] shadow-sm" />
            </div>
          </div>

          {/* Right Close Button (Square olive/dark-brown with raised beveled border matching screenshot) */}
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-b from-[#4a3920] to-[#281f10] border-2 border-[#826738] hover:border-[#ffd875] rounded-lg text-white/95 flex items-center justify-center shadow-[0_3px_8px_rgba(0,0,0,0.8)] hover:scale-105 active:scale-95 transition group cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5 stroke-[2.8] text-[#fbf0d9] group-hover:text-white" />
          </button>
        </div>

        {/* Sub-Header Countdown Bar (Right-aligned "Resets in X days" matching screenshot) */}
        <div className="px-4 sm:px-6 pt-1.5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-[#c9a777] font-medium">
            <span>Log in daily to claim crystals, energy bolts & royal scrolls!</span>
          </div>

          <div className="text-xs sm:text-sm font-black text-[#f1d29d] tracking-wide drop-shadow flex items-center gap-1.5">
            <span>Resets in {daysRemaining} days</span>
          </div>
        </div>

        {/* MAIN CALENDAR GRID: 4 Rows x 6 Columns = 24 Event Days */}
        <div className="flex-1 overflow-y-auto p-2.5 sm:p-4 bg-[#23150d] shadow-inner">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-2.5">
            {MONTHLY_EVENT_DAYS.map((day) => {
              const isClaimed = claimedDays.has(day.dayNum);
              const isToday = day.dayNum === todayIndex && !isClaimed;
              const isLocked = day.dayNum > todayIndex;

              return (
                <div
                  key={day.dayNum}
                  onClick={() => {
                    if (isToday) {
                      handleClaim(day);
                    } else {
                      sounds.playClick();
                      setSelectedDayInfo(day);
                    }
                  }}
                  className={`relative aspect-[1/1.08] sm:aspect-[1/1.12] rounded-xl border flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all cursor-pointer group select-none ${
                    isClaimed
                      ? 'bg-[#180e08]/90 border-[#472d16] text-[#8c6d48] shadow-inner opacity-90'
                      : isToday
                      ? 'bg-gradient-to-b from-[#331c0c] to-[#1e1006] border-2 border-[#facc15] shadow-[0_0_18px_rgba(250,204,21,0.45),inset_0_1px_4px_rgba(255,230,150,0.3)] ring-2 ring-[#eab308]/60 scale-[1.03] z-10 animate-pulse'
                      : 'bg-[#1d1209] hover:bg-[#28190d] border-[#56361a] hover:border-[#825429] shadow-[inset_0_2px_4px_rgba(0,0,0,0.7)] text-[#d6b485]'
                  }`}
                >
                  {/* Reward Icon in Center */}
                  <div className="my-auto flex flex-col items-center justify-center relative w-full pt-1">
                    {renderRewardIcon(day.itemType)}

                    {/* Quantity Amount right below the icon matching screenshot */}
                    <span
                      className={`text-[11px] sm:text-xs font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] mt-0.5 ${
                        isClaimed
                          ? 'text-[#a3835c]'
                          : isToday
                          ? 'text-[#fef08a] scale-105'
                          : 'text-[#fef08a]'
                      }`}
                    >
                      {day.amountText}
                    </span>
                  </div>

                  {/* Day Label at Bottom: "DAY 1", "DAY 2", etc. */}
                  <div className="w-full text-center pb-0.5">
                    <span
                      className={`text-[10px] sm:text-[11px] font-black tracking-wider uppercase drop-shadow ${
                        isClaimed
                          ? 'text-[#7d5f39]'
                          : isToday
                          ? 'text-[#fef08a]'
                          : 'text-[#bfa075]'
                      }`}
                    >
                      DAY {day.dayNum}
                    </span>
                  </div>

                  {/* CLEAR!! BADGE OVERLAY FOR CLAIMED DAYS (1:1 with Screenshot) */}
                  {isClaimed && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center pointer-events-none overflow-hidden">
                      {/* Radial Sunburst behind badge */}
                      <div className="absolute w-20 h-20 bg-emerald-500/10 rounded-full blur-md" />
                      
                      {/* Diagonal Angled Pill Badge */}
                      <div className="relative -rotate-12 px-2.5 py-0.5 bg-[#0b1c0b]/90 border-[1.5px] border-[#84cc16] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.8),0_0_10px_rgba(132,204,22,0.6)] flex items-center justify-center">
                        <span className="text-[#facc15] font-black text-[10px] sm:text-[11px] tracking-widest leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,1)]">
                          CLEAR!!
                        </span>
                      </div>
                    </div>
                  )}

                  {/* READY TO CLAIM OVERLAY TAG FOR TODAY */}
                  {isToday && (
                    <div className="absolute -top-2 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-stone-950 font-black text-[9px] tracking-wider uppercase shadow-lg border border-yellow-200">
                      CLAIM!
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Inspection / Details Drawer when clicking any day */}
        {selectedDayInfo && (
          <div className="p-3 bg-[#1d1209] border-t-2 border-[#68411f] flex flex-col sm:flex-row items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#2b1b0d] border border-[#7d5028] flex items-center justify-center shadow-inner">
                {renderRewardIcon(selectedDayInfo.itemType)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-[#facc15] uppercase tracking-wider">
                    DAY {selectedDayInfo.dayNum} REWARD
                  </span>
                  <span className="text-[10px] bg-[#3a2310] text-[#f1d29d] px-2 py-0.5 rounded border border-[#6b411c] font-bold">
                    {selectedDayInfo.amountText}
                  </span>
                </div>
                <h4 className="text-sm font-black text-white">{selectedDayInfo.title}</h4>
                <p className="text-xs text-[#c9a777]">{selectedDayInfo.description}</p>
              </div>
            </div>

            <div className="shrink-0 flex items-center gap-2">
              {claimedDays.has(selectedDayInfo.dayNum) ? (
                <div className="px-3.5 py-1.5 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-black flex items-center gap-1.5 shadow">
                  <Check className="w-4 h-4 stroke-[3]" />
                  Already Claimed
                </div>
              ) : selectedDayInfo.dayNum === todayIndex ? (
                <button
                  onClick={() => handleClaim(selectedDayInfo)}
                  className="px-5 py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs rounded-xl shadow-[0_0_15px_rgba(234,179,8,0.5)] border border-yellow-200 transition active:scale-95 cursor-pointer"
                >
                  Claim Reward Now!
                </button>
              ) : (
                <div className="px-3.5 py-1.5 rounded-xl bg-[#2d1b0d] border border-[#5d3b1b] text-[#a8865c] text-xs font-bold flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  Available Day {selectedDayInfo.dayNum}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
