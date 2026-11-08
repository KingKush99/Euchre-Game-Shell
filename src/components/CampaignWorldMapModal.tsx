import React, { useState } from 'react';
import { TownLocation, PlayerProfile } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import { ThreeWorldMap3D } from './ThreeWorldMap3D';
import { ThreeCandyCrush3DMap } from './ThreeCandyCrush3DMap';
import { CityShapedNumber } from './CityShapedNumber';
import {
  Compass,
  X,
  Lock,
  CheckCircle2,
  Building,
  ArrowRight,
  Star,
  MapPin,
  ShieldAlert,
  CloudFog,
  Sparkles,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface CampaignWorldMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  currentTownId: string;
  onTravelToTown: (town: TownLocation) => void;
}

export const CampaignWorldMapModal: React.FC<CampaignWorldMapModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  currentTownId,
  onTravelToTown,
}) => {
  const [selectedTown, setSelectedTown] = useState<TownLocation>(
    TOWNS_DATA.find((t) => t.id === currentTownId) || TOWNS_DATA[0]
  );
  // Default to 3D Saga Trail (star nodes & clouds) matching user specification
  const [mapViewMode, setMapViewMode] = useState<'saga_3d' | 'globe_3d' | 'parchment'>('saga_3d');

  if (!isOpen) return null;

  const conqueredCount = playerProfile.conqueredTowns?.length || 0;
  const isCurrentTownSelected = selectedTown.id === currentTownId;
  const isSelectedUnlocked =
    ALLOW_ALL_CITIES_UNRESTRICTED ||
    playerProfile.level >= selectedTown.requiredLevel ||
    selectedTown.id === TOWNS_DATA[0].id;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/90 backdrop-blur-md p-2 sm:p-4 overflow-hidden animate-in fade-in duration-300 select-none font-sans">
      {/* Wooden Desk Frame Shell */}
      <div className="relative w-full max-w-6xl h-[92vh] bg-[#1a0f07] border-4 border-[#783e16] rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-stone-100">
        
        {/* Top Header Bar */}
        <div className="relative shrink-0 h-14 bg-gradient-to-r from-[#5c3014] via-[#8c5025] to-[#5c3014] border-b-2 border-[#3d1e0a] flex items-center justify-between px-4 sm:px-6 shadow-md z-20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#3d1e0a] text-amber-300 flex items-center justify-center border border-amber-500/40 shadow-inner">
              <Compass className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-[#fef3c7] font-black text-sm sm:text-base uppercase tracking-widest drop-shadow flex items-center gap-2">
                <span>FRONTIER EXPEDITION MAP</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/40">
                  {conqueredCount} of 10 Conquered
                </span>
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="bg-[#381a07] p-1 rounded-xl flex items-center gap-1 border border-amber-500/30">
              <button
                onClick={() => {
                  sounds.playClick();
                  setMapViewMode('saga_3d');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer flex items-center gap-1.5 ${
                  mapViewMode === 'saga_3d'
                    ? 'bg-amber-400 text-stone-950 shadow'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>3D Star Trail</span>
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setMapViewMode('globe_3d');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                  mapViewMode === 'globe_3d'
                    ? 'bg-amber-400 text-stone-950 shadow'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                3D Globe
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setMapViewMode('parchment');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition cursor-pointer ${
                  mapViewMode === 'parchment'
                    ? 'bg-amber-400 text-stone-950 shadow'
                    : 'text-amber-200/80 hover:text-white'
                }`}
              >
                Parchment
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-[#3d1e0a] hover:bg-[#251206] text-amber-200 flex items-center justify-center border border-amber-400/40 transition active:scale-95 shadow cursor-pointer"
              title="Close Map"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Map Canvas Area */}
        <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center">
          {mapViewMode === 'saga_3d' ? (
            <ThreeCandyCrush3DMap
              playerProfile={playerProfile}
              onSelectTown={(town) => setSelectedTown(town)}
              onTravelToTown={(town) => {
                onClose();
                onTravelToTown(town);
              }}
            />
          ) : mapViewMode === 'globe_3d' ? (
            <ThreeWorldMap3D
              playerProfile={playerProfile}
              currentTownId={currentTownId}
              selectedTown={selectedTown}
              onSelectTown={(town) => setSelectedTown(town)}
              onTravelToTown={onTravelToTown}
            />
          ) : (
            /* ========================================================================= */
            /* AUTHENTIC ANTIQUE WOODEN DESK & PARCHMENT MAP */
            /* ========================================================================= */
            <div className="relative w-full h-full bg-[#150d06] overflow-auto p-4 sm:p-8 flex items-center justify-center">
              {/* Antique Survey Desk Tabletop Lighting */}
              <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_rgba(165,102,46,0.22)_0%,_rgba(10,5,2,0.88)_80%)]" />
              
              {/* Corner Brass Screws & Leather Frame Accents */}
              <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-amber-500/50 rounded-tl pointer-events-none" />
              <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-amber-500/50 rounded-tr pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-amber-500/50 rounded-bl pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-amber-500/50 rounded-br pointer-events-none" />

              {/* The Antique Parchment Map Sheet */}
              <div className="relative w-[1060px] h-[520px] bg-gradient-to-br from-[#f8eedb] via-[#ecd8b4] to-[#dfc498] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.85),inset_0_0_100px_rgba(146,84,33,0.3)] border-4 border-[#784319] p-6 text-stone-900 overflow-hidden shrink-0">
                
                {/* Decorative Inner Hand-Drawn Cartographic Border */}
                <div className="absolute inset-2 border-2 border-[#8c5222]/60 rounded-xl pointer-events-none" />
                <div className="absolute inset-3 border border-dashed border-[#8c5222]/40 rounded-lg pointer-events-none" />

                {/* Vintage Corner Flourishes */}
                <span className="absolute top-4 left-5 text-[#8c5222]/60 text-lg font-serif select-none pointer-events-none">⌜</span>
                <span className="absolute top-4 right-5 text-[#8c5222]/60 text-lg font-serif select-none pointer-events-none">⌝</span>
                <span className="absolute bottom-4 left-5 text-[#8c5222]/60 text-lg font-serif select-none pointer-events-none">⌞</span>
                <span className="absolute bottom-4 right-5 text-[#8c5222]/60 text-lg font-serif select-none pointer-events-none">⌟</span>

                {/* Vintage Map Header Title Banner */}
                <div className="absolute top-5 left-1/2 -translate-x-1/2 text-center pointer-events-none select-none z-0">
                  <div className="text-[11px] font-black uppercase tracking-[0.3em] text-[#783e16]">
                    ★ OFFICIAL SURVEY OF THE TEXAS FRONTIER ★
                  </div>
                  <div className="text-[9px] font-serif italic text-[#8c5828] -mt-0.5">
                    Map of the 10 Historic Card Sanctuaries & Boss Arenas
                  </div>
                </div>

                {/* Vintage Compass Rose (Top Right) */}
                <div className="absolute top-6 right-8 w-20 h-20 opacity-80 pointer-events-none select-none">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#783e16]">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                    <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="1" />
                    {/* 8-point compass star */}
                    <polygon points="50,6 54,42 50,50 46,42" fill="#783e16" />
                    <polygon points="50,6 50,50 46,42" fill="#9a531e" />
                    <polygon points="50,94 54,58 50,50 46,58" fill="#783e16" />
                    <polygon points="6,50 42,46 50,50 42,54" fill="#783e16" />
                    <polygon points="94,50 58,46 50,50 58,54" fill="#783e16" />
                    <polygon points="18,18 45,43 50,50 43,45" fill="#a8602b" />
                    <polygon points="82,18 55,43 50,50 57,45" fill="#a8602b" />
                    <polygon points="18,82 45,57 50,50 43,55" fill="#a8602b" />
                    <polygon points="82,82 55,57 50,50 57,55" fill="#a8602b" />
                    <text x="50" y="16" fontSize="10" fontWeight="bold" textAnchor="middle" fill="#5c2b0c">N</text>
                    <text x="50" y="92" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#5c2b0c">S</text>
                    <text x="90" y="53" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#5c2b0c">E</text>
                    <text x="11" y="53" fontSize="9" fontWeight="bold" textAnchor="middle" fill="#5c2b0c">W</text>
                  </svg>
                </div>

                {/* Subtle Cartographic Rivers & Sea Shorelines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-25">
                  <path
                    d="M 50 480 Q 250 460, 420 490 T 780 470 T 1020 500"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="3"
                  />
                  <path
                    d="M 80 500 Q 300 480, 520 505 T 900 485"
                    fill="none"
                    stroke="#1e3a8a"
                    strokeWidth="1.5"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Frontier Expedition Route Trail (Graceful hand-drawn dashed path) */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <path
                    d="M 95 240 Q 160 350, 225 295 T 355 210 T 480 340 T 605 235 T 730 355 T 845 220 T 960 320"
                    fill="none"
                    stroke="#783e16"
                    strokeWidth="4"
                    strokeDasharray="10 8"
                    strokeLinecap="round"
                    className="opacity-75"
                  />
                </svg>

                {/* 10 Clean, Simplified Town Medallion Pins */}
                {TOWNS_DATA.map((town, index) => {
                  const isUnlocked = ALLOW_ALL_CITIES_UNRESTRICTED || playerProfile.level >= town.requiredLevel || index === 0;
                  const isSelected = selectedTown.id === town.id;
                  const isConquered = playerProfile.conqueredTowns?.includes(town.id);
                  const isCurrent = currentTownId === town.id;

                  // Coordinated graceful positions along the trail
                  const posX = town.mapCoords?.x || (index * 9.2 + 8);
                  const posY = town.mapCoords?.y || (index % 2 === 0 ? 32 : 62);

                  return (
                    <div
                      key={town.id}
                      style={{
                        left: `${posX}%`,
                        top: `${posY}%`,
                      }}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedTown(town);
                      }}
                      className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group transition-transform duration-200 ${
                        isSelected ? 'scale-115 z-30' : 'hover:scale-110'
                      }`}
                    >
                      {/* Selection Glow Halo */}
                      {isSelected && (
                        <div className="absolute -inset-3 bg-amber-500/40 rounded-full blur-md animate-pulse pointer-events-none" />
                      )}

                      <div className="relative flex flex-col items-center">
                        {/* Shrouded Fog of War Cloud Bank for Locked Cities */}
                        {!isUnlocked && (
                          <div className="absolute -inset-4 z-20 pointer-events-none flex items-center justify-center">
                            <div className="absolute inset-0 bg-stone-900/60 rounded-full blur-md" />
                            <CloudFog className="w-8 h-8 text-slate-300 animate-pulse drop-shadow" />
                          </div>
                        )}

                        {/* Circular Wax-Seal Medallion Pin with Sculpted City Number */}
                        <div
                          className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_6px_14px_rgba(0,0,0,0.45)] border-3 transition-all ${
                            isCurrent
                              ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-yellow-200 text-stone-950 ring-4 ring-amber-400/50 shadow-amber-600/50'
                              : isConquered
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-800 border-emerald-300 text-white shadow-emerald-800/40'
                              : isUnlocked
                              ? 'bg-gradient-to-br from-[#8c5025] to-[#5c3014] border-[#d4a373] text-amber-100'
                              : 'bg-gradient-to-br from-stone-800 to-slate-950 border-stone-600 text-stone-400'
                          }`}
                        >
                          <CityShapedNumber
                            level={index + 1}
                            isUnlocked={isUnlocked}
                            isConquered={isConquered}
                            size={38}
                          />
                        </div>

                        {/* Current Location Badge */}
                        {isCurrent && (
                          <div className="absolute -top-3 bg-emerald-600 text-white font-black text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-emerald-300 shadow-md z-30">
                            YOU ARE HERE
                          </div>
                        )}

                        {/* Clean Parchment Ribbon Banner */}
                        <div
                          className={`mt-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider shadow-md border transition whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#4a240c] text-amber-200 border-amber-400 ring-2 ring-amber-400/50'
                              : 'bg-[#f4e6cc] text-[#5c2b0c] border-[#8c5222]/50'
                          }`}
                        >
                          <span>{town.name}</span>
                          <span className="ml-1 text-[9px] opacity-75 font-normal">
                            (${town.smallBlind}/${town.bigBlind})
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Destination Details & Fast-Travel Action Card */}
        <div className="shrink-0 bg-[#241308] text-amber-100 p-4 sm:p-5 border-t-4 border-[#4a240c] shadow-2xl z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div
              className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center shrink-0 shadow-inner ${
                isSelectedUnlocked
                  ? 'bg-[#4a240c] border-amber-400/60 text-amber-300'
                  : 'bg-stone-800 border-stone-600 text-stone-400'
              }`}
            >
              {isCurrentTownSelected ? (
                <Star className="w-7 h-7 text-amber-400 fill-amber-400" />
              ) : isSelectedUnlocked ? (
                <Building className="w-7 h-7 text-amber-300" />
              ) : (
                <Lock className="w-7 h-7 text-stone-400" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-black text-amber-300 uppercase tracking-wide">
                  {selectedTown.name}
                </h3>
                <span className="text-stone-300 text-xs font-medium">({selectedTown.title})</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  {selectedTown.difficulty}
                </span>
                {playerProfile.conqueredTowns?.includes(selectedTown.id) && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-400/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Conquered
                  </span>
                )}
              </div>

              <p className="text-xs text-amber-100/80 font-medium truncate mt-0.5">
                {selectedTown.description}
              </p>

              <div className="text-[11px] text-amber-400 font-bold mt-1 flex items-center gap-4 flex-wrap">
                <span>Stakes: ${selectedTown.smallBlind}/${selectedTown.bigBlind}</span>
                <span>Boss: {selectedTown.bossName}</span>
                <span>Tournament Prize: ${selectedTown.tournamentPrize.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Action Travel Button */}
          <div className="flex items-center gap-3 shrink-0">
            {isCurrentTownSelected ? (
              <div className="px-5 py-2.5 bg-stone-800 border border-stone-600 text-stone-400 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>CURRENT LOCATION</span>
              </div>
            ) : !isSelectedUnlocked ? (
              <div className="px-5 py-2.5 bg-rose-950/60 border border-rose-600/40 text-rose-300 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>LOCKED • REACH LEVEL {selectedTown.requiredLevel}</span>
              </div>
            ) : (
              <button
                onClick={() => {
                  sounds.playClick();
                  onTravelToTown(selectedTown);
                  onClose();
                }}
                className="px-6 py-3 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-xl flex items-center gap-2 transition transform active:scale-95 cursor-pointer"
              >
                <span>TRAVEL TO {selectedTown.name.toUpperCase()}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
