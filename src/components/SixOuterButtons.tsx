import React from 'react';
import { sounds } from '../utils/soundEffects';
import { ProfileAvatarIcon } from './ProfileAvatarIcon';
import { X } from 'lucide-react';

interface SixOuterButtonsProps {
  isGameplay?: boolean;
  onOpenProfile: () => void;
  onOpenHamburger: () => void;
  onOpenLiveVideo: () => void;
  onOpenDMs: () => void;
  onOpenAssistant: () => void;
  onOpenSlots: () => void;
  onOpenStats?: () => void;
  onOpenRules?: () => void;
  onOpenMusic?: () => void;
  onExitTable?: () => void;
  isProfileOpen?: boolean;
  isHamburgerOpen?: boolean;
  isLiveVideoOpen?: boolean;
  isDMsOpen?: boolean;
  isAssistantOpen?: boolean;
  isSlotsOpen?: boolean;
}

// Official Twitch Glitch Icon matching the exact logo
const OfficialTwitchIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.429h-3.429l-3 3v-3H6.857V1.714h13.714z" />
  </svg>
);

// Custom Chess Pawn SVG matching the Top-Left Icon
const ChessPawnIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <circle cx="12" cy="5" r="3" />
    <path d="M12 9c-1.6 0-3 1.2-3.4 2.8C7.5 12.3 7 13.5 7 15c0 1.2.6 2.2 1.5 2.8V19h7v-1.2c.9-.6 1.5-1.6 1.5-2.8 0-1.5-.5-2.7-1.6-3.2C15 10.2 13.6 9 12 9z" />
    <path d="M6 20h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2z" />
  </svg>
);

