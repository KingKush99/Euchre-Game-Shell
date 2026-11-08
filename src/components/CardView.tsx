import React from 'react';
import { Card, Rank, Suit } from '../types/poker';

interface CardViewProps {
  card?: Card;
  hidden?: boolean;
  isWinning?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  glow?: boolean;
}

// Precise SVG Paths for the 4 Suits
export const SUIT_PATHS: Record<string, string> = {
  // Club ♣: Clean 3 circular lobes with triangular flared base
  '♣': 'M 50 20 C 43 20 37 26 37 33 C 37 36 38 39 40 41 C 32 38 23 43 21 51 C 19 59 23 67 31 70 C 35 71 39 70 43 67 C 42 73 41 78 37 84 L 63 84 C 59 78 58 73 57 67 C 61 70 65 71 69 70 C 77 67 81 59 79 51 C 77 43 68 38 60 41 C 62 39 63 36 63 33 C 63 26 57 20 50 20 Z',
  'clubs': 'M 50 20 C 43 20 37 26 37 33 C 37 36 38 39 40 41 C 32 38 23 43 21 51 C 19 59 23 67 31 70 C 35 71 39 70 43 67 C 42 73 41 78 37 84 L 63 84 C 59 78 58 73 57 67 C 61 70 65 71 69 70 C 77 67 81 59 79 51 C 77 43 68 38 60 41 C 62 39 63 36 63 33 C 63 26 57 20 50 20 Z',
  // Spade ♠: Sharp tip, inverted heart curves, triangular flared base
  '♠': 'M 50 16 C 45 27 22 48 22 64 C 22 74 30 80 40 78 C 44 77 47 73 49 69 C 48 74 46 79 40 84 L 60 84 C 54 79 52 74 51 69 C 53 73 56 77 60 78 C 70 80 78 74 78 64 C 78 48 55 27 50 16 Z',
  'spades': 'M 50 16 C 45 27 22 48 22 64 C 22 74 30 80 40 78 C 44 77 47 73 49 69 C 48 74 46 79 40 84 L 60 84 C 54 79 52 74 51 69 C 53 73 56 77 60 78 C 70 80 78 74 78 64 C 78 48 55 27 50 16 Z',
  // Heart ♥: Symmetrical classic curves with sharp base
  '♥': 'M 50 24 C 50 24 38 12 24 12 C 11 12 4 22 4 35 C 4 55 35 75 50 88 C 65 75 96 55 96 35 C 96 22 89 12 76 12 C 62 12 50 24 50 24 Z',
  'hearts': 'M 50 24 C 50 24 38 12 24 12 C 11 12 4 22 4 35 C 4 55 35 75 50 88 C 65 75 96 55 96 35 C 96 22 89 12 76 12 C 62 12 50 24 50 24 Z',
  // Diamond ♦: Clean geometric 4-point rhombus
  '♦': 'M 50 12 L 84 50 L 50 88 L 16 50 Z',
  'diamonds': 'M 50 12 L 84 50 L 50 88 L 16 50 Z',
};

// Render a single vector suit pip
export const Pip: React.FC<{
  suit: Suit;
  color: string;
  x: number;
  y: number;
  size?: number;
  rotate180?: boolean;
}> = ({ suit, color, x, y, size = 26, rotate180 = false }) => {
  const path = SUIT_PATHS[suit] || SUIT_PATHS['♣'];
  return (
    <g
      transform={`translate(${x}, ${y}) ${
        rotate180 ? 'rotate(180)' : ''
      } translate(${-size / 2}, ${-size / 2})`}
    >
      <svg width={size} height={size} viewBox="0 0 100 100" fill={color}>
        <path d={path} />
      </svg>
    </g>
  );
};

