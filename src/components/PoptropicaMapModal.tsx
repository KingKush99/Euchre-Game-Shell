import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { ALLOW_ALL_CITIES_UNRESTRICTED, TOWNS_DATA } from '../data/gameData';
import { X, Lock, CheckCircle2, Shield, Users, Building, Coins, Award, Compass, ArrowRight, Sparkles } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface PoptropicaMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onSelectTown: (town: TownLocation, mode: 'cash' | 'tournament' | 'boss_duel') => void;
}

export const PoptropicaMapModal: React.FC<PoptropicaMapModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onSelectTown,
}) => {
  const [selectedTown, setSelectedTown] = useState<TownLocation>(TOWNS_DATA[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/95 overflow-hidden animate-in fade-in duration-300">
      {/* Full Screen Parchment Scroll Backdrop matching Image 1 */}
      <div className="relative w-full h-full bg-[#e8d5b5] flex flex-col justify-between overflow-hidden shadow-2xl">
        {/* Top Scroll Roll Border */}
        <div className="w-full h-8 sm:h-12 bg-gradient-to-r from-[#8b5a2b] via-[#c69255] to-[#8b5a2b] border-b-2 border-[#5c3a1e] flex items-center justify-between px-6 shadow-md z-20">
          <div className="flex items-center gap-2 text-[#fff3e0] font-black text-sm uppercase tracking-widest">
            <Compass className="w-5 h-5 text-amber-300" />
            <span>Frontier Campaign Map</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#5c3a1e] hover:bg-[#3d2411] text-amber-200 flex items-center justify-center border border-amber-400/40 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Map Header Title Banner */}
        <div className="absolute top-12 sm:top-16 left-1/2 -translate-x-1/2 z-20">
          <div className="relative bg-gradient-to-r from-[#9c27b0] via-[#ab47bc] to-[#7b1fa2] text-white px-8 py-2 rounded-2xl border-4 border-[#ffeb3b] shadow-2xl flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
            <span className="font-black text-lg sm:text-2xl tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              MAP
            </span>
            <Sparkles className="w-6 h-6 text-yellow-300 animate-bounce" />
          </div>
        </div>

        {/* Map Canvas with 10 Island Cities matching Image 1 style */}
        <div className="relative flex-1 w-full h-full bg-[radial-gradient(#d4b886_1.5px,transparent_1.5px)] [background-size:24px_24px] overflow-auto p-6 flex items-center justify-center">
          <div className="relative w-[1200px] h-[700px] bg-[#dfca9d]/60 border-4 border-dashed border-[#a67c52] rounded-3xl p-8 shadow-inner flex items-center justify-center">
            
            {/* Dotted Trail Path connecting all 10 cities */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              <path
                d="M 144 154 L 336 126 L 540 168 L 780 140 L 984 196 L 1032 420 L 816 476 L 600 434 L 384 490 L 180 455"
                fill="none"
                stroke="#8c6239"
                strokeWidth="5"
                strokeDasharray="10 10"
                strokeLinecap="round"
              />
            </svg>

            {/* Render 10 City Island Nodes */}
            {TOWNS_DATA.map((town, index) => {
              const isUnlocked = ALLOW_ALL_CITIES_UNRESTRICTED || playerProfile.level >= town.requiredLevel || index === 0;
              const isSelected = selectedTown.id === town.id;
              const isConquered = playerProfile.conqueredTowns?.includes(town.id);

              return (
                <div
                  key={town.id}
                  style={{
                    left: `${town.mapCoords?.x || (index * 9 + 5)}%`,
                    top: `${town.mapCoords?.y || (index % 2 === 0 ? 25 : 65)}%`,
                  }}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTown(town);
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group transition-all duration-300 ${
                    isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                  }`}
                >
                  {/* Island Graphic Base Container */}
                  <div className="relative flex flex-col items-center">
                    {/* Glowing ring if selected */}
                    {isSelected && (
                      <div className="absolute -inset-4 bg-amber-400/40 rounded-full blur-md animate-pulse" />
                    )}

                    {/* Island Badge Base */}
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl p-2 border-4 flex flex-col items-center justify-center shadow-2xl transition ${
                        isUnlocked
                          ? isSelected
                            ? 'bg-amber-500 border-amber-300 text-stone-950 shadow-amber-500/50'
                            : 'bg-[#6d4c41] border-[#d7ccc8] text-amber-100'
                          : 'bg-stone-800 border-stone-600 text-stone-500'
                      }`}
                    >
                      {/* Icon / Level indicator */}
                      <span className="font-black text-xs uppercase tracking-wider">
                        LVL {town.requiredLevel}
                      </span>

                      <div className="my-1">
                        {!isUnlocked ? (
                          <Lock className="w-6 h-6 text-stone-400" />
                        ) : isConquered ? (
                          <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        ) : (
                          <Shield className="w-6 h-6 text-amber-300" />
                        )}
                      </div>

                      <span className="text-[10px] font-extrabold truncate max-w-full text-center">
                        {town.name}
                      </span>
                    </div>

                    {/* Floating Name Tag */}
                    <div className="mt-1 bg-[#3e2723] text-amber-200 border border-[#8d6e63] text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-md tracking-wider whitespace-nowrap">
                      {town.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Details Panel & Travel Button */}
        <div className="relative bg-[#3e2723] text-amber-100 p-4 border-t-4 border-[#5d4037] shadow-2xl z-20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#5d4037] border-2 border-amber-400/50 flex items-center justify-center text-amber-300">
              <Building className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-amber-300 uppercase tracking-wide">
                  {selectedTown.name} ({selectedTown.title})
                </h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-amber-400/30">
                  Buy-In: ${selectedTown.buyIn} Chips
                </span>
              </div>
              <p className="text-xs text-stone-300 max-w-2xl mt-0.5">
                {selectedTown.description}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-amber-200/80 mt-1">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> Pop: {selectedTown.population}
                </span>
                <span className="flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" /> Boss: {selectedTown.bossName}
                </span>
              </div>
            </div>
          </div>

          {/* Action Travel Button */}
          <button
            onClick={() => {
              sounds.playClick();
              onSelectTown(selectedTown, 'cash');
              onClose();
            }}
            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black uppercase tracking-wider rounded-2xl border-2 border-amber-300 shadow-xl flex items-center justify-center gap-2 transition active:scale-95"
          >
            <span>TRAVEL TO {selectedTown.name.toUpperCase()}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        {/* Bottom Scroll Roll Border */}
        <div className="w-full h-6 bg-gradient-to-r from-[#8b5a2b] via-[#c69255] to-[#8b5a2b] border-t-2 border-[#5c3a1e]" />
      </div>
    </div>
  );
};
