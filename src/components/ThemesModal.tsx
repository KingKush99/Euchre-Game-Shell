import React, { useState, useEffect } from 'react';
import { X, Check, Lock, Sparkles, Coins, Palette } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { ALL_THEMES_BY_CATEGORY, ThemeItem } from '../data/themesData';

interface ThemesModalProps {
  isOpen: boolean;
  onClose: () => void;
  coinsBalance?: number;
  activeMainMenuThemeId?: string;
  activeInGameThemeId?: string;
  activeProfileThemeId?: string;
  onApplyTheme?: (themeId: string, category: 'main_menu' | 'in_game' | 'profile') => void;
  onUnlockTheme?: (themeId: string, costCoins: number) => void;
}

const UNLOCKED_THEMES_STORAGE_KEY = 'euchre_unlocked_themes_v3';

// Default unlocked themes: first 3 of each category
const DEFAULT_UNLOCKED_THEMES = [
  'main_menu_1',
  'main_menu_2',
  'main_menu_3',
  'profile_1',
  'profile_2',
  'profile_3',
  'in_game_1',
  'in_game_2',
  'in_game_3',
];

export const ThemesModal: React.FC<ThemesModalProps> = ({
  isOpen,
  onClose,
  coinsBalance = 1500,
  activeMainMenuThemeId = 'main_menu_1',
  activeInGameThemeId = 'in_game_1',
  activeProfileThemeId = 'profile_1',
  onApplyTheme,
  onUnlockTheme,
}) => {
  const [activeTab, setActiveTab] = useState<'main_menu' | 'in_game' | 'profile'>('main_menu');
  const [unlockedThemeKeys, setUnlockedThemeKeys] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(UNLOCKED_THEMES_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Set([...DEFAULT_UNLOCKED_THEMES, ...parsed]);
      }
    } catch {
      // ignore
    }
    return new Set(DEFAULT_UNLOCKED_THEMES);
  });

  const [purchaseMsg, setPurchaseMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(
        UNLOCKED_THEMES_STORAGE_KEY,
        JSON.stringify(Array.from(unlockedThemeKeys))
      );
    } catch {
      // ignore
    }
  }, [unlockedThemeKeys]);

  if (!isOpen) return null;

  const currentActiveThemeKey =
    activeTab === 'main_menu'
      ? activeMainMenuThemeId
      : activeTab === 'in_game'
      ? activeInGameThemeId
      : activeProfileThemeId;

  const currentThemeList: ThemeItem[] = ALL_THEMES_BY_CATEGORY[activeTab] || ALL_THEMES_BY_CATEGORY.main_menu;

  const handleCardClick = (theme: ThemeItem) => {
    sounds.playClick();
    const isUnlocked = theme.costCoins === 0 || unlockedThemeKeys.has(theme.themeKey);

    if (isUnlocked) {
      if (onApplyTheme) {
        onApplyTheme(theme.themeKey, activeTab);
      }
      setPurchaseMsg(`✅ Applied ${theme.patternStyle} theme!`);
      setTimeout(() => setPurchaseMsg(null), 2500);
    } else {
      if (coinsBalance >= theme.costCoins) {
        sounds.playWin();
        setUnlockedThemeKeys((prev) => new Set([...prev, theme.themeKey]));
        if (onUnlockTheme) {
          onUnlockTheme(theme.themeKey, theme.costCoins);
        }
        if (onApplyTheme) {
          onApplyTheme(theme.themeKey, activeTab);
        }
        setPurchaseMsg(`🎉 Unlocked & Applied ${theme.title} (${theme.patternStyle}) for ${theme.badge}!`);
        setTimeout(() => setPurchaseMsg(null), 3000);
      } else {
        sounds.playCardDrop();
        setPurchaseMsg(`❌ Insufficient coins: Need ${theme.badge}. You have ${coinsBalance.toLocaleString()} coins.`);
        setTimeout(() => setPurchaseMsg(null), 3000);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        style={{
          width: 'min(1120px, calc(100vw - 32px))',
          height: 'min(820px, calc(100vh - 32px))',
        }}
        className="relative bg-[#0b101d] border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white flex flex-col overflow-hidden shrink-0"
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800/80 shrink-0">
          <div className="space-y-1">
            <div className="text-[11px] font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
              <span className="flex items-center gap-1 text-amber-400">
                <Palette className="w-3.5 h-3.5" />
                EUCHRE PALACE THEME GALLERY
              </span>
              <span className="text-amber-400 font-bold">•</span>
              <span className="text-amber-300 flex items-center gap-1 font-bold">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                Balance: {coinsBalance.toLocaleString()} coins
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
              <span>Palace Custom Themes</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-600/30 text-blue-300 border border-blue-500/40 font-mono">
                30 Distinct Styles
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-stone-400 font-medium max-w-2xl">
              First 3 from every category are Free. 4th is 100 coins, doubling up to 6,400 coins for master themes.
            </p>
          </div>

          {/* Close Button Red Circle */}
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-[#e11d23] hover:bg-[#f4282e] text-white flex items-center justify-center shadow-[0_0_20px_rgba(225,29,35,0.6)] transition active:scale-95 shrink-0 ml-4"
            title="Close Gallery"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Purchase/Success Banner */}
        {purchaseMsg && (
          <div className="my-2 p-2.5 bg-blue-950/90 border border-blue-400 rounded-xl text-blue-200 text-xs font-bold text-center animate-pulse shrink-0">
            {purchaseMsg}
          </div>
        )}

        {/* Tab Selection Bar & Custom Uploader Button */}
        <div className="flex flex-wrap items-center justify-between gap-3 my-3.5 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {[
              { id: 'main_menu', label: 'Main Menu Themes', count: 10, icon: '🏠' },
              { id: 'profile', label: 'Profile Themes', count: 10, icon: '👤' },
              { id: 'in_game', label: 'In-Game Table Themes', count: 10, icon: '♠️' },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab(tab.id as any);
                  }}
                  className={`px-3.5 sm:px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all border flex items-center gap-2 ${
                    isActive
                      ? 'bg-[#1d64ec] text-white border-blue-400/80 shadow-[0_0_20px_rgba(29,100,236,0.5)]'
                      : 'bg-[#101828] text-stone-300 border-slate-800 hover:bg-[#182338] hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/40 text-stone-300 font-mono">
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 10 Theme Cards Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4 pb-4">
            {currentThemeList.map((theme) => {
              const isUnlocked = theme.costCoins === 0 || unlockedThemeKeys.has(theme.themeKey);
              const isSelected = currentActiveThemeKey === theme.themeKey;

              return (
                <div
                  key={theme.id}
                  onClick={() => handleCardClick(theme)}
                  className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer group transition-all duration-200 border-2 shadow-lg flex flex-col justify-between p-3 ${
                    isSelected
                      ? 'border-yellow-400 ring-4 ring-yellow-400/40 scale-[1.02]'
                      : isUnlocked
                      ? 'border-slate-700 hover:border-sky-400 hover:scale-[1.01]'
                      : 'border-slate-800/80 hover:border-amber-400/70 hover:scale-[1.01]'
                  }`}
                >
                  {/* Background Artwork Canvas */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${theme.bgGradient} transition-transform group-hover:scale-105 opacity-90`}
                    style={
                      theme.imageUrl
                        ? {
                            backgroundImage: `url(${theme.imageUrl})`,
                            backgroundRepeat: 'repeat',
                            backgroundSize: '120px 120px',
                          }
                        : undefined
                    }
                  >
                    {/* Dark gradient overlay for badge readability */}
                    <div className="absolute inset-0 bg-stone-950/40" />
                    {/* Pattern Overlay Effect */}
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/15 via-transparent to-black/70" />
                    
                    {/* Center Emoji / Motif */}
                    <div className="absolute inset-0 flex items-center justify-center p-2 text-center text-3xl sm:text-4xl group-hover:scale-110 transition-transform select-none drop-shadow-md">
                      {theme.previewEmoji}
                    </div>
                  </div>

                  {/* Top Header: Order Number & Check/Lock Icon */}
                  <div className="relative z-10 w-full flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold bg-black/60 px-1.5 py-0.5 rounded text-stone-300 border border-white/10">
                      #{theme.index + 1}
                    </span>
                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-yellow-400 text-stone-950 flex items-center justify-center font-black shadow-lg">
                        <Check className="w-4 h-4 stroke-[3]" />
                      </div>
                    ) : !isUnlocked ? (
                      <div className="w-6 h-6 rounded-full bg-black/70 text-amber-400 flex items-center justify-center border border-amber-400/40 shadow">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-400/30">
                        <Sparkles className="w-3 h-3" />
                      </div>
                    )}
                  </div>

                  {/* Dark Glass Overlay at Bottom */}
                  <div className="relative z-10 w-full bg-stone-950/85 backdrop-blur-md rounded-xl p-2 border border-white/10 flex flex-col items-center justify-center text-center gap-1">
                    {/* Title Label */}
                    <div className="text-[10px] font-black tracking-wide text-white uppercase font-mono truncate max-w-full">
                      {theme.patternStyle}
                    </div>

                    {/* Price / Free Badge */}
                    <div
                      className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        isSelected
                          ? 'bg-yellow-400 text-stone-950 shadow font-extrabold'
                          : isUnlocked
                          ? 'bg-emerald-500 text-white shadow'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow font-bold'
                      }`}
                    >
                      {isSelected ? 'ACTIVE' : isUnlocked ? 'OWNED' : theme.badge}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Summary / Pricing rule */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-stone-400 shrink-0 font-mono">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 font-bold">1-3: Free</span>
            <span>•</span>
            <span className="text-amber-400">4: 100</span>
            <span>•</span>
            <span className="text-amber-400">5: 200</span>
            <span>•</span>
            <span className="text-amber-400">6: 400</span>
            <span>•</span>
            <span className="text-amber-400">7: 800</span>
            <span>•</span>
            <span className="text-amber-400">8: 1.6k</span>
            <span>•</span>
            <span className="text-amber-400">9: 3.2k</span>
            <span>•</span>
            <span className="text-amber-400">10: 6.4k coins</span>
          </div>
          <div>Click any unlocked card to immediately activate.</div>
        </div>

      </div>
    </div>
  );
};
