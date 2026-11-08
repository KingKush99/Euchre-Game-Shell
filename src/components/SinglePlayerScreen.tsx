import React, { useState } from 'react';
import {
  Play,
  ArrowLeft,
  Star,
  User,
  Shield,
  Award,
  Sparkles,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import {
  SALOON_3D_OPPONENTS,
  ThreeOpponent3DCanvas,
  Opponent3DCharacterConfig,
} from './ThreeOpponent3DCanvas';

interface SinglePlayerScreenProps {
  playerProfile: PlayerProfile;
  onReturnToHome: () => void;
  onStartMatch: (config: { difficulty: string; opponent: string; targetScore: number }) => void;
}

export const SinglePlayerScreen: React.FC<SinglePlayerScreenProps> = ({
  playerProfile,
  onReturnToHome,
  onStartMatch,
}) => {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('BEGINNER');
  const [selectedOpponentId, setSelectedOpponentId] = useState<string>('dealer');
  
  // Fixed 10 Points Target Score (Standard Match)
  const targetScore = 10;

  const difficultyTiers = [
    {
      id: 'BEGINNER',
      name: 'Beginner',
      badge: 'Tier 1',
      stars: 3,
      multiplier: '1.0x',
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
    },
    {
      id: 'NOVICE',
      name: 'Novice',
      badge: 'Tier 2',
      stars: 2,
      multiplier: '1.2x',
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
    },
    {
      id: 'SEMI-PRO',
      name: 'Semi-Pro',
      badge: 'Tier 3',
      stars: 1,
      multiplier: '1.5x',
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
    },
    {
      id: 'PRO',
      name: 'Pro',
      badge: 'Tier 4',
      stars: 0,
      multiplier: '2.0x',
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
    },
    {
      id: 'WORLD CLASS',
      name: 'World Class',
      badge: 'Tier 5',
      stars: 0,
      multiplier: '3.0x',
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
    },
  ];

  const currentOpponent =
    SALOON_3D_OPPONENTS.find((o) => o.id === selectedOpponentId) || SALOON_3D_OPPONENTS[0];
  const currentTier =
    difficultyTiers.find((t) => t.id === selectedDifficulty) || difficultyTiers[0];

  const handleStartGame = () => {
    sounds.playWin();
    onStartMatch({
      difficulty: selectedDifficulty,
      opponent: selectedOpponentId,
      targetScore: 10,
    });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070b16] text-amber-50 flex flex-col select-none overflow-x-hidden pb-24">
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-amber-600/10 via-yellow-600/5 to-transparent pointer-events-none blur-3xl" />

      {/* TOP HEADER */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-3.5 border-b border-amber-500/20 bg-gradient-to-r from-stone-950 via-[#0e162d] to-stone-950 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sounds.playClick();
              onReturnToHome();
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 transition-all active:scale-95 shadow-md cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider">Back</span>
          </button>

          <div>
            <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-amber-300 drop-shadow">
              Single Player Match
            </h1>
            <p className="text-[11px] text-stone-400 font-medium">
              10 3D Opponent Characters • Fixed 10 Points Match
            </p>
          </div>
        </div>

        {/* Player Chips Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090e1b] border border-amber-500/30 shadow-md">
          <EuchreCoin size="sm" />
          <span className="font-black text-amber-300 text-xs">
            {playerProfile.chips.toLocaleString()}
          </span>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 py-4 flex-1 flex flex-col gap-4">
        
        {/* TOP SECTION: 10 3D OPPONENT CHARACTERS CAROUSEL */}
        <div className="bg-[#0b1224] border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> 10 3D Opponent Characters
            </span>
            <span className="text-xs text-stone-400">
              Selected: <strong className="text-amber-300">{currentOpponent.name}</strong> ({currentOpponent.archetype})
            </span>
          </div>

          {/* 10 Character Avatars Strip */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {SALOON_3D_OPPONENTS.map((opp) => {
              const isSelected = selectedOpponentId === opp.id;
              return (
                <button
                  key={opp.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedOpponentId(opp.id);
                  }}
                  className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.3)] scale-105 z-10'
                      : 'bg-[#10182c] border-slate-800 hover:border-slate-600 opacity-85'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-stone-900 border border-slate-700 flex items-center justify-center text-xl shadow-sm mb-1">
                    {opp.avatar}
                  </div>
                  <div className="font-bold text-[10px] text-white truncate w-full">{opp.name}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* MIDDLE SECTION: 3D CHARACTER SPOTLIGHT & DIFFICULTY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Left: Interactive 3D Model Character Preview (7 cols) */}
          <div className="md:col-span-7 bg-[#0c1326] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="text-lg">{currentOpponent.avatar}</span>
                <div>
                  <h3 className="font-black text-sm uppercase text-white tracking-wide">
                    {currentOpponent.name}
                  </h3>
                  <span className="text-[10px] font-black uppercase text-amber-400">
                    {currentOpponent.archetype}
                  </span>
                </div>
              </div>

              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-300 border border-amber-400/30">
                3D MODEL
              </span>
            </div>

            {/* Live Three.js 3D Character Canvas */}
            <div className="w-full h-56 relative flex items-center justify-center my-1 bg-[#070b14] rounded-xl border border-slate-800/60 overflow-hidden">
              <ThreeOpponent3DCanvas character={currentOpponent} className="w-full h-full" />
              
              <div className="absolute bottom-2 left-2 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-sm border border-slate-800 text-[10px] text-stone-300">
                {currentOpponent.tagline}
              </div>
            </div>

            <div className="text-xs text-stone-400 bg-[#070b14] p-2.5 rounded-xl border border-slate-800/80">
              <span className="text-amber-400 font-bold">Specialty:</span> {currentOpponent.specialty}
            </div>
          </div>

          {/* Right: Difficulty & Match Specs (5 cols) */}
          <div className="md:col-span-5 bg-[#0c1326] border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col justify-between gap-3">
            <div>
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 block mb-2">
                Select Difficulty Tier
              </span>

              {/* 5 Difficulty Tiers */}
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
                          ? 'bg-amber-400 text-stone-950 border-amber-300 font-black shadow-md scale-101'
                          : 'bg-[#0f172a] text-stone-300 border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold">{tier.name}</span>
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                            isSelected
                              ? 'bg-stone-950 text-amber-300 font-bold'
                              : 'bg-slate-800 text-stone-400'
                          }`}
                        >
                          {tier.badge}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-stone-950' : 'text-amber-400'}`}>
                          {tier.multiplier}
                        </span>
                        <div className="flex">
                          {[1, 2, 3].map((starIdx) => (
                            <Star
                              key={starIdx}
                              className={`w-3 h-3 ${
                                starIdx <= tier.stars
                                  ? isSelected
                                    ? 'text-stone-950 fill-stone-950'
                                    : 'text-amber-400 fill-amber-400'
                                  : 'text-stone-700'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match Rules Pill: Always 10 Points */}
            <div className="p-3 bg-[#070b14] border border-slate-800 rounded-xl space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Match Target:</span>
                <span className="font-black text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  10 Points to Win
                </span>
              </div>
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <span>Partnership:</span>
                <span className="text-emerald-400 font-bold">North & South</span>
              </div>
              <div className="flex items-center justify-between text-stone-400 text-[11px]">
                <span>Deck:</span>
                <span className="text-stone-300 font-mono">24 Cards (9-A)</span>
              </div>
            </div>
          </div>
        </div>

      </main>

      {/* FIXED BOTTOM ACTION BAR: START GAME BUTTON AT THE BOTTOM */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#070b14]/95 backdrop-blur-md border-t border-amber-500/30 p-3 sm:p-4 shadow-2xl">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-xs text-white">
                Match vs {currentOpponent.name} • {currentTier.name}
              </div>
              <div className="text-[11px] text-amber-400 font-medium">
                Target: 10 Points • Multiplier: {currentTier.multiplier}
              </div>
            </div>
          </div>

          <button
            onClick={handleStartGame}
            className="flex-1 sm:flex-initial sm:px-12 py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-stone-950 font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>START GAME (10 PTS)</span>
          </button>
        </div>
      </footer>
    </div>
  );
};
