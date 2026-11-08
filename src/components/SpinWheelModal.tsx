import React, { useState, useRef } from 'react';
import confetti from 'canvas-confetti';
import { sounds } from '../utils/soundEffects';
import { Sparkles, X, Gift, Coins } from 'lucide-react';

interface SpinWheelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReward: (chips: number, gold: number, xp: number, itemName?: string) => void;
}

interface WheelSegment {
  label: string;
  chips: number;
  gold: number;
  xp: number;
  color: string;
  isJackpot?: boolean;
}

const SEGMENTS: WheelSegment[] = [
  { label: '$1,000 Chips', chips: 1000, gold: 0, xp: 50, color: 'bg-amber-600' },
  { label: '5 Gold Bars', chips: 0, gold: 5, xp: 100, color: 'bg-yellow-500' },
  { label: '$2,500 Chips', chips: 2500, gold: 0, xp: 80, color: 'bg-emerald-600' },
  { label: '$500 Chips', chips: 500, gold: 0, xp: 30, color: 'bg-stone-700' },
  { label: 'JACKPOT $25,000!', chips: 25000, gold: 20, xp: 500, color: 'bg-rose-600', isJackpot: true },
  { label: '$5,000 Chips', chips: 5000, gold: 2, xp: 150, color: 'bg-blue-600' },
  { label: '10 Gold Bars', chips: 0, gold: 10, xp: 200, color: 'bg-amber-500' },
  { label: '$10,000 Chips', chips: 10000, gold: 5, xp: 300, color: 'bg-purple-600' },
];

export const SpinWheelModal: React.FC<SpinWheelModalProps> = ({
  isOpen,
  onClose,
  onReward,
}) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [prizeWon, setPrizeWon] = useState<WheelSegment | null>(null);

  if (!isOpen) return null;

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setPrizeWon(null);

    // Play initial sound
    sounds.playClick();

    // Select random winning segment
    const segmentCount = SEGMENTS.length;
    const segmentAngle = 360 / segmentCount;
    const winningIndex = Math.floor(Math.random() * segmentCount);

    // Calculate rotation with 5-8 full spins
    const extraSpins = (5 + Math.floor(Math.random() * 3)) * 360;
    // Align with arrow at the top (subtract target angle + center of segment)
    const targetAngle = 360 - winningIndex * segmentAngle - segmentAngle / 2;
    const finalRotation = rotation + extraSpins + (targetAngle - (rotation % 360));

    setRotation(finalRotation);

    // Sound ticking effect
    let tickCount = 0;
    const tickInterval = setInterval(() => {
      sounds.playWheelTick();
      tickCount++;
      if (tickCount > 25) clearInterval(tickInterval);
    }, 150);

    setTimeout(() => {
      clearInterval(tickInterval);
      const won = SEGMENTS[winningIndex];
      setPrizeWon(won);
      setIsSpinning(false);

      if (won.isJackpot) {
        confetti({ particleCount: 200, spread: 90, origin: { y: 0.5 } });
      } else {
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } });
      }

      sounds.playWin();
      onReward(won.chips, won.gold, won.xp, won.label);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="lucky-spin-modal"
        className="relative w-full max-w-md bg-stone-950 border-2 border-amber-500/60 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center overflow-hidden"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSpinning}
          className="absolute top-4 right-4 p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-1 text-amber-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
          <h2 className="text-2xl font-serif font-black tracking-wide text-amber-200">
            LUCKY JACKPOT WHEEL
          </h2>
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <p className="text-xs text-amber-400/80 mb-6 font-medium">
          Spin every hour for free chips, bullion, and lucky poker prizes!
        </p>

        {/* Wheel Graphic Container */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 my-2 flex items-center justify-center">
          {/* Top Indicator Arrow */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 w-6 h-8 flex items-center justify-center">
            <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[18px] border-t-amber-400 filter drop-shadow" />
          </div>

          {/* Rotating Wheel Disk */}
          <div
            className="w-full h-full rounded-full border-4 border-amber-400 shadow-2xl overflow-hidden relative"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: isSpinning ? 'transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1)' : 'none',
            }}
          >
            {SEGMENTS.map((seg, idx) => {
              const angle = (360 / SEGMENTS.length) * idx;
              return (
                <div
                  key={idx}
                  className={`absolute top-0 left-0 w-full h-full ${seg.color} flex items-start justify-center pt-2`}
                  style={{
                    clipPath: 'polygon(50% 50%, 15% 0%, 85% 0%)',
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: '50% 50%',
                  }}
                >
                  <span
                    className={`text-[10px] sm:text-xs font-black tracking-tight ${
                      seg.isJackpot ? 'text-yellow-200 font-serif animate-pulse' : 'text-white'
                    }`}
                  >
                    {seg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Center Hub Button */}
          <button
            id="spin-center-btn"
            onClick={handleSpin}
            disabled={isSpinning}
            className="absolute z-20 w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-yellow-600 border-4 border-yellow-200 shadow-2xl flex flex-col items-center justify-center text-stone-950 font-black text-xs transition active:scale-95 disabled:opacity-80"
          >
            <span className="text-sm font-serif">SPIN</span>
          </button>
        </div>

        {/* Prize Notification Card */}
        {prizeWon && (
          <div className="mt-4 bg-gradient-to-r from-amber-900/90 to-yellow-900/90 border border-amber-400 p-3 rounded-2xl animate-bounce flex items-center gap-3">
            <div className="text-2xl">🎉</div>
            <div className="text-left">
              <div className="text-xs font-bold text-amber-200 uppercase">You Won!</div>
              <div className="text-sm font-black text-yellow-300">{prizeWon.label}</div>
            </div>
          </div>
        )}

        {/* Bottom Action */}
        <button
          id="wheel-spin-now-btn"
          onClick={handleSpin}
          disabled={isSpinning}
          className="mt-6 w-full py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm rounded-2xl shadow-xl border border-yellow-200 transition active:scale-95 disabled:opacity-50"
        >
          {isSpinning ? 'SPINNING THE WHEEL...' : 'SPIN FOR FREE!'}
        </button>
      </div>
    </div>
  );
};