// Custom PAL Robot Face SVG matching the Bottom-Left Icon
const PalRobotIcon: React.FC = () => (
  <div className="relative flex flex-col items-center justify-center">
    <div className="w-9 h-9 rounded-2xl bg-white shadow-sm flex flex-col items-center justify-center p-1 relative border border-slate-300">
      {/* Ear muffs / headphone accents */}
      <span className="absolute -left-1 top-2 w-1.5 h-3.5 bg-cyan-400 rounded-l-full" />
      <span className="absolute -right-1 top-2 w-1.5 h-3.5 bg-yellow-400 rounded-r-full" />
      {/* Antenna */}
      <span className="absolute -top-1.5 w-1 h-2 bg-slate-400 rounded-full flex items-center justify-center">
        <span className="w-1.5 h-1.5 bg-rose-500 rounded-full -mt-2 shadow-[0_0_6px_#f43f5e]" />
      </span>
      {/* Eyes / Visor */}
      <div className="w-6 h-2.5 bg-slate-900 rounded-md flex items-center justify-around px-1 mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_4px_#67e8f9]" />
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-300 shadow-[0_0_4px_#67e8f9]" />
      </div>
      {/* Smile */}
      <span className="w-2.5 h-0.5 bg-rose-400 rounded-full mt-1" />
    </div>
    {/* PAL Yellow Badge */}
    <div className="absolute -bottom-2 bg-amber-400 border border-amber-300 text-slate-950 text-[8px] font-black uppercase px-2 py-0.2 rounded-full tracking-wider shadow-md">
      PAL
    </div>
  </div>
);

export const SixOuterButtons: React.FC<SixOuterButtonsProps> = ({
  isGameplay = false,
  onOpenProfile,
  onOpenHamburger,
  onOpenLiveVideo,
  onOpenDMs,
  onOpenAssistant,
  onOpenSlots,
  isProfileOpen = false,
  isHamburgerOpen = false,
  isLiveVideoOpen = false,
  isDMsOpen = false,
  isAssistantOpen = false,
  isSlotsOpen = false,
}) => {
  if (isProfileOpen) return null;

  return (
    <div className="pointer-events-none z-40">
      {/* 1. TOP-LEFT BUTTON: Generic Profile Avatar Icon */}
      {!isProfileOpen && (
        <button
          id="btn-top-left-profile"
          onClick={() => {
            sounds.playClick();
            onOpenProfile();
          }}
          className="pointer-events-auto fixed top-4 left-4 sm:top-5 sm:left-5 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#182032]/95 hover:bg-[#222c44] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group overflow-hidden cursor-pointer p-0.5"
          title="Profile & Character Customizer"
        >
          <ProfileAvatarIcon className="w-full h-full group-hover:scale-105 transition-transform" />
        </button>
      )}

      {/* 2. TOP-RIGHT BUTTON: Hamburger Menu (3 horizontal lines) */}
      {!isHamburgerOpen && (
        <button
          id="btn-top-right-menu"
          onClick={() => {
            sounds.playClick();
            onOpenHamburger();
          }}
          className="pointer-events-auto fixed top-4 right-4 sm:top-5 sm:right-5 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#182032]/95 hover:bg-[#222c44] border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group backdrop-blur-md cursor-pointer"
          title="Menu & Settings"
        >
          <div className="w-5 sm:w-6 flex flex-col gap-1 sm:gap-1.5 items-center justify-center group-hover:scale-110 transition-transform">
            <span className="w-full h-0.5 bg-white rounded-full" />
            <span className="w-full h-0.5 bg-white rounded-full" />
            <span className="w-full h-0.5 bg-white rounded-full" />
          </div>
        </button>
      )}

      {/* 3. MIDDLE-LEFT BUTTON: Twitch Official Purple Circle Button (Maintains same style when open) */}
      <button
        id="btn-middle-left-live"
        onClick={() => {
          sounds.playClick();
          onOpenLiveVideo();
        }}
        className="pointer-events-auto fixed top-1/2 -translate-y-1/2 left-4 sm:left-5 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#9146FF] hover:bg-[#772ce8] border border-purple-300/40 shadow-[0_0_25px_rgba(145,70,255,0.7)] text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md cursor-pointer"
        title="Twitch Live Chat & Saloon Stream"
      >
        <OfficialTwitchIcon className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
      </button>

      {/* 4. MIDDLE-RIGHT BUTTON: Royal Blue Circle with "DMs" Bold Text (Visible beside DMs modal) */}
      <button
        id="btn-middle-right-dms"
        onClick={() => {
          sounds.playClick();
          onOpenDMs();
        }}
        className="pointer-events-auto fixed top-1/2 -translate-y-1/2 right-4 sm:right-5 z-50 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#2563eb] to-[#1d4ed8] hover:from-[#3b82f6] hover:to-[#2563eb] border border-blue-300/40 text-white shadow-[0_0_25px_rgba(37,99,235,0.7)] flex items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md cursor-pointer"
        title={isDMsOpen ? 'Close Direct Messages' : 'Direct Messages'}
      >
        <span className="text-xs sm:text-sm font-black tracking-wide text-white group-hover:scale-110 transition-transform">
          DMs
        </span>
      </button>

      {/* 5. BOTTOM-LEFT BUTTON: Palace Assistant Robot with PAL Badge */}
      {!isAssistantOpen && (
        <button
          id="btn-bottom-left-pal"
          onClick={() => {
            sounds.playClick();
            onOpenAssistant();
          }}
          className="pointer-events-auto fixed bottom-4 left-4 sm:bottom-5 sm:left-5 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#182032]/95 hover:bg-[#222c44] border border-white/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)] flex items-center justify-center transition-all hover:scale-105 active:scale-95 group backdrop-blur-md cursor-pointer"
          title="Palace Assistant AI (PAL)"
        >
          <PalRobotIcon />
        </button>
      )}

      {/* 6. BOTTOM-RIGHT BUTTON: Vibrant Orange Circle with "777 SLOTS" */}
      {!isSlotsOpen && !isGameplay && (
        <button
          id="btn-bottom-right-slots"
          onClick={() => {
            sounds.playClick();
            onOpenSlots();
          }}
          className="pointer-events-auto fixed bottom-4 right-4 sm:bottom-5 sm:right-5 w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-[#ea580c] to-[#c2410c] hover:from-[#f97316] hover:to-[#ea580c] border border-amber-300/40 text-white shadow-[0_0_25px_rgba(234,88,12,0.7)] flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 group backdrop-blur-md cursor-pointer"
          title="777 Slots Casino"
        >
          <span className="text-xs sm:text-[13px] font-black text-white leading-none tracking-tight group-hover:scale-105 transition-transform">
            777
          </span>
          <span className="text-[7px] sm:text-[8px] font-black uppercase text-white tracking-widest leading-none mt-0.5">
            SLOTS
          </span>
        </button>
      )}
    </div>
  );
};

