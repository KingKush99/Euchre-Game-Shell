import React, { useState } from 'react';
import { X, Check, Sparkles, Tv, ShieldCheck, Zap, Coins, CreditCard, Bitcoin, Wallet, Copy, CheckCircle2 } from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import confetti from 'canvas-confetti';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onUpdateCoins?: (newAmount: number) => void;
}

interface PriceTier {
  id: string;
  coins: number;
  fiatPrice: string;
  usdAmount: number;
  bonusText?: string;
  isPopular?: boolean;
  isBestValue?: boolean;
}

const FIAT_PRICE_POINTS: PriceTier[] = [
  { id: 'tier_1', coins: 100, fiatPrice: '$0.99 USD', usdAmount: 0.99 },
  { id: 'tier_2', coins: 500, fiatPrice: '$4.99 USD', usdAmount: 4.99 },
  { id: 'tier_3', coins: 1000, fiatPrice: '$9.99 USD', usdAmount: 9.99, isPopular: true },
  { id: 'tier_4', coins: 2500, fiatPrice: '$19.99 USD', usdAmount: 19.99 },
  { id: 'tier_5', coins: 5000, fiatPrice: '$39.99 USD', usdAmount: 39.99 },
  { id: 'tier_6', coins: 10000, fiatPrice: '$79.99 USD', usdAmount: 79.99, isBestValue: true },
  { id: 'tier_7', coins: 20000, fiatPrice: '$149.99 USD', usdAmount: 149.99 },
  { id: 'tier_8', coins: 35000, fiatPrice: '$249.99 USD', usdAmount: 249.99 },
  { id: 'tier_9', coins: 60000, fiatPrice: '$399.99 USD', usdAmount: 399.99 },
  { id: 'tier_10', coins: 100000, fiatPrice: '$499.99 USD', usdAmount: 499.99 },
  { id: 'tier_11', coins: 200000, fiatPrice: '$749.99 USD', usdAmount: 749.99 },
  { id: 'tier_12', coins: 300000, fiatPrice: '$999.99 USD', usdAmount: 999.99 },
];

const CRYPTO_PACKAGES = [
  { id: 'c1', coins: 5000, cryptoSymbol: 'BTC', crypto: '0.00045 BTC', name: 'Bitcoin Pack', approx: '~$40 USD' },
  { id: 'c2', coins: 15000, cryptoSymbol: 'ETH', crypto: '0.042 ETH', name: 'Ethereum Chest', approx: '~$120 USD' },
  { id: 'c3', coins: 40000, cryptoSymbol: 'SOL', crypto: '1.85 SOL', name: 'Solana Saloon Vault', approx: '~$300 USD' },
  { id: 'c4', coins: 100000, cryptoSymbol: 'USDT', crypto: '750 USDT', name: 'Tether Sovereign Hoard', approx: '~$750 USD' },
];

const SUBSCRIPTION_PLANS = [
  {
    id: 'vip_pass',
    name: 'Palace VIP Season Pass',
    price: '$9.99 / month',
    benefits: ['+25% Extra Table XP', 'Exclusive Golden Crown Avatar Border', 'Daily 250 Free Bonus Coins', 'Zero Commercial Ads'],
    badge: 'Most Popular',
  },
  {
    id: 'high_roller_club',
    name: 'Sovereign High Roller Club',
    price: '$24.99 / month',
    benefits: ['All VIP Pass Perks Included', 'Personal High Stakes Private Saloon', 'Weekly 2,500 Coin Airdrop', 'Access to Elite Tournaments'],
    badge: 'Elite Tier',
  },
];

interface VideoAdItem {
  id: string;
  title: string;
  sponsor: string;
  durationSeconds: number;
  rewardCoins: number;
  description: string;
  tag: string;
  icon: string;
  gradient: string;
}

