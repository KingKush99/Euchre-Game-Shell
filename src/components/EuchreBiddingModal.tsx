import React, { useState } from 'react';
import { Card, Suit } from '../types/poker';
import { sounds } from '../utils/soundEffects';

interface EuchreBiddingModalProps {
  stage: 'bidding_r1' | 'bidding_r2';
  topKittyCard: Card | null;
  onPass: () => void;
  onOrderUp: (alone: boolean) => void;
  onCallSuit: (suit: Suit, alone: boolean) => void;
}

export const EuchreBiddingModal: React.FC<EuchreBiddingModalProps> = ({
  stage,
  topKittyCard,
  onPass,
  onOrderUp,
  onCallSuit,
}) => {
  const [isAlone, setIsAlone] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none pointer-events-auto">
      <div className="w-72 sm:w-80 bg-black/95 rounded-2xl border-2 border-stone-700/80 shadow-[0_20px_50px_rgba(0,0,0,0.9)] p-4 flex flex-col items-center gap-3 animate-in zoom-in-95 duration-150">
        {/* Title */}
        <h3 className="text-white font-bold text-sm tracking-wide">Select Trump</h3>

        {/* Pass Button (Iconic Blue Pill) */}
        <div className="w-full flex flex-col items-center gap-1">
          <button
            id="bidding-pass-btn"
            onClick={() => {
              sounds.playClick();
              onPass();
            }}
            className="w-full py-2 rounded-full bg-gradient-to-b from-[#5b9df2] via-[#3b82f6] to-[#2563eb] hover:from-[#60a5fa] hover:to-[#1d4ed8] text-white font-bold text-sm shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_4px_12px_rgba(37,99,235,0.4)] border border-blue-400/60 active:scale-95 transition cursor-pointer flex items-center justify-center"
          >
            Pass
          </button>
          <span className="text-[10px] text-stone-400 text-center font-medium opacity-80">
            If no suit is selected, it's an automatic pass
          </span>
        </div>

        {/* Horizontal Divider Line */}
        <div className="w-full h-[1px] bg-stone-700/80 my-0.5" />

        {/* Round 1: Order Up Trump Button */}
        {stage === 'bidding_r1' && topKittyCard && (
          <div className="w-full flex flex-col items-center gap-2">
            <button
              id="bidding-order-up-btn"
              onClick={() => {
                sounds.playWin();
                onOrderUp(isAlone);
              }}
              className="w-full py-2.5 rounded-full bg-gradient-to-b from-white via-stone-100 to-stone-200 hover:from-stone-50 hover:to-stone-300 text-stone-900 font-bold text-sm shadow-[inset_0_1px_2px_rgba(255,255,255,0.9),0_4px_12px_rgba(0,0,0,0.5)] border border-stone-400 active:scale-95 transition cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Order Up Trump</span>
              <span className="text-xs font-black uppercase text-amber-700">
                ({topKittyCard.suit})
              </span>
            </button>
          </div>
        )}

        {/* Round 2: 4 Oval Suit Selector Buttons */}
        {stage === 'bidding_r2' && topKittyCard && (
          <div className="w-full grid grid-cols-4 gap-2 px-1">
            {(
              [
                { suit: 'hearts', symbol: '♥', isRed: true },
                { suit: 'spades', symbol: '♠', isRed: false },
                { suit: 'clubs', symbol: '♣', isRed: false },
                { suit: 'diamonds', symbol: '♦', isRed: true },
              ] as { suit: Suit; symbol: string; isRed: boolean }[]
            ).map((s) => {
              const isTurnedDownSuit = s.suit === topKittyCard.suit;

              if (isTurnedDownSuit) {
                // Turned-down suit (greyed oval, disabled)
                return (
                  <div
                    key={s.suit}
                    className="h-10 rounded-full bg-stone-700/70 border border-stone-600 flex items-center justify-center shadow-inner opacity-40 cursor-not-allowed"
                    title={`Turned down (${s.suit})`}
                  >
                    <span className="text-xl font-serif text-stone-400">{s.symbol}</span>
                  </div>
                );
              }

              return (
                <button
                  key={s.suit}
                  id={`bidding-suit-${s.suit}`}
                  onClick={() => {
                    sounds.playWin();
                    onCallSuit(s.suit, isAlone);
                  }}
                  className="h-10 rounded-full bg-gradient-to-b from-white via-stone-100 to-stone-200 hover:from-stone-50 hover:to-white border border-stone-300 shadow-[inset_0_1px_1px_rgba(255,255,255,0.9),0_2px_8px_rgba(0,0,0,0.4)] flex items-center justify-center active:scale-90 transition cursor-pointer"
                >
                  <span
                    className={`text-2xl font-serif leading-none ${
                      s.isRed ? 'text-red-600' : 'text-stone-900'
                    }`}
                  >
                    {s.symbol}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Bottom Toggle Switch: Alone / Not Alone */}
        <div className="w-full flex items-center justify-center pt-1">
          <button
            id="bidding-alone-toggle"
            onClick={() => {
              sounds.playClick();
              setIsAlone((prev) => !prev);
            }}
            className="relative w-44 h-8 rounded-full bg-stone-200 border border-stone-300 shadow-inner p-0.5 flex items-center transition cursor-pointer"
          >
            {/* Sliding knob */}
            <div
              className={`absolute top-0.5 w-7 h-7 rounded-full bg-gradient-to-b from-white to-stone-300 shadow-md border border-stone-300 transition-all duration-200 ${
                isAlone ? 'right-0.5 bg-amber-400 border-amber-500' : 'left-0.5'
              }`}
            />
            {/* Label */}
            <span
              className={`w-full text-center text-xs font-bold transition-colors ${
                isAlone ? 'text-amber-900 pr-4' : 'text-stone-600 pl-4'
              }`}
            >
              {isAlone ? 'Go Alone 👑' : 'Not Alone'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
