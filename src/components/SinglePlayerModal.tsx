import React, { useState } from 'react';
import {
  X,
  Play,
  Star,
  User,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import {
  SALOON_3D_OPPONENTS,
  ThreeOpponent3DCanvas,
} from './ThreeOpponent3DCanvas';

interface SinglePlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartMatch: (config: { difficulty: string; opponent: string; targetScore: number }) => void;
  playerProfile: PlayerProfile;
}

export const SinglePlayerModal: React.FC<SinglePlayerModalProps> = ({
  isOpen,
  onClose,
  onStartMatch,
  playerProfile,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('BEGINNER');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('dealer');
  
  // Fixed 10 Points Target Score
  const targetScore = 10;

  const difficultyTiers = [
    { id: 'BEGINNER', name: 'Beginner', badge: 'Tier 1', stars: 3, multiplier: '1.0x' },
    { id: 'NOVICE', name: 'Novice', badge: 'Tier 2', stars: 2, multiplier: '1.2x' },
    { id: 'SEMI-PRO', name: 'Semi-Pro', badge: 'Tier 3', stars: 1, multiplier: '1.5x' },
    { id: 'PRO', name: 'Pro', badge: 'Tier 4', stars: 0, multiplier: '2.0x' },
    { id: 'WORLD CLASS', name: 'World Class', badge: 'Tier 5', stars: 0, multiplier: '3.0x' },
  ];

  const currentOpponent =
    SALOON_3D_OPPONENTS.find((o) => o.id === selectedOpponentId) || SALOON_3D_OPPONENTS[0];
  const currentTier =
    difficultyTiers.find((t) => t.id === selectedDifficulty) || difficultyTiers[0];

  if (!isOpen) return null;

  const handleStartGame = () => {
    sounds.playWin();
    onStartMatch({
      difficulty: selectedDifficulty,
      opponent: selectedOpponentId,
      targetScore: 10,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        style={{
          width: 'min(980px, calc(100vw - 32px))',
          height: 'min(760px, calc(100vh - 32px))',
        }}
        className="relative bg-[#0d1322] border-2 border-slate-800 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white flex flex-col overflow-hidden shrink-0"
      >
        {/* Top Header */}
        <div className="relative shrink-0 px-6 py-4 border-b border-amber-500/20 bg-gradient-to-b from-[#131c31] to-[#0c1220] flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-300 drop-shadow">
                Single Player Match
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                10 3D Opponent Characters • Fixed 10 Points Match
              </p>
            </div>
          </div>

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

        {/* 10 Opponent Characters Strip */}
        <div className="shrink-0 px-6 py-2.5 bg-[#080d17] border-b border-slate-800 z-10">
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
            {SALOON_3D_OPPONENTS.map((opp) => {
              const isSelected = selectedOpponentId === opp.id;
              return (
                <button
                  key={opp.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedOpponentId(opp.id);
                  }}
                  className={`p-1.5 rounded-xl border transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-md scale-105 z-10'
                      : 'bg-[#10182c] border-slate-800 hover:border-slate-600 opacity-80'
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-stone-900 border border-slate-700 flex items-center justify-center text-lg shadow-sm mb-0.5">
                    {opp.avatar}
                  </div>
                  <div className="font-bold text-[9px] text-white truncate w-full">{opp.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-12 gap-4">
          {/* 3D Model Character Preview (7 cols) */}
          <div className="md:col-span-7 bg-[#0c1326] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-black text-sm uppercase text-white tracking-wide">
                  {currentOpponent.name}
                </h3>
                <span className="text-[10px] font-black uppercase text-amber-400">
                  {currentOpponent.archetype}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
                3D Model
              </span>
            </div>

            <div className="w-full h-48 relative flex items-center justify-center my-2 bg-[#070b14] rounded-xl border border-slate-800 overflow-hidden">
              <ThreeOpponent3DCanvas character={currentOpponent} className="w-full h-full" />
            </div>

            <div className="text-xs text-stone-400 bg-[#070b14] p-2.5 rounded-xl border border-slate-800">
              <span className="text-amber-400 font-bold">Specialty:</span> {currentOpponent.specialty}
            </div>
          </div>

          {/* Difficulty & Match Rules (5 cols) */}
          <div className="md:col-span-5 bg-[#0c1326] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-2.5">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-2">
                Select Difficulty
              </span>
              <div className="flex flex-col gap-1.5">
                {difficultyTiers.map((tier) => {
                  const isSelected = selectedDifficulty === tier.id;
                  return (
                    <button
                      key={tier.id}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDifficulty(tier.id);
                      }}
                      className={`w-full px-3 py-2 rounded-xl border transition-all flex items-center justify-between text-left cursor-pointer ${
                        isSelected
                          ? 'bg-amber-400 text-stone-950 border-amber-300 font-black shadow-sm'
                          : 'bg-[#0f172a] text-stone-300 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <span className="text-xs font-bold">{tier.name}</span>
                      <span className={`text-[10px] font-bold ${isSelected ? 'text-stone-950' : 'text-amber-400'}`}>
                        {tier.multiplier}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 bg-[#070b14] border border-slate-800 rounded-xl text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-stone-400">Target Score:</span>
                <strong className="text-amber-300">10 Points to Win</strong>
              </div>
              <div className="flex justify-between text-stone-400 text-[11px]">
                <span>Partnership:</span>
                <span className="text-emerald-400 font-bold">North & South</span>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM ACTION BAR: START GAME BUTTON AT THE BOTTOM */}
        <div className="shrink-0 p-4 bg-[#070b14] border-t border-amber-500/20 flex items-center justify-between gap-4 z-10">
          <div className="text-xs text-stone-400 hidden sm:block">
            Playing vs <strong className="text-white">{currentOpponent.name}</strong> •{' '}
            <span className="text-amber-300 font-bold">{currentTier.name} (10 Pts)</span>
          </div>

          <button
            onClick={handleStartGame}
            className="flex-1 sm:flex-initial sm:px-10 py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 text-stone-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer ml-auto"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>START GAME (10 PTS)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
