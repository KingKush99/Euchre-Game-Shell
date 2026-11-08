import React, { useState } from 'react';
import { X, Play, Tv, Sparkles, CheckCircle2, Film } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';
import { EuchreCoin } from './EuchreCoin';

interface WatchAdsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimReward: (chips: number, sovereigns: number) => void;
}

export const WatchAdsModal: React.FC<WatchAdsModalProps> = ({
  isOpen,
  onClose,
  onClaimReward,
}) => {
  const [watchingAdId, setWatchingAdId] = useState<string | null>(null);
  const [adProgress, setAdProgress] = useState<number>(0);
  const [claimedAds, setClaimedAds] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const AD_OFFERS = [
    {
      id: 'saloon_sponsored_video_1',
      title: 'Saloon Sponsored Video Reel',
      duration: '15 sec',
      rewardText: '+250 Coins & +1 Sovereign',
      chips: 250,
      sovereigns: 1,
      icon: Tv,
      bgGradient: 'from-amber-600 to-yellow-600',
    },
  ];

  const handleStartWatch = (ad: typeof AD_OFFERS[0]) => {
    sounds.playClick();
    setWatchingAdId(ad.id);
    setAdProgress(0);

    const interval = setInterval(() => {
      setAdProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          sounds.playWin();
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.4 } });
          onClaimReward(ad.chips, ad.sovereigns);
          setClaimedAds((old) => new Set(old).add(ad.id));
          setWatchingAdId(null);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d1527] border-2 border-slate-700/80 rounded-3xl p-6 shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-stone-100 flex flex-col gap-5 select-none">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Watch Saloon Ads</h3>
              <p className="text-xs text-stone-400 font-medium">Earn Free Coins & Sovereigns</p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition active:scale-95 cursor-pointer shadow-md"
          >
            <X className="w-4.5 h-4.5 text-white stroke-[2.5]" />
          </button>
        </div>

        {/* Ad Video Simulator Screen if watching */}
        {watchingAdId ? (
          <div className="w-full bg-black rounded-2xl p-6 border border-blue-500/50 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/30 border-2 border-blue-400 flex items-center justify-center animate-pulse">
              <Play className="w-8 h-8 text-blue-400 fill-blue-400 ml-1" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Playing Saloon Video Ad...</h4>
              <p className="text-xs text-stone-400">Sit back & relax for instant rewards!</p>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-200"
                style={{ width: `${adProgress}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-300">{adProgress}% Completed</span>
          </div>
        ) : (
          /* List of Available Ad Offers */
          <div className="flex flex-col gap-3">
            {AD_OFFERS.map((ad) => {
              const Icon = ad.icon;
              const isClaimed = claimedAds.has(ad.id);

              return (
                <div
                  key={ad.id}
                  className="w-full p-3.5 bg-[#121b2f] border border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-md hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ad.bgGradient} text-white flex items-center justify-center shadow-md shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-sm text-stone-100">{ad.title}</span>
                      <span className="text-[11px] text-stone-400 font-medium">{ad.duration} • {ad.rewardText}</span>
                    </div>
                  </div>

                  <button
                    disabled={isClaimed}
                    onClick={() => handleStartWatch(ad)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shrink-0 ${
                      isClaimed
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 cursor-default'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                  >
                    {isClaimed ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Claimed</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Watch</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Info Pill */}
        <div className="w-full bg-[#131b2d] border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs text-stone-400">
          <div className="flex items-center gap-2">
            <EuchreCoin size="sm" />
            <span className="font-semibold">Watch daily for up to 500 free coins</span>
          </div>
        </div>

      </div>
    </div>
  );
};
