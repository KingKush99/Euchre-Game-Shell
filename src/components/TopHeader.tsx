import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import {
  Coins,
  Sparkles,
  Building,
  Menu,
  Compass,
  Crown,
  Users,
  Award,
  Shield,
  Info,
  Lock,
  Mail,
  Settings,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopHeaderProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  onlineNow?: number;
  allTimeVisitors?: number;
  onOpenMapModal: () => void;
  onOpenTopLeftBonus?: () => void;
  onOpenHamburgerMenu: () => void;
  onOpenShop?: () => void;
  onOpenProperties?: () => void;
  onOpenCalendar?: () => void;
  onOpenStats?: () => void;
  onClaimFreeChips?: () => void;
  onOpenMailbox?: () => void;
  onOpenSettings?: () => void;
  isMapUnlocked?: boolean;
}

// Gmail/Red Envelope Mail Icon matching image 2
export const GmailMailboxIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg viewBox="0 0 512 512" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="32" y="96" width="448" height="320" rx="32" fill="#FFFFFF" stroke="#EA4335" strokeWidth="16" />
    <path
      d="M48 120L256 288L464 120"
      stroke="#EA4335"
      strokeWidth="48"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M48 120V392"
      stroke="#EA4335"
      strokeWidth="44"
      strokeLinecap="round"
    />
    <path
      d="M464 120V392"
      stroke="#EA4335"
      strokeWidth="44"
      strokeLinecap="round"
    />
  </svg>
);

