import React, { useState } from 'react';
import { X, ChevronUp } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import confetti from 'canvas-confetti';

interface SlotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  coins: number;
  onUpdateCoins: (newAmount: number) => void;
}

interface EuchreSymbol {
  id: string;
  label: string;
  name: string;
  color: string;
  isCardSuit?: boolean;
}

const EUCHRE_SYMBOLS: EuchreSymbol[] = [
  { id: 'spades', label: '♠', name: 'Spade', color: 'text-stone-950', isCardSuit: true },
  { id: 'hearts', label: '♥', name: 'Heart', color: 'text-rose-600', isCardSuit: true },
  { id: 'diamonds', label: '♦', name: 'Diamond', color: 'text-rose-600', isCardSuit: true },
  { id: 'clubs', label: '♣', name: 'Club', color: 'text-stone-950', isCardSuit: true },
  { id: 'right_bower', label: '👑', name: 'Right Bower', color: 'text-amber-600' },
  { id: 'left_bower', label: '🛡️', name: 'Left Bower', color: 'text-indigo-600' },
  { id: 'trump_ace', label: '🃏', name: 'Trump Ace', color: 'text-purple-600' },
  { id: 'trophy', label: '🏆', name: 'Euchre Cup', color: 'text-amber-500' },
  { id: 'gold_coin', label: '🪙', name: 'Euchre Coin', color: 'text-yellow-500' },
];

const BET_OPTIONS = [10, 25, 50, 100, 250];
const REEL_OPTIONS = [3, 4, 5, 6];

