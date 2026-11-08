import React, { useState } from 'react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { X, Sparkles, Gift, Star, Award, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TopLeftGovernorBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onClaimReward: (chips: number, gold: number, xp: number) => void;
}

export const TopLeftGovernorBonusModal: React.FC<TopLeftGovernorBonusModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onClaimReward,
}) => {
  const [claimed, setClaimed] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    sounds.playWin();
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
    setClaimed(true);
    const chipsReward = 1500 + playerProfile.level * 500;
    const goldReward = 5;
    const xpReward = 150;
    onClaimReward(chipsReward, goldReward, xpReward);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="governor-decree-modal"
        className="relative w-full max-w-lg bg-stone-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-[0_0_40px_rgba(217,119,6,0.3)] flex flex-col gap-4 text-stone-100 overflow-hidden"
      >
        {/* Painted canvas background overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/30 via-stone-950 to-stone-950 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between border-b border-amber-900/50 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center text-2xl shadow-lg animate-bounce">
              ⭐
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-amber-200 tracking-wide">
                GOVERNOR'S SECRET CHEST
              </h2>
              <p className="text-xs text-amber-400/80">
                Frontier Bounty & Daily Governor Decree
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chest Display Box */}
        <div className="relative z-10 p-5 rounded-2xl bg-gradient-to-b from-amber-950/70 via-stone-900 to-stone-950 border border-amber-500/40 text-center flex flex-col items-center gap-3 shadow-inner">
          <div className="relative">
            <span className="text-6xl drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">
              {claimed ? '🎁' : '🏆'}
            </span>
            <Sparkles className="w-6 h-6 text-yellow-300 absolute -top-1 -right-2 animate-spin" />
          </div>

          <div>
            <h3 className="font-serif font-black text-lg text-amber-100">
              {claimed ? 'Bounty Collected!' : "Governor's Daily Supply Drop"}
            </h3>
            <p className="text-xs text-stone-300 max-w-sm mt-1">
              {claimed
                ? 'Your bonus chips, gold bullion, and frontier XP have been added to your bankroll!'
                : 'As an esteemed card sharp on the Texas Trail, you are entitled to daily royal supplies!'}
            </p>
          </div>

          {/* Reward Badges */}
          <div className="grid grid-cols-3 gap-2 w-full my-1">
            <div className="bg-stone-900/90 border border-amber-500/30 p-2.5 rounded-xl flex flex-col items-center">
              <span className="text-base">🟡</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold">Chips</span>
              <span className="text-sm font-black text-yellow-300">
                +${(1500 + playerProfile.level * 500).toLocaleString()}
              </span>
            </div>

            <div className="bg-stone-900/90 border border-yellow-500/30 p-2.5 rounded-xl flex flex-col items-center">
              <span className="text-base">🪙</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold">Gold</span>
              <span className="text-sm font-black text-yellow-400">+5 Gold</span>
            </div>

            <div className="bg-stone-900/90 border border-purple-500/30 p-2.5 rounded-xl flex flex-col items-center">
              <span className="text-base">⭐</span>
              <span className="text-[10px] text-stone-400 uppercase font-bold">XP</span>
              <span className="text-sm font-black text-purple-300">+150 XP</span>
            </div>
          </div>

          {!claimed ? (
            <button
              onClick={handleClaim}
              className="w-full mt-2 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-serif font-black text-sm rounded-xl shadow-xl border-2 border-yellow-200 transition active:scale-95 flex items-center justify-center gap-2"
            >
              <Gift className="w-5 h-5 text-stone-950" />
              <span>CLAIM GOVERNOR BOUNTY</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="w-full mt-2 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-600 transition"
            >
              Back to Table & Trail
            </button>
          )}
        </div>

        {/* Frontier Quests List */}
        <div className="relative z-10 flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" /> Active Frontier Objectives
          </span>

          <div className="space-y-1.5">
            <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🤠</span>
                <div>
                  <div className="font-bold text-stone-200">Win 3 Showdown Hands</div>
                  <div className="text-[10px] text-stone-400">Play in any Texas saloon</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                {playerProfile.stats.handsWon} / 3
              </span>
            </div>

            <div className="p-2.5 bg-stone-900/80 border border-stone-800 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="text-base">🏆</span>
                <div>
                  <div className="font-bold text-stone-200">Defeat a Saloon Boss</div>
                  <div className="text-[10px] text-stone-400">Challenge in Heads-Up Duel</div>
                </div>
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                {playerProfile.stats.bossesDefeated} / 1
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