export const TopHeader: React.FC<TopHeaderProps> = ({
  playerProfile,
  currentTown,
  onlineNow = 1,
  allTimeVisitors = 1,
  onOpenMapModal,
  onOpenTopLeftBonus,
  onOpenHamburgerMenu,
  onOpenShop,
  onOpenProperties,
  onOpenCalendar,
  onOpenStats,
  onClaimFreeChips,
  onOpenMailbox,
  onOpenSettings,
  isMapUnlocked = true,
}) => {
  const [showHoverDetails, setShowHoverDetails] = useState(false);

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <header
      id="top-header"
      className="w-full bg-stone-950/95 border-b border-amber-600/40 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 shadow-xl z-40 sticky top-0 backdrop-blur-md select-none h-14"
    >
      {/* TOP LEFT: Campaign Map Button (Locked until next city is unlocked in gameplay) */}
      <div className="flex items-center gap-2">
        <button
          id="top-left-campaign-map-btn"
          disabled={!isMapUnlocked}
          onClick={() => {
            if (!isMapUnlocked) return;
            sounds.playClick();
            onOpenMapModal();
          }}
          className={`relative flex items-center gap-2 px-3.5 py-1.5 font-black text-xs rounded-xl shadow-lg border transition active:scale-95 group ${
            isMapUnlocked
              ? 'bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-400 text-stone-950 border-amber-300 cursor-pointer'
              : 'bg-stone-900 border-stone-800 text-stone-500 cursor-not-allowed opacity-75'
          }`}
          title={isMapUnlocked ? "Open Campaign Cities Scroll Map" : "City map locked until you unlock the next city!"}
        >
          {isMapUnlocked ? (
            <>
              <Compass className="w-4 h-4 text-stone-950 group-hover:rotate-45 transition-transform" />
              <span className="tracking-wider uppercase">CAMPAIGN CITIES</span>
            </>
          ) : (
            <>
              <Lock className="w-4 h-4 text-amber-500" />
              <span className="tracking-wider uppercase text-amber-500/90">LOCKED CITY</span>
            </>
          )}
        </button>

        {/* Player Profile Level */}
        <button
          onClick={onOpenStats}
          className="hidden sm:flex items-center gap-2 bg-stone-900 border border-stone-800 px-3 py-1 rounded-xl hover:border-amber-500/50 transition"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
            <Crown className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-stone-200">
            LVL <span className="text-amber-400 font-black">{playerProfile.level}</span>
          </span>
        </button>

        {/* Real-time Online Visitors Indicator */}
        <div
          className="hidden md:flex items-center gap-2 bg-stone-900/90 border border-emerald-500/40 px-3 py-1 rounded-xl shadow-md"
          title={`Real-Time Live Online: ${onlineNow || 1} | All-Time Visitors: ${(allTimeVisitors || 1).toLocaleString()}`}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-black text-emerald-400">
            {onlineNow || 1} <span className="text-[10px] text-stone-400 font-bold uppercase">Online</span>
          </span>
        </div>
      </div>

      {/* TOP MIDDLE: Hover for City Details Flash Banner */}
      <div
        className="relative flex items-center justify-center cursor-pointer group px-4 py-1"
        onMouseEnter={() => setShowHoverDetails(true)}
        onMouseLeave={() => setShowHoverDetails(false)}
      >
        <div className="flex items-center gap-2 bg-stone-900/90 border border-amber-500/30 group-hover:border-amber-400/80 px-4 py-1.5 rounded-full shadow-md transition">
          <Info className="w-4 h-4 text-amber-400 animate-pulse" />
          <span className="text-xs font-black uppercase text-amber-200 tracking-wide">
            {currentTown.name}
          </span>
          <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
            ${currentTown.buyIn} Buy-In
          </span>
        </div>

        {/* Hover Dropdown Details Card */}
        {showHoverDetails && (
          <div className="absolute top-12 left-1/2 -translate-x-1/2 w-80 bg-stone-900/95 border-2 border-amber-500/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md z-50 animate-in fade-in slide-in-from-top-2 duration-200 text-stone-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <h4 className="font-black text-amber-300 text-sm uppercase">
                {currentTown.name} ({currentTown.title})
              </h4>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-400/30">
                {currentTown.difficulty}
              </span>
            </div>

            <p className="text-xs text-stone-300 my-2 leading-relaxed">
              {currentTown.description}
            </p>

            <div className="space-y-1.5 text-[11px] text-stone-400 border-t border-stone-800 pt-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Population:
                </span>
                <span className="font-bold text-stone-200">{currentTown.population}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" /> Saloon Buy-In:
                </span>
                <span className="font-bold text-amber-300">${currentTown.buyIn} Chips</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> City Boss:
                </span>
                <span className="font-bold text-stone-200">{currentTown.bossName}</span>
              </div>
            </div>

            {currentTown.keyArchitecture?.length > 0 && (
              <div className="mt-2 pt-2 border-t border-stone-800 text-[10px]">
                <span className="font-bold uppercase text-amber-400/90 block mb-1">Architecture:</span>
                <div className="flex flex-wrap gap-1">
                  {currentTown.keyArchitecture.map((arch, idx) => (
                    <span key={idx} className="bg-stone-950 px-2 py-0.5 rounded text-stone-300 border border-stone-800">
                      {arch}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* TOP RIGHT: Currency & HAMBURGER MENU ONLY */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Chips Balance */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-inner">
          <EuchreCoin size="xs" />
          <span className="text-xs sm:text-sm font-black text-amber-300">
            {formatMoney(playerProfile.chips)}
          </span>
          {playerProfile.chips < 200 && (
            <button
              onClick={() => {
                sounds.playWin();
                confetti({ particleCount: 40, spread: 40 });
                onClaimFreeChips();
              }}
              className="ml-1 text-[9px] bg-emerald-600 hover:bg-emerald-500 text-white font-black px-2 py-0.5 rounded shadow animate-pulse"
            >
              +1k Free
            </button>
          )}
        </div>

        {/* Sovereigns Balance */}
        <div className="flex items-center gap-1.5 bg-stone-900/90 border border-purple-500/40 px-2.5 sm:px-3 py-1.5 rounded-xl shadow-inner">
          <Crown className="w-4 h-4 text-purple-400" />
          <span className="text-xs sm:text-sm font-black text-purple-300">
            {playerProfile.sovereigns || 15}
          </span>
        </div>

        {/* Mailbox Button */}
        {onOpenMailbox && (
          <button
            onClick={() => {
              sounds.playClick();
              onOpenMailbox();
            }}
            className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-stone-300 hover:text-white border border-slate-700 flex items-center justify-center shadow-lg transition active:scale-95 group"
            title="Open Mailbox & Requests"
          >
            <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-600 text-white rounded-full text-[9px] font-black flex items-center justify-center border border-slate-950">
              3
            </span>
          </button>
        )}

        {/* Settings Button */}
        <button
          onClick={() => {
            sounds.playClick();
            if (onOpenSettings) onOpenSettings();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center shadow-lg transition active:scale-95 group"
          title="Open Game Settings"
        >
          <Settings className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-45 transition-transform" />
        </button>

        {/* TOP RIGHT HAMBURGER MENU */}
        <button
          id="top-right-hamburger-menu-btn"
          onClick={() => {
            sounds.playClick();
            onOpenHamburgerMenu();
          }}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-900 hover:bg-stone-800 text-amber-300 border border-amber-500/50 flex items-center justify-center shadow-lg transition active:scale-95 group"
          title="Open Saloon Hamburger Menu"
        >
          <Menu className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
        </button>
      </div>
    </header>
  );
};
