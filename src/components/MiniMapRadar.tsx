import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import { sounds } from '../utils/soundEffects';
import { MapPin, Compass, ChevronDown, ChevronUp, Lock, Star, Check } from 'lucide-react';

interface MiniMapRadarProps {
  playerProfile: PlayerProfile;
  currentTownId: string;
  onSelectTown: (town: TownLocation) => void;
}

export const MiniMapRadar: React.FC<MiniMapRadarProps> = ({
  playerProfile,
  currentTownId,
  onSelectTown,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [hoveredTown, setHoveredTown] = useState<TownLocation | null>(null);

  const towns = TOWNS_DATA.map((t) => ({
    ...t,
    unlocked: ALLOW_ALL_CITIES_UNRESTRICTED || playerProfile.level >= t.requiredLevel,
    conquered: playerProfile.conqueredTowns.includes(t.id),
  }));

  const conqueredCount = playerProfile.conqueredTowns.length;

  return (
    <div
      id="texas-mini-map-radar"
      className="fixed bottom-3 right-3 z-30 select-none flex flex-col items-end transition-all duration-300"
    >
      {/* Mini-map Container Card */}
      <div className="relative bg-stone-950/95 border-2 border-amber-500/50 rounded-2xl shadow-[0_4px_25px_rgba(0,0,0,0.8)] backdrop-blur-md overflow-hidden flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-2 py-1 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border-b border-amber-600/30 gap-1.5">
          <div className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-amber-400 animate-spin" style={{ animationDuration: '20s' }} />
            <span className="font-serif font-black text-[9px] text-amber-200 tracking-wider">
              TEXAS RADAR ({conqueredCount}/10)
            </span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              setIsExpanded(!isExpanded);
            }}
            className="p-0.5 text-stone-400 hover:text-amber-300 rounded transition"
            title={isExpanded ? 'Minimize mini-map' : 'Expand mini-map'}
          >
            {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Radar Map Canvas View - Half size square dimension (w-44 sm:w-48 h-36 sm:h-40) */}
        {isExpanded && (
          <div className="relative w-44 sm:w-48 h-36 sm:h-40 bg-[#1c1813] overflow-hidden border-t border-stone-800">
            {/* Painted Map Parchment Texture overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:12px_12px] opacity-15 pointer-events-none" />

            {/* Vintage Texas SVG Silhouette Outline */}
            <svg
              className="absolute inset-0 w-full h-full text-amber-950/60 pointer-events-none stroke-amber-700/40 stroke-1 fill-amber-950/20"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              {/* Stylized Texas polygon boundary */}
              <polygon points="20,12 36,12 36,32 64,32 66,45 78,60 84,72 68,82 54,92 46,78 30,68 12,56 12,48 20,44" />
            </svg>

            {/* River Lines (Rio Grande & Red River stylized) */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none stroke-cyan-800/40 stroke-[0.8] fill-none"
              viewBox="0 0 100 100"
            >
              <path d="M 12 56 Q 30 68 46 78 T 68 82 T 84 72" />
              <path d="M 36 32 Q 50 34 66 45" />
            </svg>

            {/* Town Pins on Mini Map */}
            {towns.map((town) => {
              const coords = town.mapCoords || { x: 50, y: 50 };
              const isCurrent = town.id === currentTownId;

              return (
                <button
                  key={town.id}
                  onClick={() => {
                    if (town.unlocked) {
                      sounds.playClick();
                      onSelectTown(town);
                    }
                  }}
                  onMouseEnter={() => setHoveredTown(town)}
                  onMouseLeave={() => setHoveredTown(null)}
                  style={{
                    left: `${coords.x}%`,
                    top: `${coords.y}%`,
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                    town.unlocked ? 'cursor-pointer hover:scale-125' : 'cursor-not-allowed opacity-50'
                  }`}
                >
                  {isCurrent ? (
                    <div className="relative flex items-center justify-center">
                      <span className="absolute -inset-1 rounded-full bg-amber-400 animate-ping opacity-75" />
                      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 border-2 border-white flex items-center justify-center shadow-lg text-[10px]">
                        🤠
                      </div>
                    </div>
                  ) : town.conquered ? (
                    <div className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-200 flex items-center justify-center shadow text-[8px] text-stone-950 font-black">
                      ★
                    </div>
                  ) : town.unlocked ? (
                    <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 border border-emerald-300 shadow flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    </div>
                  ) : (
                    <div className="w-3 h-3 rounded-full bg-stone-700 border border-stone-500 flex items-center justify-center text-[7px] text-stone-400">
                      🔒
                    </div>
                  )}
                </button>
              );
            })}

            {/* Hovered Town Floating Tooltip */}
            {hoveredTown && (
              <div className="absolute bottom-1 left-1 right-1 bg-stone-950/95 border border-amber-500/60 rounded-xl p-1.5 shadow-xl flex items-center justify-between text-[10px] pointer-events-none animate-fadeIn">
                <div className="flex items-center gap-1.5">
                  <span>{hoveredTown.bannerImage}</span>
                  <div>
                    <div className="font-bold text-amber-200 leading-none">{hoveredTown.name}</div>
                    <div className="text-stone-400 text-[9px]">
                      {hoveredTown.unlocked ? `Buy-in $${hoveredTown.buyIn.toLocaleString()}` : `Unlocks Lvl ${hoveredTown.requiredLevel}`}
                    </div>
                  </div>
                </div>
                <div>
                  {hoveredTown.conquered ? (
                    <span className="text-yellow-400 font-bold">★ Conquered</span>
                  ) : hoveredTown.unlocked ? (
                    <span className="text-emerald-400 font-bold">● Ready</span>
                  ) : (
                    <span className="text-stone-400">🔒 Locked</span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
