import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import {
  Crown,
  Lock,
  Star,
  Trophy,
  CheckCircle2,
  Sparkles,
  Play,
  Cloud,
  CloudFog,
  Wind,
  Eye,
  Info,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { CityShapedNumber } from './CityShapedNumber';

interface CandyCrushCampaignMapProps {
  playerProfile: PlayerProfile;
  onSelectTown?: (town: TownLocation) => void;
  onTravelToTown?: (town: TownLocation) => void;
}

export const CandyCrushCampaignMap: React.FC<CandyCrushCampaignMapProps> = ({
  playerProfile,
  onSelectTown,
  onTravelToTown,
}) => {
  const [selectedLevelId, setSelectedLevelId] = useState<string>('pine_hollow');
  const [showFogDetails, setShowFogDetails] = useState(false);

  // 10 towns in TOWNS_DATA corresponding to levels 1 to 10
  const towns = TOWNS_DATA;

  // Winding S-curve positions (Candy Crush style)
  const getXPositionPercent = (index: number) => {
    const cycle = index % 4;
    if (cycle === 0) return 50; // center
    if (cycle === 1) return 22; // left
    if (cycle === 2) return 50; // center
    return 78; // right
  };

  const selectedTown = towns.find((t) => t.id === selectedLevelId) || towns[0];

  const isLevelUnlocked = (town: TownLocation, idx: number) => {
    if (ALLOW_ALL_CITIES_UNRESTRICTED) return true;
    if (idx === 0) return true; // Level 1 always unlocked
    if (playerProfile.level >= town.requiredLevel) return true;
    if (playerProfile.conqueredTowns?.includes(towns[idx - 1].id)) return true;
    return false;
  };

  const isLevelConquered = (town: TownLocation) => {
    return playerProfile.conqueredTowns?.includes(town.id) || town.conquered || false;
  };

  const handleLevelClick = (town: TownLocation, idx: number) => {
    sounds.playClick();
    setSelectedLevelId(town.id);
    if (onSelectTown) {
      onSelectTown(town);
    }
  };

  const handlePlayLevel = (town: TownLocation) => {
    sounds.playWin();
    confetti({ particleCount: 50, spread: 60 });
    if (onTravelToTown) {
      onTravelToTown(town);
    }
  };

  return (
    <div className="w-full h-full bg-gradient-to-b from-[#090503] via-[#160c05] to-[#070301] border-2 border-amber-500/50 rounded-3xl p-3 sm:p-5 shadow-2xl text-white relative overflow-hidden flex flex-col">
      {/* Dynamic Animated Fog of War Atmosphere Styles */}
      <style>{`
        @keyframes cloudDriftSlow {
          0% { transform: translateX(-5%) translateY(0); }
          50% { transform: translateX(5%) translateY(-6px); }
          100% { transform: translateX(-5%) translateY(0); }
        }
        @keyframes cloudDriftFast {
          0% { transform: translateX(8%) translateY(-4px); }
          50% { transform: translateX(-8%) translateY(4px); }
          100% { transform: translateX(8%) translateY(-4px); }
        }
        @keyframes vaporPulse {
          0%, 100% { opacity: 0.65; transform: scale(1); }
          50% { opacity: 0.9; transform: scale(1.05); }
        }
        @keyframes windStream {
          0% { transform: translateX(-100%); opacity: 0; }
          40% { opacity: 0.7; }
          80% { opacity: 0.7; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        .animate-cloud-slow {
          animation: cloudDriftSlow 18s ease-in-out infinite;
        }
        .animate-cloud-fast {
          animation: cloudDriftFast 12s ease-in-out infinite;
        }
        .animate-vapor {
          animation: vaporPulse 6s ease-in-out infinite;
        }
        .animate-wind {
          animation: windStream 8s linear infinite;
        }
      `}</style>

      {/* Top Header Banner with Fog of War Status */}
      <div className="w-full bg-[#201007]/95 border border-amber-500/50 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between shadow-2xl backdrop-blur-md shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 flex items-center justify-center font-black shadow-lg border border-amber-300 shrink-0">
            <Trophy className="w-5 h-5 text-stone-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-amber-200 font-black text-sm sm:text-base uppercase tracking-wider drop-shadow flex items-center gap-1.5">
                <span>TEXAS SALOON CAMPAIGN TRAIL</span>
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-bold">
                10 CITY-SHAPED LEVELS
              </span>
            </div>
            <p className="text-[11px] text-amber-300/80 font-semibold flex items-center gap-1">
              <span>Numbers sculpted in authentic Texas city architecture</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">Defeat bosses to clear territory</span>
            </p>
          </div>
        </div>

        {/* Fog of War & Progress Badges */}
        <div className="flex items-center gap-2">
          <div
            onClick={() => setShowFogDetails((prev) => !prev)}
            className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-cyan-500/40 text-xs font-black shadow cursor-pointer transition"
            title="Fog of War cloud cover status"
          >
            <CloudFog className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>FOG OF WAR ACTIVE</span>
          </div>

          <div className="bg-[#3d1f0a] px-3 py-1.5 rounded-xl border border-amber-500/40 text-xs font-black text-amber-300 flex items-center gap-1.5 shadow">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>{(playerProfile.conqueredTowns?.length || 0)} / 10 Conquered</span>
          </div>
        </div>
      </div>

      {/* Fog of War Explanatory Toast if toggled */}
      {showFogDetails && (
        <div className="w-full bg-cyan-950/90 border border-cyan-500/50 rounded-xl p-2.5 my-2 text-xs text-cyan-100 flex items-center justify-between z-30 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CloudFog className="w-4 h-4 text-cyan-300 shrink-0" />
            <span>
              <strong>REAL FOG OF WAR:</strong> Volumetric cloud banks shroud undiscovered Texas territories. Level up your player rank or conquer preceding cities to dispel the clouds and reveal new city landmarks!
            </span>
          </div>
          <button onClick={() => setShowFogDetails(false)} className="text-cyan-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Vertical Scrollable Candy Crush Level Trail Map Container */}
      <div className="relative flex-1 w-full overflow-y-auto overflow-x-hidden my-2 pr-1 scrollbar-thin scrollbar-thumb-amber-600/40 select-none">
        
        {/* Background Ambient Wind Streaks & Distant Mist */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="w-full h-full opacity-30 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-slate-950/40 to-transparent" />
          <div className="absolute top-1/4 -left-1/4 w-3/4 h-2 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent rounded-full blur-sm animate-wind" style={{ animationDelay: '0s' }} />
          <div className="absolute top-2/3 -left-1/4 w-2/3 h-1.5 bg-gradient-to-r from-transparent via-amber-200/20 to-transparent rounded-full blur-sm animate-wind" style={{ animationDelay: '4s' }} />
        </div>

        {/* Winding Trail SVG Connector Lines */}
        <div className="absolute inset-0 pointer-events-none z-0">
          <svg className="w-full h-full min-h-[1250px]" preserveAspectRatio="none">
            {towns.map((town, idx) => {
              if (idx === towns.length - 1) return null;
              const nextTown = towns[idx + 1];

              const totalLevels = towns.length;
              const levelHeight = 120;
              const startY = (totalLevels - 1 - idx) * levelHeight + 70;
              const endY = (totalLevels - 1 - (idx + 1)) * levelHeight + 70;

              const startX = `${getXPositionPercent(idx)}%`;
              const endX = `${getXPositionPercent(idx + 1)}%`;

              const unlocked = isLevelUnlocked(nextTown, idx + 1);

              return (
                <line
                  key={`path-${idx}`}
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={unlocked ? '#f59e0b' : '#334155'}
                  strokeWidth={unlocked ? '6' : '4'}
                  strokeDasharray={unlocked ? '8,6' : '4,4'}
                  strokeLinecap="round"
                  className={unlocked ? 'animate-pulse' : ''}
                />
              );
            })}
          </svg>
        </div>

        {/* Vertical Nodes Trail (Stacked from Level 10 at Top down to Level 1 at Bottom) */}
        <div className="relative z-10 w-full min-h-[1250px] flex flex-col justify-between py-6">
          {towns
            .slice()
            .reverse()
            .map((town, reverseIdx) => {
              const originalIdx = towns.length - 1 - reverseIdx; // 9 down to 0
              const levelNumber = originalIdx + 1;
              const unlocked = isLevelUnlocked(town, originalIdx);
              const conquered = isLevelConquered(town);
              const isSelected = selectedLevelId === town.id;
              const isCurrent = (playerProfile.currentTownId || 'pine_hollow') === town.id;

              const xPct = getXPositionPercent(originalIdx);

              return (
                <div
                  key={town.id}
                  style={{ left: `${xPct}%`, transform: 'translateX(-50%)' }}
                  className="relative flex flex-col items-center justify-center my-3 transition-all duration-300"
                >
                  {/* Current Player Avatar Marker Floating Above Level Node */}
                  {isCurrent && (
                    <div className="absolute -top-11 z-40 flex flex-col items-center animate-bounce pointer-events-none">
                      <div className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-stone-950 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-2xl uppercase border border-white tracking-wider flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-stone-950" /> YOU ARE HERE
                      </div>
                      <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 -mt-1 shadow" />
                    </div>
                  )}

                  {/* Level Container with City-Shaped Number & Fog of War Cloud Shroud */}
                  <div className="relative group">
                    {/* REAL FOG OF WAR: Billowing Clouds Shrouding Locked Levels */}
                    {!unlocked && (
                      <div className="absolute -inset-8 z-30 pointer-events-none flex items-center justify-center">
                        {/* Layer 1: Base Dark Ambient Fog Shroud */}
                        <div className="absolute inset-0 bg-slate-950/70 rounded-full blur-xl animate-vapor" />

                        {/* Layer 2: Animated Volumetric Puffy Cloud Bank (SVG Layer) */}
                        <svg viewBox="0 0 160 120" className="w-44 h-32 absolute animate-cloud-slow drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] opacity-90">
                          {/* Cloud puff cluster */}
                          <ellipse cx="60" cy="65" rx="35" ry="24" fill="#334155" />
                          <ellipse cx="95" cy="55" rx="32" ry="26" fill="#475569" />
                          <ellipse cx="80" cy="42" rx="30" ry="24" fill="#64748b" />
                          <ellipse cx="120" cy="70" rx="25" ry="20" fill="#334155" />
                          <ellipse cx="40" cy="72" rx="22" ry="18" fill="#1e293b" />
                          {/* Subtle mist highlights */}
                          <ellipse cx="80" cy="40" rx="22" ry="12" fill="#94a3b8" opacity="0.4" />
                          <ellipse cx="65" cy="58" rx="20" ry="10" fill="#cbd5e1" opacity="0.3" />
                        </svg>

                        {/* Layer 3: Secondary Swirling Vapor Ring */}
                        <svg viewBox="0 0 160 120" className="w-48 h-36 absolute animate-cloud-fast drop-shadow-md opacity-75">
                          <ellipse cx="75" cy="68" rx="42" ry="22" fill="#1e293b" />
                          <ellipse cx="105" cy="62" rx="28" ry="22" fill="#334155" />
                          <ellipse cx="50" cy="58" rx="26" ry="18" fill="#475569" />
                        </svg>

                        {/* Fog of War Shroud Icon & Requirement Badge */}
                        <div className="relative z-40 flex flex-col items-center bg-slate-900/95 border border-cyan-500/60 px-2.5 py-1 rounded-full shadow-2xl backdrop-blur-md">
                          <div className="flex items-center gap-1 text-[9px] font-black uppercase text-cyan-300 tracking-wider">
                            <Lock className="w-3 h-3 text-cyan-400" />
                            <span>LVL {town.requiredLevel} • FOG OF WAR</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Interactive Level Button: Star-Shaped Candy Gem Medallion */}
                    <button
                      onClick={() => handleLevelClick(town, originalIdx)}
                      className={`relative w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? 'scale-115 drop-shadow-[0_0_25px_rgba(245,158,11,1)] z-20'
                          : 'hover:scale-105 z-10'
                      }`}
                    >
                      {/* 1. Outer 5-Pointed Golden Star Medallion Base (SVG) */}
                      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full drop-shadow-xl">
                        <polygon
                          points="50,2 63,33 97,35 71,57 79,90 50,71 21,90 29,57 3,35 37,33"
                          fill={conquered ? '#fde047' : unlocked ? '#fb923c' : '#475569'}
                          stroke={conquered ? '#ca8a04' : unlocked ? '#ea580c' : '#334155'}
                          strokeWidth="3.5"
                          strokeLinejoin="round"
                        />
                      </svg>

                      {/* 2. Inner Domed Glossy Jewel Button */}
                      <div
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 flex items-center justify-center shadow-inner overflow-hidden ${
                          conquered
                            ? 'bg-gradient-to-b from-blue-500 via-blue-600 to-indigo-800 border-yellow-200 text-white'
                            : unlocked
                            ? 'bg-gradient-to-b from-amber-400 via-orange-500 to-red-600 border-yellow-200 text-stone-950 font-black'
                            : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 border-slate-600 text-slate-400'
                        }`}
                      >
                        {/* Specular Highlight Arch */}
                        <div className="absolute top-1 left-2 right-2 h-4 bg-gradient-to-b from-white/50 to-transparent rounded-full pointer-events-none" />

                        {/* Bold Level Number */}
                        <span className="relative z-10 text-xl sm:text-2xl font-black drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-white">
                          {levelNumber}
                        </span>
                      </div>

                      {/* 3. Trio of Rating Stars (★ ★ ★) Underneath (matching attached screenshot!) */}
                      <div className="absolute -bottom-2 z-20 flex items-center gap-1 bg-stone-950/90 px-2 py-0.5 rounded-full border border-amber-400/50 shadow-md">
                        <Star className={`w-3 h-3 ${conquered ? 'text-yellow-400 fill-yellow-400' : unlocked ? 'text-yellow-400 fill-yellow-400' : 'text-stone-600 fill-stone-700'}`} />
                        <Star className={`w-3 h-3 ${conquered ? 'text-yellow-400 fill-yellow-400' : 'text-stone-600 fill-stone-700'}`} />
                        <Star className={`w-3 h-3 ${conquered ? 'text-yellow-400 fill-yellow-400' : 'text-stone-600 fill-stone-700'}`} />
                      </div>
                    </button>
                  </div>

                  {/* Level Town Name Label Tag */}
                  <div className="mt-2 bg-stone-950/95 border border-amber-500/50 px-3.5 py-1 rounded-full shadow-xl flex items-center gap-1.5 backdrop-blur-md z-20">
                    <span className="text-xs font-black text-amber-200 uppercase tracking-wide">
                      {town.name}
                    </span>
                    {conquered ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-950" />
                    ) : !unlocked ? (
                      <span className="text-[10px] text-cyan-400 font-mono font-bold">☁️ Shrouded</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Floating Level Preview Modal Banner at Bottom when a Level is Selected */}
      {selectedTown && (
        <div className="w-full bg-[#1c0d06]/95 border-2 border-amber-500/80 rounded-2xl p-3 sm:p-4 shadow-2xl backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 z-30 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-3 text-left min-w-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#78350f] to-[#451a03] border-2 border-amber-400 flex items-center justify-center text-amber-200 shadow-lg shrink-0 p-1">
              <CityShapedNumber
                level={towns.findIndex((t) => t.id === selectedTown.id) + 1}
                isUnlocked={isLevelUnlocked(selectedTown, towns.findIndex((t) => t.id === selectedTown.id))}
                isConquered={isLevelConquered(selectedTown)}
                size={44}
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black border border-amber-400/30 uppercase">
                  City {towns.findIndex((t) => t.id === selectedTown.id) + 1} of 10
                </span>
                <span className="text-[10px] text-amber-400/90 font-bold uppercase">
                  Buy-in: ${selectedTown.buyIn} Chips
                </span>
                <span className="text-[10px] text-stone-400 font-mono">
                  Pop: {selectedTown.population}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-black text-amber-200 uppercase tracking-wide truncate">
                {selectedTown.name} — {selectedTown.bossName} ({selectedTown.difficulty})
              </h3>
              <p className="text-xs text-amber-100/80 italic truncate">
                "{selectedTown.bossQuote}"
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
            <button
              onClick={() => handlePlayLevel(selectedTown)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 hover:from-emerald-400 hover:to-teal-300 text-stone-950 font-black text-sm uppercase shadow-xl transition-all hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-2 border border-emerald-200"
            >
              <Play className="w-4 h-4 fill-stone-950" />
              <span>PLAY IN {selectedTown.name.toUpperCase()}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