export const SlotsModal: React.FC<SlotsModalProps> = ({
  isOpen,
  onClose,
  coins,
  onUpdateCoins,
}) => {
  const [reelCount, setReelCount] = useState<number>(3);
  const [reels, setReels] = useState<EuchreSymbol[]>([
    EUCHRE_SYMBOLS[0],
    EUCHRE_SYMBOLS[1],
    EUCHRE_SYMBOLS[2],
  ]);
  const [bet, setBet] = useState<number>(10);
  const [autoSpin, setAutoSpin] = useState<boolean>(false);
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [leverPulled, setLeverPulled] = useState<boolean>(false);

  // Win / Loss state
  const [resultOutcome, setResultOutcome] = useState<{ type: 'win' | 'loss'; message: string } | null>(null);

  // Dropup toggles
  const [showBetsDropup, setShowBetsDropup] = useState<boolean>(false);
  const [showReelsDropup, setShowReelsDropup] = useState<boolean>(false);

  if (!isOpen) return null;

  const getRandomSymbol = () => {
    return EUCHRE_SYMBOLS[Math.floor(Math.random() * EUCHRE_SYMBOLS.length)];
  };

  const handleSpin = () => {
    if (coins < bet || isSpinning) return;
    sounds.playClick();
    setIsSpinning(true);
    setLeverPulled(true);
    setResultOutcome(null);
    setShowBetsDropup(false);
    setShowReelsDropup(false);

    // Deduct bet coin
    onUpdateCoins(coins - bet);

    // Reset lever after downward animation
    setTimeout(() => setLeverPulled(false), 500);

    // 3D Spinning reel animation
    let count = 0;
    const interval = setInterval(() => {
      count++;
      setReels(Array.from({ length: reelCount }, () => getRandomSymbol()));

      if (count > 14) {
        clearInterval(interval);
        // Final outcome
        const finalReels = Array.from({ length: reelCount }, () => getRandomSymbol());
        setReels(finalReels);
        setIsSpinning(false);

        // Check matching symbols
        const symbolCounts: Record<string, number> = {};
        finalReels.forEach((s) => {
          symbolCounts[s.id] = (symbolCounts[s.id] || 0) + 1;
        });

        const maxMatch = Math.max(...Object.values(symbolCounts));

        if (maxMatch === reelCount) {
          // Jackpot - all reels match!
          const payout = bet * (reelCount * 12);
          onUpdateCoins(coins - bet + payout);
          setResultOutcome({
            type: 'win',
            message: `JACKPOT! +${payout.toLocaleString()}`,
          });
          sounds.playWin();
          confetti({ particleCount: 90, spread: 80, origin: { x: 0.85, y: 0.75 } });
        } else if (maxMatch >= 2) {
          // Partial match
          const payout = bet * (maxMatch * 2);
          onUpdateCoins(coins - bet + payout);
          setResultOutcome({
            type: 'win',
            message: `WIN! +${payout.toLocaleString()}`,
          });
          sounds.playWin();
        } else {
          // Loss
          setResultOutcome({
            type: 'loss',
            message: '',
          });
        }

        setTimeout(() => {
          setResultOutcome(null);
        }, 1500);

        if (autoSpin && coins >= bet) {
          setTimeout(() => handleSpin(), 900);
        }
      }
    }, 70);
  };

  const getGridColsClass = () => {
    switch (reelCount) {
      case 6:
        return 'grid-cols-6';
      case 5:
        return 'grid-cols-5';
      case 4:
        return 'grid-cols-4';
      case 3:
      default:
        return 'grid-cols-3';
    }
  };

  return (
    <div
      id="mini-slots-modal"
      className="fixed bottom-20 right-4 z-50 w-[360px] sm:w-[390px] h-[360px] sm:h-[390px] aspect-square bg-[#0a1224] border-2 border-amber-400 rounded-3xl p-3.5 sm:p-4 shadow-[0_20px_60px_rgba(0,0,0,0.95)] text-white flex flex-col justify-between animate-in slide-in-from-bottom-5 duration-200 select-none shrink-0"
    >
      {/* TOP HEADER */}
      <div className="w-full flex items-center justify-between pb-2 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 border border-amber-100 shadow flex items-center justify-center font-black text-stone-950 text-xs shrink-0">
            🎰
          </div>
          <span className="text-xs font-black uppercase tracking-wider text-amber-300">
            Euchre Mini Slots
          </span>
        </div>

        {/* Euchre Coin Balance */}
        <div className="flex items-center gap-1.5 bg-[#0e1c3a] border border-amber-400/50 px-2.5 py-1 rounded-xl shadow-inner text-xs font-black text-amber-300">
          <EuchreCoin size="xs" />
          <span>{coins.toLocaleString()}</span>
        </div>

        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow transition active:scale-90 cursor-pointer"
          title="Close Slots"
        >
          <X className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>

      {/* MIDDLE SECTION: CASINO MACHINE CASING WITH DISTINCT REELS CONTAINER + 3D LEVER ON RIGHT + 3D CIRCULAR SPIN BUTTON */}
      <div className="relative w-full my-2.5 bg-gradient-to-b from-[#1a1005] via-[#2d1808] to-[#160c04] border-2 border-amber-500/80 rounded-2xl p-3 shadow-[inset_0_4px_12px_rgba(0,0,0,0.8)] flex flex-col items-center gap-3 overflow-hidden">
        
        {/* UPPER PART OF MIDDLE: REELS CONTAINER SECTION & 3D LEVER */}
        <div className="w-full flex items-center justify-between gap-3">
          
          {/* 1. DEDICATED REELS CONTAINER SECTION */}
          <div className="flex-1 bg-gradient-to-b from-[#050914] via-[#091024] to-[#040812] border-2 border-amber-400/70 rounded-xl p-2 shadow-[inset_0_4px_10px_rgba(0,0,0,0.95)] relative overflow-hidden">
            {/* Gloss reflection line across glass */}
            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none z-10" />

            {resultOutcome && !isSpinning ? (
              /* WIN OR LOSE DISPLAY BANNER */
              <div
                className={`w-full py-3 rounded-lg font-black text-center text-base sm:text-lg tracking-wider uppercase shadow-2xl animate-in zoom-in-95 duration-200 border-2 ${
                  resultOutcome.type === 'win'
                    ? 'bg-emerald-600 text-white border-amber-300 shadow-[0_0_25px_rgba(34,197,94,0.9)]'
                    : 'bg-rose-900 text-white border-rose-400 shadow-[0_0_25px_rgba(225,29,72,0.9)]'
                }`}
              >
                {resultOutcome.type === 'win' ? 'WIN!' : 'LOSE'}
                {resultOutcome.message && (
                  <div className="text-[10px] font-bold mt-0.5 text-amber-200">{resultOutcome.message}</div>
                )}
              </div>
            ) : (
              /* REEL STRIPS IN CONTAINER */
              <div className={`w-full grid ${getGridColsClass()} gap-1.5 items-center justify-center`}>
                {reels.map((symbol, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square w-full bg-gradient-to-b from-stone-100 via-white to-stone-200 rounded-lg border border-stone-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.2),0_2px_4px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center relative overflow-hidden transition-all ${
                      isSpinning ? 'animate-pulse scale-95' : ''
                    }`}
                  >
                    <span className={`${reelCount >= 7 ? 'text-sm sm:text-base' : reelCount >= 5 ? 'text-lg sm:text-xl' : 'text-2xl'} font-black drop-shadow ${symbol.color} leading-none`}>
                      {symbol.label}
                    </span>
                    <span className={`${reelCount >= 7 ? 'text-[5px]' : reelCount >= 5 ? 'text-[6px]' : 'text-[7px]'} font-black text-stone-600 uppercase tracking-tighter truncate max-w-full px-0.5 mt-0.5`}>
                      {symbol.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. 3D INTERACTIVE LEVER TO THE RIGHT OF REELS CONTAINER */}
          <div
            onClick={handleSpin}
            className="flex flex-col items-center shrink-0 select-none group [perspective:600px] cursor-grab active:cursor-grabbing"
            title="Pull Lever to Spin! (Grab & Pull)"
          >
            {/* Pivoting Lever Arm & Knob */}
            <div
              className={`flex flex-col items-center origin-bottom transition-all duration-500 ease-out cursor-grab active:cursor-grabbing ${
                leverPulled
                  ? '[transform:rotateX(75deg)_scaleY(0.35)_translateY(28px)] brightness-90'
                  : 'group-hover:-translate-y-1 group-hover:scale-105'
              }`}
            >
              {/* 3D Shiny Red Ball Knob with specular gloss */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 via-red-600 to-red-900 border-2 border-rose-200 shadow-[0_6px_12px_rgba(220,38,38,0.9),inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden">
                {/* Specular light highlight */}
                <div className="absolute top-1 left-1.5 w-2.5 h-2 rounded-full bg-white/70 blur-[0.5px]" />
              </div>

              {/* 3D Metallic Chrome Shaft */}
              <div className="w-2.5 h-11 bg-gradient-to-r from-stone-400 via-slate-100 to-stone-500 border-x border-stone-600 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)] cursor-grab active:cursor-grabbing" />
            </div>

            {/* Heavy Base Socket Pivot */}
            <div className="w-7 h-5 bg-gradient-to-b from-stone-700 via-stone-800 to-black rounded-b-xl border border-stone-600 shadow-[0_4px_8px_rgba(0,0,0,0.8)] -mt-1 cursor-grab active:cursor-grabbing flex items-center justify-center">
              <div className="w-3.5 h-1.5 bg-black rounded-full border border-stone-600/80 shadow-inner" />
            </div>
          </div>

        </div>

        {/* LOWER PART OF MIDDLE: CIRCULAR 3D SPIN BUTTON WITH AUTO SPIN CHECKBOX RIGHT NEXT TO IT */}
        <div className="flex items-center justify-center gap-4 w-full pt-1">
          <button
            onClick={handleSpin}
            disabled={isSpinning || coins < bet}
            className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-rose-500 via-red-600 to-red-800 border-4 border-amber-300 shadow-[0_8px_0_#7f1d1d,0_12px_22px_rgba(0,0,0,0.7),inset_0_3px_5px_rgba(255,255,255,0.8)] hover:brightness-110 active:translate-y-1.5 active:shadow-[0_2px_0_#7f1d1d,0_4px_10px_rgba(0,0,0,0.7)] flex flex-col items-center justify-center text-white font-black tracking-wider transition-all disabled:opacity-50 disabled:translate-y-0 cursor-pointer group shrink-0"
            title="Spin Reels"
          >
            <span className="text-sm sm:text-base font-black tracking-widest text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.9)] group-hover:scale-105 transition-transform">
              SPIN
            </span>
          </button>

          {/* Auto Spin Checkbox placed right next to Spin button */}
          <label className="flex items-center gap-1.5 cursor-pointer text-stone-200 hover:text-white select-none bg-black/60 px-3 py-1.5 rounded-2xl border border-amber-400/50 shadow-md">
            <input
              type="checkbox"
              checked={autoSpin}
              onChange={(e) => {
                sounds.playClick();
                setAutoSpin(e.target.checked);
              }}
              className="w-4 h-4 accent-red-600 rounded cursor-pointer"
            />
            <span className="text-xs font-black uppercase tracking-tight text-amber-300">
              Auto
            </span>
          </label>
        </div>

      </div>

      {/* BOTTOM ROW: BET CONTAINER ON LEFT, REELS DROP-UP ON RIGHT */}
      <div className="w-full flex items-center justify-between pt-1 border-t border-amber-500/20 gap-2 relative">
        
        {/* 1. LEFT: "Bet:" WITH CONTAINER AROUND JUST THE NUMBER */}
        <div className="relative flex items-center gap-1 shrink-0">
          <span className="text-xs font-black text-amber-300">Bet:</span>
          <button
            onClick={() => {
              sounds.playClick();
              setShowBetsDropup((prev) => !prev);
              setShowReelsDropup(false);
            }}
            className="flex items-center gap-1 bg-[#0e1c3a] border border-amber-400/80 px-2.5 py-1 rounded-xl text-amber-200 text-xs font-black shadow transition hover:border-amber-300 cursor-pointer"
          >
            <span>{bet}</span>
            <ChevronUp className="w-3 h-3 text-amber-400" />
          </button>

          {/* Bet dropup */}
          {showBetsDropup && (
            <div className="absolute left-6 bottom-full mb-1 w-20 bg-[#091326] border-2 border-amber-400 rounded-xl p-1 shadow-2xl z-30 flex flex-col gap-1">
              {BET_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    sounds.playClick();
                    setBet(opt);
                    setShowBetsDropup(false);
                  }}
                  className={`w-full py-1 px-2 rounded-lg text-xs font-black text-center transition cursor-pointer ${
                    bet === opt
                      ? 'bg-amber-400 text-stone-950 font-black shadow'
                      : 'text-stone-300 hover:bg-slate-800'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. RIGHT: "Reels:" WITH CONTAINER AND DROP-UP */}
        <div className="relative flex items-center gap-1 shrink-0">
          <span className="text-xs font-black text-amber-300">Reels:</span>
          <button
            onClick={() => {
              sounds.playClick();
              setShowReelsDropup((prev) => !prev);
              setShowBetsDropup(false);
            }}
            className="flex items-center gap-1 bg-[#0e1c3a] border border-amber-400/80 px-2.5 py-1 rounded-xl text-amber-200 text-xs font-black shadow transition hover:border-amber-300 cursor-pointer"
          >
            <span>{reelCount}</span>
            <ChevronUp className="w-3 h-3 text-amber-400" />
          </button>

          {/* Reels dropup */}
          {showReelsDropup && (
            <div className="absolute right-0 bottom-full mb-1 w-16 bg-[#091326] border-2 border-amber-400 rounded-xl p-1 shadow-2xl z-30 flex flex-col gap-1">
              {REEL_OPTIONS.map((num) => (
                <button
                  key={num}
                  onClick={() => {
                    sounds.playClick();
                    setReelCount(num);
                    setReels(Array.from({ length: num }, () => getRandomSymbol()));
                    setShowReelsDropup(false);
                  }}
                  className={`w-full py-1 px-2 rounded-lg text-xs font-black text-center transition cursor-pointer ${
                    reelCount === num
                      ? 'bg-amber-400 text-stone-950 font-black shadow'
                      : 'text-stone-300 hover:bg-slate-800'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
