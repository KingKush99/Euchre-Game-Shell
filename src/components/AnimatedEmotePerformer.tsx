import React, { useEffect, useState } from 'react';
import { PlayerProfile } from '../types/poker';

export interface ActiveEmoteDisplay {
  id: string;
  icon: string;
  label: string;
  desc: string;
  senderName: string;
  isUser: boolean;
  seatPosition?: 'south' | 'west' | 'north' | 'east';
}

interface AnimatedEmotePerformerProps {
  emote: ActiveEmoteDisplay | null;
  playerProfile: PlayerProfile;
  onFinish?: () => void;
}

export const AnimatedEmotePerformer: React.FC<AnimatedEmotePerformerProps> = ({
  emote,
  onFinish,
}) => {
  const [animStage, setAnimStage] = useState<'enter' | 'active' | 'exit'>('enter');
  const [coinParticles, setCoinParticles] = useState<{ id: number; x: number; y: number; rot: number; speed: number }[]>([]);

  useEffect(() => {
    if (!emote) return;

    setAnimStage('enter');
    const enterTimer = setTimeout(() => setAnimStage('active'), 80);

    // Coin & particle FX overlay
    if (emote.id === 'toss_coins' || emote.id === 'rain_chips' || emote.id === 'bet_it_all') {
      const coins = Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: Math.random() * -120,
        rot: Math.random() * 360,
        speed: 2 + Math.random() * 3,
      }));
      setCoinParticles(coins);
    } else {
      setCoinParticles([]);
    }

    const exitTimer = setTimeout(() => {
      setAnimStage('exit');
    }, 2800);

    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 3200);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [emote, onFinish]);

  if (!emote) return null;

  // Determine seat position
  const seat = emote.seatPosition || (emote.isUser ? 'south' : 'north');

  // Exact screen anchors over the 3D table seats
  const seatPositionStyles: Record<string, string> = {
    south: 'bottom-36 left-1/2 -translate-x-1/2',
    west: 'top-1/2 left-16 -translate-y-1/2',
    north: 'top-20 left-1/2 -translate-x-1/2',
    east: 'top-1/2 right-16 -translate-y-1/2',
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden select-none">
      {/* Visual FX without any text overlays on the table */}
      <div className={`absolute ${seatPositionStyles[seat]} flex flex-col items-center transition-all duration-300`}>
        <div
          className={`relative flex flex-col items-center transition-all duration-500 transform ${
            animStage === 'enter'
              ? 'scale-50 opacity-0'
              : animStage === 'active'
              ? 'scale-100 opacity-100'
              : 'scale-90 opacity-0'
          }`}
        >
          {/* Subtle Action Aura Glow */}
          <div className="absolute -inset-8 bg-amber-500/15 rounded-full blur-2xl animate-pulse" />

          {/* Floating Gold Coin FX for coin tossing actions */}
          {coinParticles.map((cp) => (
            <div
              key={cp.id}
              className="absolute text-2xl animate-bounce z-40"
              style={{
                transform: `translate(${cp.x}px, ${cp.y}px) rotate(${cp.rot}deg)`,
                animationDuration: `${0.8 / cp.speed}s`,
              }}
            >
              🪙
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
