import React, { useState } from 'react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Music,
  Settings,
  Sparkles,
  Palette,
  Check,
  Tv,
  BookOpen,
  Camera,
  Layers,
  ShoppingBag,
  RotateCcw,
  User,
  Crown,
  Download,
} from 'lucide-react';

import { DownloadZipModal } from './DownloadZipModal';

interface HamburgerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onNavigateMap?: () => void;
  onOpenStats?: () => void;
  onOpenProperties?: () => void;
  onOpenShop?: () => void;
  onOpenCalendar?: () => void;
  onOpenRules?: () => void;
  onOpenMusic?: () => void;
  onOpenThemes?: () => void;
  onOpenSettings?: () => void;
  onOpenWatchAds?: () => void;
  onWatchAdReward?: () => void;
  onResetProgress?: () => void;
  cameraAngle?: 'table' | 'overhead' | 'cinematic' | 'first_person';
  onSetCameraAngle?: (angle: 'table' | 'overhead' | 'cinematic' | 'first_person') => void;
  paintedTheme?: string;
  onSetPaintedTheme?: (theme: string) => void;
  isGameplay?: boolean;
}

export const HamburgerMenuModal: React.FC<HamburgerMenuModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onNavigateMap,
  onOpenStats,
  onOpenProperties,
  onOpenShop,
  onOpenCalendar,
  onOpenRules,
  onOpenMusic,
  onOpenThemes,
  onOpenSettings,
  onOpenWatchAds,
  onWatchAdReward,
  onResetProgress,
  cameraAngle,
  onSetCameraAngle,
  paintedTheme,
  onSetPaintedTheme,
  isGameplay = false,
}) => {
  const [activeSubView, setActiveSubView] = useState<'main' | 'settings' | 'camera' | 'themes'>('main');
  const [isMusicOn, setIsMusicOn] = useState(sounds.isMusicOn());
  const [adRewardedNotification, setAdRewardedNotification] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);

  if (!isOpen) return null;

  const handleToggleMusic = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = sounds.toggleMusic();
    setIsMusicOn(newState);
  };

  const handleMusicRowClick = () => {
    sounds.playClick();
    if (onOpenMusic) {
      onOpenMusic();
      onClose();
    } else {
      const newState = sounds.toggleMusic();
      setIsMusicOn(newState);
    }
  };

  const handleWatchAd = () => {
    sounds.playWin();
    confetti({ particleCount: 35, spread: 50, origin: { y: 0.3 } });
    if (onWatchAdReward) {
      onWatchAdReward();
    } else {
      playerProfile.chips += 25;
    }
    setAdRewardedNotification(true);
    setTimeout(() => setAdRewardedNotification(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Click-outside Backdrop */}
      <div
        className="absolute inset-0 pointer-events-auto bg-black/40 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Main Container positioned directly underneath the top right Hamburger Button */}
      <div
        id="saloon-hamburger-menu-card"
        className="pointer-events-auto fixed top-16 sm:top-20 right-3 sm:right-6 z-50 w-72 sm:w-80 bg-[#0c1322] border-2 border-slate-700/80 rounded-3xl p-4 shadow-[0_20px_60px_rgba(0,0,0,0.95)] flex flex-col text-stone-100 animate-in slide-in-from-top-4 duration-200 select-none overflow-hidden"
      >
        {/* TOP COINS HEADER PILL */}
        <div className="w-full bg-[#131b2e] border border-slate-700/70 rounded-2xl p-3 flex items-center justify-center shadow-inner mb-3">
          <div className="flex items-center gap-2.5">
            <EuchreCoin size="md" className="shrink-0" />
            <span className="text-amber-400 font-extrabold text-sm sm:text-base tracking-wide font-sans">
              Coins: {playerProfile.chips.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Ad Reward Banner if claimed */}
        {adRewardedNotification && (
          <div className="w-full bg-emerald-950/90 border border-emerald-500/50 rounded-xl p-2 mb-2 text-center text-xs font-black text-emerald-300 animate-in zoom-in-95 duration-150">
            🎉 +25 Euchre Coins Claimed!
          </div>
        )}

        {activeSubView === 'main' ? (
          /* PRIMARY UNIFORM MENU BUTTON LIST */
          <div className="flex flex-col gap-2 text-xs font-bold text-stone-200">
            {/* 1. Profile */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenStats) {
                  onOpenStats();
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 shrink-0">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Profile
              </span>
            </button>

            {/* 2. Music */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenMusic) {
                  onOpenMusic();
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center border border-pink-500/30 shrink-0">
                <Music className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Music
              </span>
            </button>

            {/* 3. Settings */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenSettings) {
                  onOpenSettings();
                } else {
                  setActiveSubView('settings');
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/30 shrink-0">
                <Settings className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Settings
              </span>
            </button>

            {/* 4. Daily Draw */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenCalendar) {
                  onOpenCalendar();
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Daily Draw
              </span>
            </button>

            {/* 5. Watch Ads */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenWatchAds) {
                  onOpenWatchAds();
                } else if (onWatchAdReward) {
                  handleWatchAd();
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shrink-0">
                <Tv className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Watch Ads
              </span>
            </button>

            {/* 6. Themes */}
            <button
              onClick={() => {
                sounds.playClick();
                if (onOpenThemes) {
                  onOpenThemes();
                }
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-sm"
            >
              <div className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center border border-purple-500/30 shrink-0">
                <Palette className="w-4 h-4" />
              </div>
              <span className="font-bold text-stone-100 text-sm group-hover:text-white transition">
                Themes
              </span>
            </button>

            {/* 7. Download Project ZIP */}
            <button
              onClick={() => {
                sounds.playWin();
                setShowZipModal(true);
              }}
              className="w-full h-11 px-3.5 rounded-xl bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900 hover:to-blue-900 border border-cyan-500/60 flex items-center gap-3 transition active:scale-[0.98] group cursor-pointer shadow-md text-left"
              title="Download entire project source code as a ZIP file"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0 flex items-center justify-between">
                <span className="font-bold text-cyan-200 text-sm group-hover:text-white transition">
                  Download Project (.ZIP)
                </span>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/90 px-1.5 py-0.5 rounded border border-cyan-500/40 font-black">
                  ZIP
                </span>
              </div>
            </button>

            {/* Camera 3D Quick Access during gameplay */}
            {isGameplay && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveSubView('camera');
                  }}
                  className="w-full p-2 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-slate-800 text-[11px] font-bold text-stone-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Camera 3D</span>
                </button>
              </div>
            )}
          </div>
        ) : activeSubView === 'camera' ? (
          /* CAMERA VIEW SUBMENU */
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-black uppercase text-cyan-400 text-xs">3D CAMERA ANGLES</span>
              <button
                onClick={() => setActiveSubView('main')}
                className="text-[10px] text-stone-400 hover:text-white font-bold"
              >
                ← Back
              </button>
            </div>

            {[
              { id: 'overhead', label: 'Overhead Bird’s Eye (Default)', desc: 'Direct top-down overhead gameplay view' },
              { id: 'table', label: 'Elevated Front View', desc: 'Overhead front view of table & players' },
              { id: 'cinematic', label: 'Cinematic View', desc: 'Atmospheric saloon perspective' },
              { id: 'first_person', label: 'First-Person POV', desc: 'Direct view from seat' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => {
                  sounds.playClick();
                  onSetCameraAngle(opt.id as any);
                }}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-left transition ${
                  cameraAngle === opt.id
                    ? 'bg-cyan-950/80 border-cyan-400 text-white'
                    : 'bg-slate-900 border-slate-800 text-stone-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{opt.label}</div>
                  <div className="text-[10px] text-stone-400">{opt.desc}</div>
                </div>
                {cameraAngle === opt.id && <Check className="w-4 h-4 text-cyan-400" />}
              </button>
            ))}
          </div>
        ) : (
          /* SETTINGS SUBMENU */
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-black uppercase text-amber-400 text-xs">AUDIO & PREFERENCES</span>
              <button
                onClick={() => setActiveSubView('main')}
                className="text-[10px] text-stone-400 hover:text-white font-bold"
              >
                ← Back
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl">
                <span className="font-bold text-stone-200">Saloon Music</span>
                <button
                  onClick={handleToggleMusic}
                  className={`px-3 py-1 rounded-full text-xs font-black ${
                    isMusicOn ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50' : 'bg-stone-800 text-stone-400'
                  }`}
                >
                  {isMusicOn ? 'ON' : 'OFF'}
                </button>
              </div>

              <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl">
                <span className="font-bold text-stone-200">Sound Effects (SFX)</span>
                <span className="text-xs font-black text-amber-400">100%</span>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  if (onResetProgress) {
                    onResetProgress();
                  }
                  onClose();
                }}
                className="w-full p-2.5 bg-rose-950/80 hover:bg-rose-900 border border-rose-800/80 rounded-xl text-rose-300 font-black flex items-center justify-center gap-2 transition"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Game Progress</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <DownloadZipModal isOpen={showZipModal} onClose={() => setShowZipModal(false)} />
    </div>
  );
};