// Generates the exact pip placements matching standard French / English deck cards
const renderCardPips = (rank: Rank, suit: Suit, color: string) => {
  const pips: React.ReactNode[] = [];
  const s = 28; // standard pip size
  const sLarge = 48; // Ace large center pip

  switch (rank) {
    case 'A':
      pips.push(<Pip key="ace" suit={suit} color={color} x={100} y={140} size={sLarge} />);
      break;
    case '2':
      pips.push(<Pip key="2-top" suit={suit} color={color} x={100} y={68} size={s} />);
      pips.push(<Pip key="2-bot" suit={suit} color={color} x={100} y={212} size={s} rotate180 />);
      break;
    case '3':
      pips.push(<Pip key="3-top" suit={suit} color={color} x={100} y={68} size={s} />);
      pips.push(<Pip key="3-mid" suit={suit} color={color} x={100} y={140} size={s} />);
      pips.push(<Pip key="3-bot" suit={suit} color={color} x={100} y={212} size={s} rotate180 />);
      break;
    case '4':
      pips.push(<Pip key="4-tl" suit={suit} color={color} x={60} y={68} size={s} />);
      pips.push(<Pip key="4-tr" suit={suit} color={color} x={140} y={68} size={s} />);
      pips.push(<Pip key="4-bl" suit={suit} color={color} x={60} y={212} size={s} rotate180 />);
      pips.push(<Pip key="4-br" suit={suit} color={color} x={140} y={212} size={s} rotate180 />);
      break;
    case '5':
      pips.push(<Pip key="5-tl" suit={suit} color={color} x={60} y={68} size={s} />);
      pips.push(<Pip key="5-tr" suit={suit} color={color} x={140} y={68} size={s} />);
      pips.push(<Pip key="5-mid" suit={suit} color={color} x={100} y={140} size={s} />);
      pips.push(<Pip key="5-bl" suit={suit} color={color} x={60} y={212} size={s} rotate180 />);
      pips.push(<Pip key="5-br" suit={suit} color={color} x={140} y={212} size={s} rotate180 />);
      break;
    case '6':
      pips.push(<Pip key="6-tl" suit={suit} color={color} x={60} y={68} size={s} />);
      pips.push(<Pip key="6-tr" suit={suit} color={color} x={140} y={68} size={s} />);
      pips.push(<Pip key="6-ml" suit={suit} color={color} x={60} y={140} size={s} />);
      pips.push(<Pip key="6-mr" suit={suit} color={color} x={140} y={140} size={s} />);
      pips.push(<Pip key="6-bl" suit={suit} color={color} x={60} y={212} size={s} rotate180 />);
      pips.push(<Pip key="6-br" suit={suit} color={color} x={140} y={212} size={s} rotate180 />);
      break;
    case '7':
      pips.push(<Pip key="7-tl" suit={suit} color={color} x={60} y={68} size={s} />);
      pips.push(<Pip key="7-tr" suit={suit} color={color} x={140} y={68} size={s} />);
      pips.push(<Pip key="7-cu" suit={suit} color={color} x={100} y={104} size={s} />);
      pips.push(<Pip key="7-ml" suit={suit} color={color} x={60} y={140} size={s} />);
      pips.push(<Pip key="7-mr" suit={suit} color={color} x={140} y={140} size={s} />);
      pips.push(<Pip key="7-bl" suit={suit} color={color} x={60} y={212} size={s} rotate180 />);
      pips.push(<Pip key="7-br" suit={suit} color={color} x={140} y={212} size={s} rotate180 />);
      break;
    case '8':
      pips.push(<Pip key="8-tl" suit={suit} color={color} x={60} y={68} size={s} />);
      pips.push(<Pip key="8-tr" suit={suit} color={color} x={140} y={68} size={s} />);
      pips.push(<Pip key="8-cu" suit={suit} color={color} x={100} y={104} size={s} />);
      pips.push(<Pip key="8-ml" suit={suit} color={color} x={60} y={140} size={s} />);
      pips.push(<Pip key="8-mr" suit={suit} color={color} x={140} y={140} size={s} />);
      pips.push(<Pip key="8-cl" suit={suit} color={color} x={100} y={176} size={s} rotate180 />);
      pips.push(<Pip key="8-bl" suit={suit} color={color} x={60} y={212} size={s} rotate180 />);
      pips.push(<Pip key="8-br" suit={suit} color={color} x={140} y={212} size={s} rotate180 />);
      break;
    case '9':
      // 4 on left, 4 on right, 1 in center (Matches image 8 exactly)
      pips.push(<Pip key="9-l1" suit={suit} color={color} x={60} y={62} size={s} />);
      pips.push(<Pip key="9-r1" suit={suit} color={color} x={140} y={62} size={s} />);
      pips.push(<Pip key="9-l2" suit={suit} color={color} x={60} y={114} size={s} />);
      pips.push(<Pip key="9-r2" suit={suit} color={color} x={140} y={114} size={s} />);
      pips.push(<Pip key="9-mid" suit={suit} color={color} x={100} y={140} size={s} />);
      pips.push(<Pip key="9-l3" suit={suit} color={color} x={60} y={166} size={s} rotate180 />);
      pips.push(<Pip key="9-r3" suit={suit} color={color} x={140} y={166} size={s} rotate180 />);
      pips.push(<Pip key="9-l4" suit={suit} color={color} x={60} y={218} size={s} rotate180 />);
      pips.push(<Pip key="9-r4" suit={suit} color={color} x={140} y={218} size={s} rotate180 />);
      break;
    case '10':
      // 4 on left, 4 on right, 2 in center (Matches image 9 exactly)
      pips.push(<Pip key="10-l1" suit={suit} color={color} x={60} y={62} size={s} />);
      pips.push(<Pip key="10-r1" suit={suit} color={color} x={140} y={62} size={s} />);
      pips.push(<Pip key="10-cu" suit={suit} color={color} x={100} y={88} size={s} />);
      pips.push(<Pip key="10-l2" suit={suit} color={color} x={60} y={114} size={s} />);
      pips.push(<Pip key="10-r2" suit={suit} color={color} x={140} y={114} size={s} />);
      pips.push(<Pip key="10-l3" suit={suit} color={color} x={60} y={166} size={s} rotate180 />);
      pips.push(<Pip key="10-r3" suit={suit} color={color} x={140} y={166} size={s} rotate180 />);
      pips.push(<Pip key="10-cl" suit={suit} color={color} x={100} y={192} size={s} rotate180 />);
      pips.push(<Pip key="10-l4" suit={suit} color={color} x={60} y={218} size={s} rotate180 />);
      pips.push(<Pip key="10-r4" suit={suit} color={color} x={140} y={218} size={s} rotate180 />);
      break;
    case 'J':
    case 'Q':
    case 'K':
      // Court cards: Beautiful vector royal crest frame
      pips.push(
        <g key="court-frame" transform="translate(100, 140)">
          {/* Inner Ornate Frame */}
          <rect
            x={-56}
            y={-76}
            width={112}
            height={152}
            rx={6}
            fill="#f8fafc"
            stroke={color}
            strokeWidth={1.5}
          />
          <rect
            x={-50}
            y={-70}
            width={100}
            height={140}
            rx={4}
            fill="none"
            stroke="#94a3b8"
            strokeWidth={1}
            strokeDasharray="3 3"
          />
          {/* Royal Avatar / Crest */}
          <text
            x={0}
            y={-12}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="44"
            style={{ userSelect: 'none' }}
          >
            {rank === 'K' ? '👑' : rank === 'Q' ? '👸' : '⚔️'}
          </text>
          <text
            x={0}
            y={32}
            textAnchor="middle"
            dominantBaseline="central"
            fontFamily="'Georgia', 'Times New Roman', serif"
            fontWeight="bold"
            fontSize="18"
            fill={color}
          >
            {rank === 'K' ? 'KING' : rank === 'Q' ? 'QUEEN' : 'JACK'}
          </text>
          <g transform="translate(0, 52)">
            <Pip suit={suit} color={color} x={0} y={0} size={22} />
          </g>
        </g>
      );
      break;
    default:
      pips.push(<Pip key="default" suit={suit} color={color} x={100} y={140} size={sLarge} />);
  }

  return pips;
};

