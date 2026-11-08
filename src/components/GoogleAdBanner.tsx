import React, { useState, useEffect } from 'react';
import { ExternalLink, ShieldCheck, Sparkles, X } from 'lucide-react';

interface GoogleAdBannerProps {
  slotId?: string;
  className?: string;
}

export const GoogleAdBanner: React.FC<GoogleAdBannerProps> = ({
  slotId = 'top_site_banner_728x90',
  className = '',
}) => {
  const [adConfig, setAdConfig] = useState<any>({
    client: 'ca-pub-908123749120384',
    title: 'Google Partner • Frontier Texas Outfitter & Boots',
    description: 'Get 20% off authentic hand-crafted leather saloon boots & hats with code PALACE20.',
    cta: 'Shop Collection',
    url: 'https://google.com/ads',
    publisher: 'Google AdSense Network',
  });
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/ads/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.bannerAds) {
          const matched = data.bannerAds.find((b: any) => b.slotId === slotId) || data.bannerAds[0];
          if (matched) {
            setAdConfig({
              client: data.client,
              ...matched,
            });
          }
        }
      })
      .catch((err) => console.log('Ad config fallback active:', err));
  }, [slotId]);

  if (dismissed) return null;

  return (
    <div
      id="google-ad-banner-top"
      className={`w-full bg-gradient-to-r from-stone-950 via-[#18110a] to-stone-950 border-b border-amber-600/40 px-4 py-1.5 flex items-center justify-between text-amber-100 text-xs shadow-md z-30 select-none ${className}`}
    >
      {/* Left side: Google AdSense badge & partner text */}
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 bg-white text-stone-900 font-extrabold text-[10px] px-2 py-0.5 rounded border border-amber-400 shrink-0 shadow-sm">
          <svg viewBox="0 0 24 24" className="w-3.5 h-3.5">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Ads by Google</span>
        </div>

        <div className="flex items-center gap-2 truncate">
          <span className="font-black text-amber-300 uppercase tracking-wide truncate">
            {adConfig.title}
          </span>
          <span className="hidden md:inline text-stone-400 font-sans text-[11px] truncate">
            — {adConfig.description}
          </span>
        </div>
      </div>

      {/* Right side: CTA link + close option */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href={adConfig.url || 'https://google.com/ads'}
          target="_blank"
          rel="noopener noreferrer"
          className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-[11px] uppercase tracking-wider transition shadow flex items-center gap-1 cursor-pointer"
        >
          <span>{adConfig.cta || 'Learn More'}</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          onClick={() => setDismissed(true)}
          className="text-stone-500 hover:text-stone-300 transition cursor-pointer"
          title="Dismiss Google Ad"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
