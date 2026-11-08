import React from 'react';
import { Card } from '../types/poker';
import { estimateHandStrength } from '../utils/pokerEvaluator';
import { Sparkles, ShieldAlert, Award, Zap } from 'lucide-react';

interface HandStrengthHUDProps {
  holeCards: Card[];
  communityCards: Card[];
}

export const HandStrengthHUD: React.FC<HandStrengthHUDProps> = ({
  holeCards,
  communityCards,
}) => {
  if (!holeCards || holeCards.length < 2) return null;

  const { strengthScore, tier, handName } = estimateHandStrength(holeCards, communityCards);

  const getTierColor = () => {
    switch (tier) {
      case 'Monster':
        return {
          bg: 'from-amber-500 to-yellow-300',
          text: 'text-yellow-300',
          badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/50',
          icon: <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />,
        };
      case 'Strong':
        return {
          bg: 'from-emerald-500 to-teal-400',
          text: 'text-emerald-400',
          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
          icon: <Award className="w-3.5 h-3.5 text-emerald-300" />,
        };
      case 'Medium':
        return {
          bg: 'from-blue-500 to-cyan-400',
          text: 'text-blue-300',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-400/50',
          icon: <Zap className="w-3.5 h-3.5 text-blue-300" />,
        };
      case 'Weak':
      default:
        return {
          bg: 'from-zinc-500 to-stone-400',
          text: 'text-stone-300',
          badge: 'bg-stone-800/60 text-stone-400 border-stone-600/40',
          icon: <ShieldAlert className="w-3.5 h-3.5 text-stone-400" />,
        };
    }
  };

  const style = getTierColor();

  return (
    <div
      id="hand-strength-hud"
      className="bg-stone-950/85 backdrop-blur-md border border-amber-500/30 rounded-xl p-2.5 shadow-2xl text-xs sm:text-sm text-stone-200 flex flex-col gap-1.5 min-w-[200px] max-w-[320px]"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] uppercase tracking-wider text-amber-400/80 font-bold flex items-center gap-1">
          {style.icon} Current Hand
        </span>
        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded border ${style.badge}`}>
          {tier} ({strengthScore}%)
        </span>
      </div>

      <div className="font-semibold text-stone-100 truncate text-xs sm:text-sm tracking-wide">
        {handName}
      </div>

      {/* Progress meter bar */}
      <div className="w-full bg-stone-900 rounded-full h-2 overflow-hidden border border-stone-700/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${style.bg} transition-all duration-300`}
          style={{ width: `${strengthScore}%` }}
        />
      </div>
    </div>
  );
};
