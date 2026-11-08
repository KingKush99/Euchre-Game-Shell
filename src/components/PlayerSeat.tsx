import React from 'react';
import { Player, TownLocation } from '../types/poker';
import { CardView } from './CardView';
import { HATS_CATALOG } from '../data/gameData';

interface PlayerSeatProps {
  player: Player;
  isActive: boolean;
  isDealer: boolean;
  isSmallBlind: boolean;
  isBigBlind: boolean;
  isHuman: boolean;
  showCards: boolean;
  seatPosition?: 'bottom' | 'bottom-left' | 'top-left' | 'top-center' | 'top-right' | 'bottom-right';
  isDealingCards?: boolean;
}

// Custom sleeve colors per player seat for GOP3 realistic table look
const SLEEVE_COLORS = [
  'from-amber-700 to-yellow-800', // Player 0 (You - Brown Leather Jacket)
  'from-purple-800 to-indigo-900', // Player 1 (Purple Suit)
  'from-cyan-700 to-blue-800',     // Player 2 (Blue Denim)
  'from-stone-800 to-zinc-900',   // Player 3 (Black Tuxedo)
  'from-emerald-700 to-teal-800',  // Player 4 (Green Flannel)
  'from-rose-800 to-red-900',      // Player 5 (Crimson Velvet)
];

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isActive,
  isDealer,
  isSmallBlind,
  isBigBlind,
  isHuman,
  showCards,
  seatPosition = 'bottom',
  isDealingCards = false,
}) => {
  const hat = HATS_CATALOG.find((h) => h.id === player.hatId);
  const seatIdx = seatPosition === 'bottom' ? 0 : seatPosition === 'bottom-left' ? 1 : seatPosition === 'top-left' ? 2 : seatPosition === 'top-center' ? 3 : seatPosition === 'top-right' ? 4 : 5;
  const sleeveGradient = SLEEVE_COLORS[seatIdx % SLEEVE_COLORS.length];

  const formatChips = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 10000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${val.toLocaleString()}`;
  };

  const isTopSeat = seatPosition.includes('top');

  return (
    <div
      className={`relative flex flex-col items-center transition-all duration-300 ${
        player.isFolded ? 'opacity-40 grayscale-[40%]' : 'opacity-100'
      }`}
    >
      {/* Speech / Talk Bubble */}
      {player.talkBubble && (
        <div className="absolute -top-12 z-30 bg-amber-50 text-stone-900 text-xs font-semibold px-2.5 py-1.5 rounded-lg shadow-xl border border-amber-300/80 animate-bounce max-w-[160px] text-center whitespace-normal pointer-events-none">
          <span className="line-clamp-2">{player.talkBubble}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-amber-50 border-r border-b border-amber-300/80 rotate-45" />
        </div>
      )}

      {/* Winner Spotlight Banner */}
      {player.isWinner && (
        <div className="absolute -top-7 z-30 bg-gradient-to-r from-yellow-500 via-amber-300 to-yellow-500 text-stone-950 font-black text-[11px] px-2.5 py-0.5 rounded-full shadow-lg border border-yellow-200 animate-pulse flex items-center gap-1">
          <span>🏆 WINNER</span>
          {player.winAmount && <span>+{formatChips(player.winAmount)}</span>}
        </div>
      )}

      {/* Top-down Seated Player Hands Resting on Table Rail */}
      <div className={`absolute pointer-events-none ${isTopSeat ? '-bottom-5' : '-top-5'} flex justify-between w-24 sm:w-28 z-20`}>
        {/* Left Arm & Hand */}
        <div className="flex flex-col items-center">
          <div className={`w-3.5 h-6 rounded-full bg-gradient-to-b ${sleeveGradient} shadow-md rotate-12`} />
          <div className="w-3 h-3 -mt-1 rounded-full bg-amber-200 border border-amber-400 shadow-sm" />
        </div>

        {/* Right Arm & Hand */}
        <div className="flex flex-col items-center">
          <div className={`w-3.5 h-6 rounded-full bg-gradient-to-b ${sleeveGradient} shadow-md -rotate-12`} />
          <div className="w-3 h-3 -mt-1 rounded-full bg-amber-200 border border-amber-400 shadow-sm" />
        </div>
      </div>

      {/* Main Avatar & Stack Box (GOP3 Overhead Seated Avatar Badge) */}
      <div
        className={`relative flex flex-col items-center bg-stone-900/95 backdrop-blur-md rounded-2xl p-1.5 sm:p-2 border transition-all duration-300 shadow-2xl min-w-[95px] sm:min-w-[115px] z-10 ${
          isActive
            ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-stone-950 border-yellow-400 shadow-yellow-500/40 scale-105'
            : player.isWinner
            ? 'ring-2 ring-amber-400 border-amber-400'
            : 'border-amber-900/50 hover:border-amber-500/50'
        }`}
      >
        {/* Equipped Hat Icon / Crown Badge */}
        {hat && (
          <div
            className="absolute -top-4 -left-1 text-base sm:text-lg filter drop-shadow-md z-20"
            title={hat.name}
          >
            {hat.icon}
          </div>
        )}

        {/* Position Badges (Dealer Button "D", SB, BB) */}
        <div className="absolute -top-2.5 -right-2 flex gap-1 z-20">
          {isDealer && (
            <span className="w-5 h-5 rounded-full bg-amber-100 text-stone-950 font-black text-[11px] flex items-center justify-center border-2 border-stone-900 shadow-md animate-pulse">
              D
            </span>
          )}
          {isSmallBlind && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-stone-900 shadow">
              SB
            </span>
          )}
          {isBigBlind && (
            <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-black text-[9px] flex items-center justify-center border-2 border-stone-900 shadow">
              BB
            </span>
          )}
        </div>

        {/* Seated Avatar Circle */}
        <div className="relative">
          <div
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-xl sm:text-2xl shadow-inner border-2 ${
              isHuman
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-300'
                : 'bg-gradient-to-br from-stone-700 to-stone-800 border-amber-600/60'
            }`}
          >
            {player.avatar}
          </div>

          {/* Action Turn Ring Ping */}
          {isActive && (
            <div className="absolute -inset-1.5 rounded-full border-2 border-yellow-400 animate-ping pointer-events-none opacity-80" />
          )}
        </div>

        {/* Player Name */}
        <div className="text-[11px] sm:text-xs font-bold text-stone-200 truncate max-w-[85px] sm:max-w-[100px] mt-0.5">
          {player.name}
        </div>

        {/* Chip Stack Amount (GOP3 Style Stack Badge) */}
        <div className="text-[11px] sm:text-xs font-extrabold text-amber-300 flex items-center gap-0.5">
          <span>🟡</span>
          <span>{formatChips(player.chips)}</span>
        </div>

        {/* Action Status Pill */}
        {player.isAllIn ? (
          <span className="text-[9px] font-black uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded-full mt-0.5 shadow animate-pulse">
            ALL-IN
          </span>
        ) : player.isFolded ? (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-stone-800 text-stone-400 px-1.5 py-0.5 rounded-full mt-0.5">
            FOLDED
          </span>
        ) : player.lastAction ? (
          <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded-full mt-0.5">
            {player.lastAction} {player.lastActionAmount ? `$${player.lastActionAmount}` : ''}
          </span>
        ) : null}
      </div>

      {/* Hole Cards with Smooth Dealing & Fly Animation */}
      <div className={`flex gap-1 -mt-2.5 z-20 transition-all duration-300 ${isDealingCards ? 'scale-110 translate-y-1' : ''}`}>
        {player.holeCards.map((card, idx) => {
          const isWinningCard =
            player.handResult?.winningCards?.some(
              (w) => w.suit === card.suit && w.rank === card.rank
            ) && player.isWinner;

          return (
            <div
              key={idx}
              className={`transition-all duration-300 ${
                isDealingCards
                  ? 'animate-pulse opacity-90 -translate-y-2 rotate-2'
                  : ''
              }`}
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <CardView
                card={card}
                hidden={!showCards && !isHuman && !player.isWinner}
                isWinning={isWinningCard}
                size="sm"
              />
            </div>
          );
        })}
      </div>

      {/* Placed Bet Chip Stack on Felt (GOP3 Green Badge like in reference image) */}
      {player.currentBet > 0 && (
        <div className="absolute -bottom-7 z-30 bg-gradient-to-r from-emerald-600 to-teal-700 text-stone-950 font-black text-[10px] px-2.5 py-0.5 rounded-lg border border-emerald-300 shadow-xl flex items-center gap-1.5 animate-bounce">
          <span className="w-3 h-3 rounded-full bg-amber-400 border border-stone-900 shadow-inner flex items-center justify-center text-[7px]">
            🪙
          </span>
          <span className="text-white drop-shadow">{formatChips(player.currentBet)}</span>
        </div>
      )}
    </div>
  );
};
