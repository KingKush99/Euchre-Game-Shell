import React, { useState } from 'react';
import { X, Dices, Sparkles, Trophy, RotateCcw, Lock } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { PlayerProfile } from '../types/poker';
import { ThreeDailyDiceArena } from './ThreeDailyDiceArena';

interface DailyDiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (tokenReward: number) => void;
  playerProfile?: PlayerProfile;
}

// Visual 2D red die face with white dots matching the 3D red dice
const RedDieFace: React.FC<{ value: number; size?: string }> = ({ value, size = 'w-14 h-14' }) => {
  const pipPositions: Record<number, number[][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]],
  };

  const pips = pipPositions[value] || pipPositions[1];

  return (
    <div
      className={`relative ${size} rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-800 border-2 border-red-300 shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_8px_rgba(0,0,0,0.5)] shrink-0 select-none`}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
        {pips.map(([cx, cy], idx) => (
          <g key={idx}>
            {/* Subtle shadow under white dot */}
            <circle cx={cx} cy={cy + 1.5} r={8.5} fill="rgba(0,0,0,0.3)" />
            {/* Crisp white dot */}
            <circle cx={cx} cy={cy} r={8.5} fill="#ffffff" />
            {/* Specular highlight */}
            <circle cx={cx - 2} cy={cy - 2} r={3} fill="rgba(255,255,255,0.9)" />
          </g>
        ))}
      </svg>
    </div>
  );
};

