import React, { useState, useEffect } from 'react';
import { Player } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { Flame, Shield, ArrowUpCircle } from 'lucide-react';

interface BettingControlsProps {
  player: Player;
  currentHighBet: number;
  minRaise: number;
  potTotal: number;
  onAction: (action: 'fold' | 'check' | 'call' | 'raise' | 'all-in', amount: number) => void;
  disabled: boolean;
}

export const BettingControls: React.FC<BettingControlsProps> = ({
  player,
  currentHighBet,
  minRaise,
  potTotal,
  onAction,
  disabled,
}) => {
  const callAmount = Math.max(0, currentHighBet - player.currentBet);
  const canCheck = callAmount === 0;

  // Minimum and Maximum bet amounts
  const minBetAmount = Math.min(player.chips, Math.max(minRaise, currentHighBet + minRaise - player.currentBet));
  const maxBetAmount = player.chips;

  const [raiseAmount, setRaiseAmount] = useState<number>(minBetAmount);

  useEffect(() => {
    setRaiseAmount(minBetAmount);
  }, [minBetAmount]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRaiseAmount(Number(e.target.value));
  };

  const handleQuickBet = (fraction: number) => {
    sounds.playChipSound();
    let calculated = Math.floor(potTotal * fraction);
    calculated = Math.max(minBetAmount, Math.min(maxBetAmount, calculated));
    setRaiseAmount(calculated);
  };

  const formatAmount = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 10000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div
      id="betting-controls"
      className={`w-full max-w-2xl mx-auto bg-stone-950/95 backdrop-blur-md border-t sm:border border-amber-600/40 sm:rounded-2xl p-2.5 sm:p-4 shadow-2xl transition-all duration-200 ${
        disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Quick Bet Buttons & Raise Slider */}
      <div className="flex flex-col gap-2 mb-2.5">
        <div className="flex items-center justify-between gap-1 sm:gap-2">
          <button
            id="quick-min-btn"
            onClick={() => {
              sounds.playChipSound();
              setRaiseAmount(minBetAmount);
            }}
            disabled={disabled || player.chips <= minBetAmount}
            className="flex-1 py-1 px-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-[11px] sm:text-xs font-bold rounded-lg border border-stone-600/60 transition active:scale-95 disabled:opacity-50"
          >
            Min ({formatAmount(minBetAmount)})
          </button>
          <button
            id="quick-half-pot-btn"
            onClick={() => handleQuickBet(0.5)}
            disabled={disabled || player.chips <= minBetAmount}
            className="flex-1 py-1 px-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] sm:text-xs font-bold rounded-lg border border-stone-600/60 transition active:scale-95 disabled:opacity-50"
          >
            1/2 Pot
          </button>
          <button
            id="quick-pot-btn"
            onClick={() => handleQuickBet(1.0)}
            disabled={disabled || player.chips <= minBetAmount}
            className="flex-1 py-1 px-1.5 bg-stone-800 hover:bg-stone-700 text-amber-300 text-[11px] sm:text-xs font-bold rounded-lg border border-stone-600/60 transition active:scale-95 disabled:opacity-50"
          >
            Pot ({formatAmount(potTotal)})
          </button>
          <button
            id="quick-all-in-btn"
            onClick={() => {
              sounds.playAllIn();
              setRaiseAmount(maxBetAmount);
            }}
            disabled={disabled}
            className="flex-1 py-1 px-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px] sm:text-xs font-black rounded-lg border border-rose-600/50 transition active:scale-95 flex items-center justify-center gap-0.5"
          >
            <Flame className="w-3 h-3 text-rose-400" /> All-In
          </button>
        </div>

        {/* Raise Slider Control */}
        {player.chips > callAmount && (
          <div className="flex items-center gap-2 bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-700/50">
            <span className="text-[11px] font-bold text-stone-400 min-w-[55px]">
              Raise To:
            </span>
            <input
              type="range"
              min={minBetAmount}
              max={maxBetAmount}
              step={minRaise || 10}
              value={raiseAmount}
              onChange={handleSliderChange}
              disabled={disabled}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-stone-800 rounded-lg appearance-none"
            />
            <span className="text-xs sm:text-sm font-black text-amber-300 min-w-[70px] text-right">
              {formatAmount(raiseAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Main Action Buttons: FOLD | CHECK/CALL | RAISE */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {/* Fold Button */}
        <button
          id="poker-fold-btn"
          onClick={() => {
            sounds.playFold();
            onAction('fold', 0);
          }}
          disabled={disabled}
          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 bg-gradient-to-b from-rose-700 to-rose-900 hover:from-rose-600 hover:to-rose-800 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg border border-rose-500/50 transition-all active:scale-95 disabled:opacity-40"
        >
          <div className="flex items-center gap-1">
            <Shield className="w-4 h-4" />
            <span>FOLD</span>
          </div>
        </button>

        {/* Check / Call Button */}
        <button
          id="poker-call-btn"
          onClick={() => {
            if (canCheck) {
              sounds.playCheckKnock();
              onAction('check', 0);
            } else {
              sounds.playChipSound();
              const actualCall = Math.min(player.chips, callAmount);
              if (actualCall >= player.chips) {
                onAction('all-in', player.chips);
              } else {
                onAction('call', actualCall);
              }
            }
          }}
          disabled={disabled}
          className={`flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg border transition-all active:scale-95 disabled:opacity-40 ${
            canCheck
              ? 'bg-gradient-to-b from-emerald-700 to-emerald-900 hover:from-emerald-600 hover:to-emerald-800 border-emerald-500/50'
              : 'bg-gradient-to-b from-blue-700 to-blue-900 hover:from-blue-600 hover:to-blue-800 border-blue-500/50'
          }`}
        >
          <span>{canCheck ? 'CHECK' : `CALL ${formatAmount(Math.min(player.chips, callAmount))}`}</span>
        </button>

        {/* Raise Button */}
        <button
          id="poker-raise-btn"
          onClick={() => {
            if (raiseAmount >= player.chips) {
              sounds.playAllIn();
              onAction('all-in', player.chips);
            } else {
              sounds.playChipSound();
              onAction('raise', raiseAmount);
            }
          }}
          disabled={disabled || player.chips <= callAmount}
          className="flex flex-col items-center justify-center py-2.5 sm:py-3 px-2 bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-700 hover:from-amber-400 hover:to-yellow-600 text-stone-950 font-black text-xs sm:text-sm rounded-xl shadow-lg border border-yellow-300 transition-all active:scale-95 disabled:opacity-40"
        >
          <div className="flex items-center gap-1">
            <ArrowUpCircle className="w-4 h-4 text-stone-950" />
            <span>
              {raiseAmount >= player.chips ? 'ALL-IN' : `RAISE ${formatAmount(raiseAmount)}`}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
};