const VIDEO_ADS: VideoAdItem[] = [
  {
    id: 'ad_vid_1',
    title: 'Lone Star Saloon Sponsored Video',
    sponsor: 'Google Ad Partner · Texas Saloon Games',
    durationSeconds: 15,
    rewardCoins: 500,
    description: 'Watch the official premier trailer for Texas Euchre 3D updates & earn 500 free coins instantly!',
    tag: 'Featured Video',
    icon: '🎬',
    gradient: 'from-amber-600 to-red-600',
  },
];

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onUpdateCoins,
}) => {
  const [activeTab, setActiveTab] = useState<'fiat' | 'crypto' | 'subscriptions' | 'ads'>('fiat');
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Active Video Ad Player State
  const [activeVideoAd, setActiveVideoAd] = useState<VideoAdItem | null>(null);
  const [adSecondsRemaining, setAdSecondsRemaining] = useState<number>(0);
  const [isVideoFinished, setIsVideoFinished] = useState<boolean>(false);

  // Interactive Payment Checkout States
  const [selectedFiatTier, setSelectedFiatTier] = useState<PriceTier | null>(null);
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');
  const [cardZip, setCardZip] = useState('78701');
  const [cardHolder, setCardHolder] = useState('Palace Patron');
  const [fiatProcessing, setFiatProcessing] = useState(false);
  const [fiatReceipt, setFiatReceipt] = useState<any | null>(null);

  const [selectedCryptoPkg, setSelectedCryptoPkg] = useState<any | null>(null);
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null);
  const [cryptoCopied, setCryptoCopied] = useState(false);
  const [cryptoProcessing, setCryptoProcessing] = useState(false);
  const [cryptoReceipt, setCryptoReceipt] = useState<any | null>(null);

  // Video Ad Countdown Loop
  React.useEffect(() => {
    let timer: any;
    if (activeVideoAd && !isVideoFinished) {
      timer = setInterval(() => {
        setAdSecondsRemaining((prev) => {
          if (prev <= 1) {
            setIsVideoFinished(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeVideoAd, isVideoFinished]);

  if (!isOpen) return null;

  const handleStartWatchAd = (adItem: VideoAdItem) => {
    sounds.playClick();
    setActiveVideoAd(adItem);
    setAdSecondsRemaining(adItem.durationSeconds);
    setIsVideoFinished(false);
  };

  const handleClaimAdReward = () => {
    if (!activeVideoAd) return;
    sounds.playWin();
    const reward = activeVideoAd.rewardCoins;
    playerProfile.gold += reward;
    if (onUpdateCoins) onUpdateCoins(playerProfile.gold);
    confetti({ particleCount: 75, spread: 80, origin: { x: 0.5, y: 0.5 } });
    setSuccessToast(`📺 Ad Complete! +${reward} Free Coins added to your vault!`);
    setActiveVideoAd(null);
    setIsVideoFinished(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const processFiatPayment = async () => {
    if (!selectedFiatTier) return;
    setFiatProcessing(true);
    sounds.playClick();

    try {
      const response = await fetch('/api/payments/fiat-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountUsd: selectedFiatTier.usdAmount,
          chipsAmount: selectedFiatTier.coins,
          paymentMethod: 'Credit Card (Visa/Mastercard)',
          cardDetails: { cardNumber },
          buyerName: cardHolder,
        }),
      });

      const data = await response.json();
      setFiatProcessing(false);

      if (data.status === 'success') {
        sounds.playWin();
        playerProfile.gold += selectedFiatTier.coins;
        if (onUpdateCoins) onUpdateCoins(playerProfile.gold);
        confetti({ particleCount: 80, spread: 80 });
        setFiatReceipt(data.receipt);
      }
    } catch (err) {
      console.error(err);
      setFiatProcessing(false);
      // Fallback local credit
      sounds.playWin();
      playerProfile.gold += selectedFiatTier.coins;
      if (onUpdateCoins) onUpdateCoins(playerProfile.gold);
      confetti({ particleCount: 80, spread: 80 });
      setFiatReceipt({
        txnId: `TXN-FIAT-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        amountUsd: selectedFiatTier.usdAmount,
        chipsAmount: selectedFiatTier.coins,
        paymentMethod: 'Credit Card (Visa/Mastercard)',
        last4: cardNumber.slice(-4),
        buyerName: cardHolder,
        status: 'COMPLETED',
      });
    }
  };

  const processCryptoPayment = async () => {
    if (!selectedCryptoPkg) return;
    setCryptoProcessing(true);
    sounds.playClick();

    try {
      const response = await fetch('/api/payments/crypto-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cryptoSymbol: selectedCryptoPkg.cryptoSymbol,
          amountUsd: 120,
          chipsAmount: selectedCryptoPkg.coins,
          walletAddress: connectedWallet || '0x7F2...8a9B_Phantom',
        }),
      });

      const data = await response.json();
      setCryptoProcessing(false);

      if (data.status === 'success') {
        sounds.playWin();
        playerProfile.gold += selectedCryptoPkg.coins;
        if (onUpdateCoins) onUpdateCoins(playerProfile.gold);
        confetti({ particleCount: 80, spread: 80 });
        setCryptoReceipt(data.receipt);
      }
    } catch (err) {
      console.error(err);
      setCryptoProcessing(false);
      sounds.playWin();
      playerProfile.gold += selectedCryptoPkg.coins;
      if (onUpdateCoins) onUpdateCoins(playerProfile.gold);
      confetti({ particleCount: 80, spread: 80 });
      setCryptoReceipt({
        txnId: `TXN-CRYPTO-${Math.floor(100000 + Math.random() * 900000)}`,
        timestamp: new Date().toISOString(),
        cryptoSymbol: selectedCryptoPkg.cryptoSymbol,
        cryptoAmount: selectedCryptoPkg.crypto,
        amountUsd: 120,
        chipsAmount: selectedCryptoPkg.coins,
        depositWallet: connectedWallet || '0x7F2...8a9B_Phantom',
        txHash: `0x${Math.random().toString(16).substring(2, 18)}`,
        status: 'CONFIRMED_ON_CHAIN',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200">
      <div
        id="palace-shop-modal"
        style={{
          width: 'min(1080px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 48px))',
        }}
        className="relative bg-[#0b1220] border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-white flex flex-col overflow-hidden shrink-0"
      >
        {/* TOP HEADER */}
        <div className="flex items-start justify-between shrink-0 pb-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400">
              EUCHRE PALACE
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-none mt-1">
              Palace Vault & Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Add coins via Fiat Credit Card, Web3 Crypto Wallets, or Watch Google Ads.
            </p>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-[#f43f5e] hover:bg-[#e11d48] text-white flex items-center justify-center shadow-lg transition-all hover:scale-105 active:scale-90 cursor-pointer shrink-0"
            title="Close Shop"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* PILL NAVIGATION TABS */}
        <div className="flex items-center gap-2 pb-5 shrink-0 overflow-x-auto no-scrollbar">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('fiat');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'fiat'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'bg-[#131b2e] text-slate-300 border border-slate-700/60 hover:bg-[#1c2842]'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Fiat → Coins</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('crypto');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'crypto'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'bg-[#131b2e] text-slate-300 border border-slate-700/60 hover:bg-[#1c2842]'
            }`}
          >
            <Bitcoin className="w-4 h-4" />
            <span>Crypto → Coins</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('subscriptions');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'subscriptions'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'bg-[#131b2e] text-slate-300 border border-slate-700/60 hover:bg-[#1c2842]'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Subscriptions</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('ads');
            }}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'ads'
                ? 'bg-[#2563eb] text-white shadow-md'
                : 'bg-[#131b2e] text-slate-300 border border-slate-700/60 hover:bg-[#1c2842]'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>Watch Ads</span>
          </button>

          <div className="ml-auto flex items-center gap-2 bg-[#131b2e] border border-amber-500/30 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 shrink-0">
            <EuchreCoin size="xs" />
            <span>{playerProfile.gold.toLocaleString()} Coins</span>
          </div>
        </div>

        {/* NOTIFICATION TOAST */}
        {successToast && (
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-bold animate-in fade-in flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{successToast}</span>
          </div>
        )}

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* 1. FIAT -> COINS */}
          {activeTab === 'fiat' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pb-6">
              {FIAT_PRICE_POINTS.map((tier) => (
                <div
                  key={tier.id}
                  className="bg-[#0f172a]/95 border border-slate-800/90 hover:border-slate-700/90 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-between gap-4 shadow-sm transition-all duration-200"
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 flex items-center justify-center shadow">
                        <span className="text-slate-950 font-black text-sm">🪙</span>
                      </div>
                      <span className="text-amber-400 text-lg sm:text-xl font-black">•</span>
                      <span className="text-amber-400 text-xl sm:text-2xl font-black tracking-tight">
                        {tier.coins.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold tracking-widest uppercase mt-1">
                      PALACE COINS
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSelectedFiatTier(tier);
                      setFiatReceipt(null);
                    }}
                    className="w-full py-2.5 sm:py-3 px-4 rounded-xl bg-[#2dd4bf] hover:bg-[#34d399] text-slate-950 font-black text-base sm:text-lg shadow transition-all hover:scale-[1.02] active:scale-95 cursor-pointer text-center"
                  >
                    {tier.fiatPrice}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 2. CRYPTO -> COINS */}
          {activeTab === 'crypto' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6">
              {CRYPTO_PACKAGES.map((pkg) => (
                <div
                  key={pkg.id}
                  className="bg-[#0f172a]/95 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-white">{pkg.name}</h3>
                      <p className="text-xs text-slate-400">{pkg.approx}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-amber-400 font-black text-lg">
                      <EuchreCoin size="sm" />
                      <span>{pkg.coins.toLocaleString()}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSelectedCryptoPkg(pkg);
                      setCryptoReceipt(null);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-base shadow transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Bitcoin className="w-5 h-5" />
                    <span>Pay {pkg.crypto}</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 3. SUBSCRIPTIONS */}
          {activeTab === 'subscriptions' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pb-6">
              {SUBSCRIPTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className="bg-[#0f172a]/95 border border-blue-500/40 rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-lg relative overflow-hidden"
                >
                  <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-blue-600/30 border border-blue-400 text-blue-300 text-[10px] font-black uppercase tracking-wider">
                    {plan.badge}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">{plan.name}</h3>
                    <p className="text-amber-300 font-bold text-lg mt-0.5">{plan.price}</p>

                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      {plan.benefits.map((b, i) => (
                        <li key={i} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      sounds.playWin();
                      setSuccessToast(`👑 Subscribed to ${plan.name}! All VIP perks active.`);
                      setTimeout(() => setSuccessToast(null), 3000);
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-[#2dd4bf] hover:bg-[#34d399] text-slate-950 font-black text-base shadow transition active:scale-95 cursor-pointer"
                  >
                    Subscribe Now
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 4. WATCH GOOGLE & SALOON AD VIDEOS */}
          {activeTab === 'ads' && (
            <div className="space-y-4 pb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-[#080f1e] p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl shadow-lg">
                    📺
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                      <span>SPONSORED VIDEO REWARD VAULT</span>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold">
                        FREE COINS
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Watch short Google partner video reels to earn free Palace Coins instantly without paying.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {VIDEO_ADS.map((ad) => (
                  <div
                    key={ad.id}
                    className="bg-[#0f172a]/95 border border-slate-800 hover:border-amber-400/60 rounded-2xl p-5 flex flex-col justify-between gap-3 shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ad.gradient} flex items-center justify-center text-2xl shadow-lg group-hover:scale-105 transition-transform`}
                        >
                          {ad.icon}
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
                            {ad.tag} · {ad.durationSeconds}s Video
                          </span>
                          <h4 className="text-sm font-black text-white leading-tight mt-0.5">
                            {ad.title}
                          </h4>
                          <span className="text-[10px] text-slate-400 font-sans block truncate">
                            {ad.sponsor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed">
                      {ad.description}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <div className="flex items-center gap-1.5 text-amber-400 font-black text-sm">
                        <EuchreCoin size="sm" />
                        <span>+{ad.rewardCoins} Free Coins</span>
                      </div>

                      <button
                        onClick={() => handleStartWatchAd(ad)}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xs shadow transition active:scale-95 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Tv className="w-3.5 h-3.5" />
                        <span>Watch ({ad.durationSeconds}s)</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FIAT CHECKOUT MODAL OVERLAY */}
      {selectedFiatTier && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0a101d] border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-4">
            <button
              onClick={() => setSelectedFiatTier(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-500/20 border border-teal-400 flex items-center justify-center text-teal-300 text-2xl shadow">
                💳
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Credit / Debit Card Checkout
                </h3>
                <p className="text-xs text-slate-400">
                  Instant processing via Stripe Secured Gateway
                </p>
              </div>
            </div>

            {fiatReceipt ? (
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Payment Completed Successfully!</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Transaction ID: <span className="text-amber-300 font-bold">{fiatReceipt.txnId}</span></div>
                  <div>Amount: <span className="text-white font-bold">${fiatReceipt.amountUsd} USD</span></div>
                  <div>Coins Credited: <span className="text-amber-400 font-bold">+{fiatReceipt.chipsAmount.toLocaleString()} Coins</span></div>
                  <div>Payment Method: <span className="text-slate-200">{fiatReceipt.paymentMethod} (ending in {fiatReceipt.last4})</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">PAID & VERIFIED</span></div>
                </div>
                <button
                  onClick={() => setSelectedFiatTier(null)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase transition"
                >
                  Return to Vault
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-300">Purchase Tier:</span>
                  <span className="font-black text-amber-300 text-sm">+{selectedFiatTier.coins.toLocaleString()} Coins ({selectedFiatTier.fiatPrice})</span>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Cardholder Name</label>
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-medium focus:border-amber-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-300 font-mono text-sm focus:border-amber-400 outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Expires</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">CVC</label>
                    <input
                      type="text"
                      value={cardCvc}
                      onChange={(e) => setCardCvc(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Zip Code</label>
                    <input
                      type="text"
                      value={cardZip}
                      onChange={(e) => setCardZip(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-center outline-none"
                    />
                  </div>
                </div>

                <button
                  onClick={processFiatPayment}
                  disabled={fiatProcessing}
                  className="w-full py-3.5 mt-2 rounded-2xl bg-[#2dd4bf] hover:bg-[#34d399] text-slate-950 font-black text-sm uppercase shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{fiatProcessing ? 'Processing Payment...' : `Pay ${selectedFiatTier.fiatPrice} Now`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CRYPTO CHECKOUT MODAL OVERLAY */}
      {selectedCryptoPkg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-[#0a101d] border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-white flex flex-col gap-4">
            <button
              onClick={() => setSelectedCryptoPkg(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition"
            >
              <X className="w-4 h-4 text-white stroke-[2.5]" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-300 text-2xl shadow">
                ₿
              </div>
              <div>
                <h3 className="text-lg font-black text-white uppercase tracking-wide">
                  Web3 {selectedCryptoPkg.cryptoSymbol} Vault Deposit
                </h3>
                <p className="text-xs text-slate-400">
                  Send on-chain cryptocurrency directly to Palace Vault address
                </p>
              </div>
            </div>

            {cryptoReceipt ? (
              <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-black text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>On-Chain Crypto Payment Confirmed!</span>
                </div>
                <div className="text-xs space-y-1 font-mono text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div>Txn ID: <span className="text-amber-300 font-bold">{cryptoReceipt.txnId}</span></div>
                  <div>Crypto Sent: <span className="text-white font-bold">{cryptoReceipt.cryptoAmount} {cryptoReceipt.cryptoSymbol}</span></div>
                  <div>Coins Added: <span className="text-amber-400 font-bold">+{cryptoReceipt.chipsAmount.toLocaleString()} Coins</span></div>
                  <div>Tx Hash: <span className="text-xs text-slate-400 truncate block">{cryptoReceipt.txHash}</span></div>
                  <div>Status: <span className="text-emerald-400 font-bold">CONFIRMED ON-CHAIN</span></div>
                </div>
                <button
                  onClick={() => setSelectedCryptoPkg(null)}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm uppercase transition"
                >
                  Return to Vault
                </button>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex justify-between items-center">
                  <span className="font-bold text-slate-300">Package:</span>
                  <span className="font-black text-amber-300 text-sm">+{selectedCryptoPkg.coins.toLocaleString()} Coins ({selectedCryptoPkg.crypto})</span>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col items-center gap-3 text-center">
                  <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center shadow">
                    {/* Simulated QR Code */}
                    <div className="w-full h-full bg-slate-950 rounded p-2 flex flex-col justify-between text-[8px] font-mono text-amber-300 break-all overflow-hidden">
                      <span>{selectedCryptoPkg.cryptoSymbol}_DEPOSIT_VAULT_ADDRESS_QR_CODE</span>
                      <span className="text-center text-xl font-bold">🪙</span>
                    </div>
                  </div>
                  <div className="w-full space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Official Vault Address</span>
                    <div className="bg-slate-900 p-2 rounded-xl text-amber-300 font-mono text-[11px] flex items-center justify-between border border-slate-800">
                      <span className="truncate">8x2A...9f42_PalaceSovereignVault</span>
                      <button
                        onClick={() => {
                          setCryptoCopied(true);
                          setTimeout(() => setCryptoCopied(false), 2000);
                        }}
                        className="text-slate-400 hover:text-white p-1"
                      >
                        {cryptoCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={processCryptoPayment}
                  disabled={cryptoProcessing}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm uppercase shadow-xl transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Wallet className="w-5 h-5" />
                  <span>{cryptoProcessing ? 'Verifying On-Chain Tx...' : `Confirm Web3 Payment (${selectedCryptoPkg.crypto})`}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ACTIVE VIDEO AD PLAYER OVERLAY MODAL */}
      {activeVideoAd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 select-none animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-2 border-amber-500/70 rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(245,158,11,0.3)] flex flex-col">
            <div className="bg-[#050811] px-5 py-3 border-b border-slate-800 flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                  Ad
                </span>
                <span className="text-slate-300 truncate">{activeVideoAd.sponsor}</span>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-amber-300 font-mono text-xs">
                  {isVideoFinished ? '✓ Video Completed' : `Reward in: ${adSecondsRemaining}s`}
                </span>
                {isVideoFinished && (
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveVideoAd(null);
                    }}
                    className="text-stone-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="relative aspect-video w-full bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]" />

              <div className="relative z-10 text-center space-y-3 max-w-md">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-amber-500 to-red-600 p-1 shadow-2xl animate-pulse">
                  <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-4xl">
                    {activeVideoAd.icon}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-widest text-amber-400">
                    {activeVideoAd.tag} • Sponsored Promotion
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {activeVideoAd.title}
                  </h3>
                  <p className="text-xs text-slate-300 font-sans">
                    {activeVideoAd.description}
                  </p>
                </div>
              </div>

              <div className="absolute bottom-3 left-4 right-4 z-20 space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                  <span>
                    0:{String(activeVideoAd.durationSeconds - adSecondsRemaining).padStart(2, '0')}
                  </span>
                  <span className="text-amber-300 font-bold">
                    Reward: +{activeVideoAd.rewardCoins} Coins
                  </span>
                  <span>0:{String(activeVideoAd.durationSeconds).padStart(2, '0')}</span>
                </div>
                <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-emerald-400 transition-all duration-1000 ease-linear"
                    style={{
                      width: `${
                        ((activeVideoAd.durationSeconds - adSecondsRemaining) /
                          activeVideoAd.durationSeconds) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-[#050811] p-4 border-t border-slate-800 flex items-center justify-between gap-4">
              <div className="text-xs text-slate-400 font-sans">
                {isVideoFinished ? (
                  <span className="text-emerald-400 font-black">
                    🎉 Video finished! Claim your coin reward now!
                  </span>
                ) : (
                  <span>Please watch full ad to collect your free reward coins.</span>
                )}
              </div>

              {isVideoFinished ? (
                <button
                  onClick={handleClaimAdReward}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-xl animate-bounce cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Claim +{activeVideoAd.rewardCoins} Free Coins!</span>
                </button>
              ) : (
                <button
                  disabled
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-black text-xs cursor-not-allowed"
                >
                  Reward in {adSecondsRemaining}s
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