export const CardView: React.FC<CardViewProps> = ({
  card,
  hidden = false,
  isWinning = false,
  size = 'md',
  className = '',
  glow = false,
}) => {
  // Responsive card dimensions preserving 1 : 1.4 ratio
  const sizeMap = {
    sm: { w: 'w-9', h: 'h-13' },
    md: { w: 'w-13 sm:w-16', h: 'h-18 sm:h-22' },
    lg: { w: 'w-18 sm:w-22', h: 'h-25 sm:h-31' },
    xl: { w: 'w-24 sm:w-28', h: 'h-34 sm:h-40' },
  };

  // Card Back: Classic Western Red & Gold Pattern
  if (hidden || !card) {
    return (
      <div
        className={`relative select-none rounded-xl overflow-hidden shadow-xl transition-transform duration-200 aspect-[1/1.4] ${sizeMap[size].w} ${sizeMap[size].h} ${className}`}
      >
        <svg
          viewBox="0 0 200 280"
          className="w-full h-full block rounded-xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Card White Rim */}
          <rect
            x="2"
            y="2"
            width="196"
            height="276"
            rx="14"
            ry="14"
            fill="#ffffff"
            stroke="#000000"
            strokeWidth="4"
          />
          {/* Crimson Western Pattern Body */}
          <rect
            x="12"
            y="12"
            width="176"
            height="256"
            rx="8"
            ry="8"
            fill="#991b1b"
          />
          {/* Gold Inner Dashed Border */}
          <rect
            x="18"
            y="18"
            width="164"
            height="244"
            rx="6"
            ry="6"
            fill="none"
            stroke="#fef08a"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
          {/* Diamond Lattice Texture */}
          <pattern
            id="back-diamond"
            x="0"
            y="0"
            width="16"
            height="16"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 8 0 L 16 8 L 8 16 L 0 8 Z"
              fill="none"
              stroke="#7f1d1d"
              strokeWidth="1.2"
            />
          </pattern>
          <rect x="22" y="22" width="156" height="236" fill="url(#back-diamond)" />
          {/* Center Texas Gold Star */}
          <circle cx="100" cy="140" r="28" fill="#7f1d1d" stroke="#fef08a" strokeWidth="2" />
          <text
            x="100"
            y="142"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize="32"
            fill="#fef08a"
            fontFamily="serif"
          >
            ★
          </text>
        </svg>
      </div>
    );
  }

  const isRed = card.color === 'red' || card.suit === '♥' || card.suit === '♦';
  const colorHex = isRed ? '#dc2626' : '#000000';
  const rank = card.rank;
  const suit = card.suit;

  return (
    <div
      className={`relative select-none transition-all duration-200 aspect-[1/1.4] ${sizeMap[size].w} ${sizeMap[size].h} ${
        isWinning
          ? 'ring-4 ring-yellow-400 ring-offset-2 ring-offset-black scale-105 shadow-yellow-400/60 shadow-2xl'
          : 'hover:-translate-y-1'
      } ${glow ? 'shadow-yellow-300/50 shadow-lg' : 'shadow-lg'} ${className}`}
    >
      {/* EXACT VECTOR SVG PLAYING CARD */}
      <svg
        viewBox="0 0 200 280"
        className="w-full h-full block rounded-xl filter drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Crisp White Card Base with Rounded Corners & Outer Black Border (Matching image exactly) */}
        <rect
          x="3"
          y="3"
          width="194"
          height="274"
          rx="14"
          ry="14"
          fill="#ffffff"
          stroke="#000000"
          strokeWidth="5"
        />

        {/* TOP-LEFT INDEX: Rank Number & Small Suit Pip */}
        <g id="top-left-index">
          <text
            x={rank === '10' ? '12' : '16'}
            y="42"
            fontFamily="'Times New Roman', Times, 'Georgia', serif"
            fontSize={rank === '10' ? '38' : '44'}
            fontWeight="bold"
            fill={colorHex}
            style={{ userSelect: 'none' }}
          >
            {rank}
          </text>
          <g transform="translate(24, 62)">
            <Pip suit={suit} color={colorHex} x={0} y={0} size={18} />
          </g>
        </g>

        {/* CENTER PIPS (Exact standard pip grid matching user images) */}
        <g id="card-pips">{renderCardPips(rank, suit, colorHex)}</g>

        {/* BOTTOM-RIGHT INDEX: 180° Inverted Rank Number & Suit Pip */}
        <g id="bottom-right-index" transform="rotate(180, 100, 140)">
          <text
            x={rank === '10' ? '12' : '16'}
            y="42"
            fontFamily="'Times New Roman', Times, 'Georgia', serif"
            fontSize={rank === '10' ? '38' : '44'}
            fontWeight="bold"
            fill={colorHex}
            style={{ userSelect: 'none' }}
          >
            {rank}
          </text>
          <g transform="translate(24, 62)">
            <Pip suit={suit} color={colorHex} x={0} y={0} size={18} />
          </g>
        </g>
      </svg>

      {/* Winning Badge Ribbon */}
      {isWinning && (
        <div className="absolute -top-1.5 -right-2 bg-gradient-to-r from-yellow-400 to-amber-500 text-stone-950 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md border border-yellow-200 animate-pulse">
          WIN
        </div>
      )}
    </div>
  );
};
