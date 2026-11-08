import React, { useState } from 'react';

interface EuchreFiveScorekeeperProps {
  team1Score: number;
  team2Score: number;
  team1Name?: string;
  team2Name?: string;
}

// Proper Real Playing Card 5 Component (Face Up)
export const DetailedFiveCard: React.FC<{
  suit: 'hearts' | 'diamonds' | 'spades' | 'clubs';
  className?: string;
  style?: React.CSSProperties;
}> = ({ suit, className = '', style }) => {
  return (
    <div
      className={`relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden select-none bg-white border border-slate-300 shadow-[0_8px_24px_rgba(0,0,0,0.7)] ${className}`}
      style={style}
    >
      <img
        src={`/cards/${suit}-5.svg`}
        alt={`5 of ${suit}`}
        className="w-full h-full object-contain pointer-events-none p-1"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

// Proper Card Back Component (Face Down)
export const CardBackComponent: React.FC<{
  backColor?: 'blue' | 'red';
  className?: string;
  style?: React.CSSProperties;
}> = ({ backColor = 'blue', className = '', style }) => {
  return (
    <div
      className={`relative w-16 h-24 sm:w-20 sm:h-28 rounded-xl overflow-hidden select-none border-2 border-stone-800 shadow-[0_8px_24px_rgba(0,0,0,0.7)] ${className}`}
      style={style}
    >
      <img
        src={`/card_backs/card_back_${backColor}.svg`}
        alt="Bicycle Card Back"
        className="w-full h-full object-cover select-none pointer-events-none"
        referrerPolicy="no-referrer"
      />
    </div>
  );
};

/**
 * Traditional Euchre Scorekeeper using two 5s per team.
 * - Score 0 to 5: The top card is face down (card back) and slides across the face-up bottom card, uncovering 1 pip per point (each pip/part of the 5 counts as 1 point).
 * - Score 6 to 10: The bottom 5-card is fully uncovered (5 points), and the top 5-card turns face up and slides across, uncovering (score - 5) points.
 */
export const EuchreFiveScorekeeper: React.FC<EuchreFiveScorekeeperProps> = ({
  team1Score,
  team2Score,
  team1Name = 'Your Team',
  team2Name = 'Opponents',
}) => {
  const [showExplanation, setShowExplanation] = useState(false);

  const calculateCardLayout = (score: number) => {
    const clamped = Math.min(10, Math.max(0, score));

    if (clamped === 0) {
      // Score 0: Top card (face down) completely covers the bottom face-up 5
      return {
        topX: 0,
        topY: 0,
        topRotation: 0,
        isTopFaceUp: false,
      };
    } else if (clamped <= 5) {
      // Score 1-5: Top card (face down) slides diagonally across bottom card to reveal 'clamped' points (Score 1 reveals 1 single symbol/pip)
      const offsetsX = [0, 10, 22, 34, 46, 60];
      const offsetsY = [0, -2, -6, -10, -15, -20];
      const rotations = [0, 4, 10, 16, 22, 30];
      return {
        topX: offsetsX[clamped] || clamped * 12,
        topY: offsetsY[clamped] || -clamped * 3,
        topRotation: rotations[clamped] || 25,
        isTopFaceUp: false,
      };
    } else {
      // Score 6-10: Bottom card is fully exposed (5 pts). Top card is face up and slides to reveal (score - 5) pts.
      const secondScore = clamped - 5;
      const offsetsX = [0, 10, 22, 34, 46, 60];
      const offsetsY = [0, 2, 6, 10, 15, 20];
      const rotations = [0, -4, -10, -16, -22, -30];
      return {
        topX: offsetsX[secondScore] || secondScore * 12,
        topY: offsetsY[secondScore] || secondScore * 3,
        topRotation: rotations[secondScore] || -25,
        isTopFaceUp: true,
      };
    }
  };

  const t1 = calculateCardLayout(team1Score);
  const t2 = calculateCardLayout(team2Score);

  return (
    <div className="flex flex-col gap-2">
      {/* Top Bar Score Display with Prominent Overlapping 5s */}
      <div className="bg-stone-950/95 border-2 border-amber-500/70 rounded-2xl p-2.5 sm:p-3.5 shadow-[0_15px_40px_rgba(0,0,0,0.95)] backdrop-blur-md flex items-center gap-6 sm:gap-8">
        
        {/* Team 1: Red 5s (Hearts & Diamonds) */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-start pl-2 pt-2">
            {/* Bottom 5-card (Face Up 5 of Hearts) */}
            <div className="absolute left-2 top-2 z-0 transition-all duration-500">
              <DetailedFiveCard suit="hearts" />
            </div>

            {/* Top 5-card (Face Down / Face Up sliding card) */}
            <div
              className="absolute left-2 top-2 z-10 transition-all duration-500 origin-top-left shadow-2xl"
              style={{
                transform: `translateX(${t1.topX}px) translateY(${t1.topY}px) rotate(${t1.topRotation}deg)`,
              }}
            >
              {t1.isTopFaceUp ? (
                <DetailedFiveCard suit="diamonds" className="ring-2 ring-amber-400" />
              ) : (
                <CardBackComponent backColor="red" className="ring-2 ring-amber-500/80" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-300 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 animate-pulse" />
              {team1Name}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
                {team1Score}
              </span>
              <span className="text-xs text-stone-400 font-bold">/10 pts</span>
            </div>
            <span className="text-[10px] text-amber-300/90 font-mono mt-0.5">1 pt per pip revealed</span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-20 w-[1px] bg-gradient-to-b from-transparent via-amber-500/50 to-transparent" />

        {/* Team 2: Black 5s (Spades & Clubs) */}
        <div className="flex items-center gap-4">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-start pl-2 pt-2">
            {/* Bottom 5-card (Face Up 5 of Spades) */}
            <div className="absolute left-2 top-2 z-0 transition-all duration-500">
              <DetailedFiveCard suit="spades" />
            </div>

            {/* Top 5-card (Face Down / Face Up sliding card) */}
            <div
              className="absolute left-2 top-2 z-10 transition-all duration-500 origin-top-left shadow-2xl"
              style={{
                transform: `translateX(${t2.topX}px) translateY(${t2.topY}px) rotate(${t2.topRotation}deg)`,
              }}
            >
              {t2.isTopFaceUp ? (
                <DetailedFiveCard suit="clubs" className="ring-2 ring-amber-400" />
              ) : (
                <CardBackComponent backColor="blue" className="ring-2 ring-amber-500/80" />
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {team2Name}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                {team2Score}
              </span>
              <span className="text-xs text-stone-400 font-bold">/10 pts</span>
            </div>
            <span className="text-[10px] text-amber-300/90 font-mono mt-0.5">1 pt per pip revealed</span>
          </div>
        </div>

        {/* Explanation info button */}
        <button
          onClick={() => setShowExplanation((prev) => !prev)}
          className="ml-2 p-1.5 rounded-full bg-amber-500/20 hover:bg-amber-500/40 text-amber-300 border border-amber-500/30 text-xs font-black w-6 h-6 flex items-center justify-center cursor-pointer transition"
          title="Traditional Euchre 5s Scorekeeping"
        >
          ?
        </button>
      </div>

      {/* Explanation Modal */}
      {showExplanation && (
        <div className="bg-stone-950/95 border border-amber-500/60 rounded-xl p-3 shadow-2xl text-xs text-stone-200 max-w-sm animate-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-1 mb-1.5 border-b border-amber-500/30">
            <span className="font-black text-amber-300 uppercase tracking-wider text-xs">
              Traditional 5s Scorekeeping
            </span>
            <button
              onClick={() => setShowExplanation(false)}
              className="text-stone-400 hover:text-white text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>
          <p className="text-xs text-stone-300 leading-relaxed mb-1.5">
            Two 5-cards track score to 10 points. The top card is face-down and slides across the face-up bottom card, uncovering 1 pip per point (each pip/part of the 5 counts as 1 point). For 6-10 points, the second 5-card turns face up.
          </p>
          <div className="text-[11px] text-amber-400 font-mono">
            • Team 1: ♥ 5 & ♦ 5 (Red)
            <br />• Team 2: ♠ 5 & ♣ 5 (Blue)
          </div>
        </div>
      )}
    </div>
  );
};
