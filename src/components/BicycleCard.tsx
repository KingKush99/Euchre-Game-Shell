import React from 'react';
import { Card } from '../types/poker';
import { getCustomAssets } from '../utils/customAssets';

interface BicycleCardProps {
  card?: Card; // If undefined, renders card back
  isFaceDown?: boolean;
  backColor?: 'blue' | 'red';
  isRightBower?: boolean;
  isLeftBower?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const BicycleCard: React.FC<BicycleCardProps> = ({
  card,
  isFaceDown = false,
  backColor = 'blue',
  isRightBower = false,
  isLeftBower = false,
  size = 'md',
  onClick,
  disabled = false,
  className = '',
}) => {
  // Dimensions (5:7 authentic playing card ratio)
  const sizeClasses = {
    sm: 'w-12 h-17',
    md: 'w-18 sm:w-20 h-25 sm:h-28',
    lg: 'w-26 sm:w-28 h-36 sm:h-39',
    xl: 'w-32 h-45',
  };

  const customAssets = getCustomAssets();

  // If face down or no card provided, render authentic Bicycle Rider Card Back
  if (isFaceDown || !card) {
    const cardBackSrc =
      customAssets.cardBackUrl || `/card_backs/card_back_${backColor}.svg`;

    return (
      <div
        onClick={!disabled ? onClick : undefined}
        className={`relative ${sizeClasses[size]} rounded-xl overflow-hidden bg-white border border-slate-300 shadow-2xl select-none transition-all duration-150 ${
          onClick && !disabled ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
        } ${className}`}
        style={{
          boxShadow: '0 8px 24px rgba(0,0,0,0.7)',
        }}
      >
        <img
          src={cardBackSrc}
          alt="Bicycle Card Back"
          className="w-full h-full object-cover select-none pointer-events-none"
        />
      </div>
    );
  }

  const rankStr =
    card.value === 5
      ? '5'
      : card.value === 9
      ? '9'
      : card.value === 10
      ? '10'
      : card.value === 11
      ? 'j'
      : card.value === 12
      ? 'q'
      : card.value === 13
      ? 'k'
      : card.value === 14
      ? 'a'
      : `${card.value}`;

  const cardFaceSrc =
    customAssets.cardFrontUrl || `/cards/${card.suit}-${rankStr}.svg`;

  return (
    <div
      onClick={!disabled ? onClick : undefined}
      className={`relative ${sizeClasses[size]} rounded-xl bg-white border shadow-2xl select-none transition-all duration-150 ${
        isRightBower
          ? 'border-amber-500 ring-3 ring-amber-400/90 shadow-[0_12px_30px_rgba(245,158,11,0.6)]'
          : isLeftBower
          ? 'border-purple-500 ring-3 ring-purple-400/90 shadow-[0_12px_30px_rgba(168,85,247,0.6)]'
          : 'border-slate-300'
      } ${
        onClick && !disabled
          ? 'cursor-pointer hover:-translate-y-4 hover:scale-105 active:scale-95'
          : ''
      } ${className}`}
    >
      <img
        src={cardFaceSrc}
        alt={`${card.suit} ${rankStr}`}
        className="w-full h-full object-contain rounded-xl p-0.5 select-none pointer-events-none"
      />

      {/* Bower Badges */}
      {isRightBower && (
        <span className="absolute top-1 right-1 text-[7px] sm:text-[9px] font-black bg-amber-500 text-stone-950 px-1.5 py-0.5 rounded shadow-lg border border-amber-300">
          R.BOWER
        </span>
      )}
      {isLeftBower && (
        <span className="absolute top-1 right-1 text-[7px] sm:text-[9px] font-black bg-purple-600 text-white px-1.5 py-0.5 rounded shadow-lg border border-purple-300">
          L.BOWER
        </span>
      )}
    </div>
  );
};