export const DailyDiceModal: React.FC<DailyDiceModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
  playerProfile,
}) => {
  const [dice, setDice] = useState<number[]>([1, 2, 3, 4, 5]);
  const [held, setHeld] = useState<boolean[]>([false, false, false, false, false]);
  const [rollsLeft, setRollsLeft] = useState<number>(3);
  const [isRolling, setIsRolling] = useState<boolean>(false);
  const [claimed, setClaimed] = useState<boolean>(false);
  const [rollTriggerCount, setRollTriggerCount] = useState<number>(0);

  if (!isOpen) return null;

  const handleRoll = () => {
    if (rollsLeft <= 0 || isRolling || claimed) return;

    sounds.playClick();
    setIsRolling(true);

    // Pre-determine new values for unheld dice and update immediately for 3D trajectory
    const nextValues = dice.map((val, idx) => (held[idx] ? val : Math.floor(Math.random() * 6) + 1));
    setDice(nextValues);
    setRollTriggerCount((prev) => prev + 1);

    // Wait for the single 3D character throw animation & dice flight to land cleanly
    setTimeout(() => {
      setIsRolling(false);
      setRollsLeft((prev) => prev - 1);
      sounds.playWin();
    }, 1500);
  };

  const toggleHold = (idx: number) => {
    if (rollsLeft === 3 || rollsLeft === 0 || isRolling || claimed) return;
    sounds.playClick();
    setHeld((prev) => {
      const next = [...prev];
      next[idx] = !next[idx];
      return next;
    });
  };

  // Evaluate Yahtzee score
  const calculateYahtzeeScore = (vals: number[]): { name: string; score: number } => {
    const counts: { [num: number]: number } = {};
    vals.forEach((v) => (counts[v] = (counts[v] || 0) + 1));
    const countValues = Object.values(counts);

    // 5 of a kind (Yahtzee)
    if (countValues.includes(5)) {
      return { name: 'YAHTZEE 5 OF A KIND!! 🔥', score: 50 };
    }
    // 4 of a kind
    if (countValues.includes(4)) {
      return { name: '4 OF A KIND! ⭐', score: 35 };
    }
    // Full house
    if (countValues.includes(3) && countValues.includes(2)) {
      return { name: 'FULL HOUSE! 🏠', score: 25 };
    }
    // 3 of a kind
    if (countValues.includes(3)) {
      return { name: '3 OF A KIND! ✨', score: 20 };
    }
    // Straight check
    const sorted = Array.from(new Set(vals)).sort((a, b) => a - b);
    if (
      sorted.join('').includes('12345') ||
      sorted.join('').includes('23456')
    ) {
      return { name: 'LARGE STRAIGHT! 🎲', score: 40 };
    }
    if (
      sorted.join('').includes('1234') ||
      sorted.join('').includes('2345') ||
      sorted.join('').includes('3456')
    ) {
      return { name: 'SMALL STRAIGHT! 🎲', score: 30 };
    }
    // Sum
    const sum = vals.reduce((a, b) => a + b, 0);
    return { name: 'HIGH ROLL SUM', score: sum };
  };

  const { name: combinationName, score: baseScore } = calculateYahtzeeScore(dice);
  const tokenReward = baseScore * 2; // Doubled for tokens as requested!

  const handleClaim = () => {
    sounds.playWin();
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setClaimed(true);
    onClaimReward(tokenReward);
    setTimeout(() => onClose(), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#090e1c] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white flex flex-col items-center overflow-hidden max-h-[95vh] overflow-y-auto">
        {/* Top Header */}
        <div className="w-full flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
              DAILY REWARD SALOON • 3D YAHTZEE
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2 font-serif">
              <Dices className="w-6 h-6 text-red-500 animate-pulse" />
              Daily 3D Saloon Dice
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* 3D Real-Time Dice Arena with Profile Character throwing into wooden box */}
        <div className="w-full my-3">
          <ThreeDailyDiceArena
            playerProfile={playerProfile}
            diceValues={dice}
            held={held}
            isRolling={isRolling}
            rollTriggerCount={rollTriggerCount}
            onToggleHold={toggleHold}
          />
        </div>

        {/* 5 Interactive Synchronized Red Dice Cards with White Dots */}
        <div className="w-full grid grid-cols-5 gap-2 sm:gap-3 my-2">
          {dice.map((val, idx) => {
            const isHeld = held[idx];
            return (
              <button
                key={idx}
                onClick={() => toggleHold(idx)}
                disabled={rollsLeft === 3 || rollsLeft === 0 || isRolling || claimed}
                className={`py-2 px-1.5 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                  isHeld
                    ? 'border-emerald-400 bg-emerald-950/80 shadow-[0_0_20px_rgba(52,211,153,0.4)] scale-105'
                    : 'border-slate-800 bg-[#0d1528] hover:border-amber-400/80 hover:bg-slate-900'
                } disabled:opacity-85`}
              >
                {/* Visual Red Die Face with White Dots */}
                <RedDieFace value={val} size="w-11 h-11 sm:w-13 sm:h-13" />

                <span
                  className={`text-[9px] font-black uppercase tracking-wider mt-1.5 flex items-center gap-0.5 ${
                    isHeld ? 'text-emerald-300' : 'text-stone-400'
                  }`}
                >
                  {isHeld ? (
                    <>
                      <Lock className="w-2.5 h-2.5" />
                      <span>HELD</span>
                    </>
                  ) : (
                    <span>HOLD</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* Combination Score Box */}
        <div className="w-full bg-[#050812] border border-slate-800/90 rounded-2xl p-3.5 text-center my-2 shadow-inner">
          <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">
            CURRENT COMBINATION
          </span>
          <h3 className="text-lg sm:text-xl font-black text-amber-400 my-0.5">{combinationName}</h3>
          <div className="flex items-center justify-center gap-4 text-xs font-bold text-stone-300 mt-1">
            <span>
              Base Yahtzee Score: <strong className="text-white">{baseScore} pts</strong>
            </span>
            <span>
              Reward (2x): <strong className="text-emerald-400 text-sm">+{tokenReward} Tokens</strong>
            </span>
          </div>
        </div>

        {/* Roll Controls */}
        <div className="w-full mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="text-xs font-bold text-stone-400">
            Rolls Remaining: <strong className="text-white text-sm">{rollsLeft} / 3</strong>
          </div>

          {rollsLeft > 0 && !claimed ? (
            <button
              onClick={handleRoll}
              disabled={isRolling}
              className="px-6 py-2.5 bg-gradient-to-r from-red-600 via-red-500 to-amber-500 hover:from-red-500 hover:to-amber-400 text-stone-950 font-black text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(220,38,38,0.4)] transition active:scale-95 flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <RotateCcw className={`w-4 h-4 ${isRolling ? 'animate-spin' : ''}`} />
              <span>
                {isRolling
                  ? 'THROWING INTO BOX...'
                  : rollsLeft === 3
                  ? 'THROW FIRST ROLL'
                  : 'RE-THROW UNHELD'}
              </span>
            </button>
          ) : (
            <button
              onClick={handleClaim}
              disabled={claimed}
              className="px-7 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-xs sm:text-sm rounded-2xl shadow-[0_4px_20px_rgba(52,211,153,0.4)] transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Trophy className="w-5 h-5" />
              <span>{claimed ? 'CLAIMED! ✓' : `CLAIM +${tokenReward} TOKENS`}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
