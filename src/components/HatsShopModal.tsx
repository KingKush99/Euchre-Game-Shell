import React, { useState } from 'react';
import { HatItem, PlayerProfile } from '../types/poker';
import { HATS_CATALOG } from '../data/gameData';
import { sounds } from '../utils/soundEffects';
import { EuchreCoin } from './EuchreCoin';
import {
  X,
  Check,
  Sparkles,
  ShoppingBag,
  Tv,
} from 'lucide-react';

interface HatsShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onEquipHat: (hatId: string) => void;
  onBuyHat: (hat: HatItem) => void;
}

export const HatsShopModal: React.FC<HatsShopModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onEquipHat,
  onBuyHat,
}) => {
  const [activeTab, setActiveTab] = useState<'vault' | 'hats'>('vault');
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const getRarityBadge = (rarity: HatItem['rarity']) => {
    switch (rarity) {
      case 'Legendary':
        return 'bg-amber-500/20 text-yellow-300 border-amber-400/60';
      case 'Epic':
        return 'bg-purple-500/20 text-purple-300 border-purple-400/60';
      case 'Rare':
        return 'bg-blue-500/20 text-blue-300 border-blue-400/60';
      case 'Common':
      default:
        return 'bg-stone-700/40 text-stone-300 border-stone-600/40';
    }
  };

  // Clean, simplified coin bundles
  const COIN_PACKAGES = [
    { coins: 500, price: '$1.99', badge: 'Starter' },
    { coins: 1500, price: '$4.99', badge: 'Popular' },
    { coins: 5000, price: '$12.99', badge: 'Best Value' },
    { coins: 15000, price: '$29.99', badge: 'High Roller' },
    { coins: 40000, price: '$69.99', badge: 'Palace Vault' },
    { coins: 100000, price: '$149.99', badge: 'Sovereign' },
  ];

  const handleBuyCoins = (coins: number, priceStr: string) => {
    sounds.playWin();
    playerProfile.gold += coins;
    setPurchaseSuccessMessage(`🎉 Successfully added +${coins.toLocaleString()} Euchre Coins (${priceStr})!`);
    setTimeout(() => setPurchaseSuccessMessage(null), 3500);
  };

  const handleWatchAd = () => {
    sounds.playWin();
    playerProfile.gold += 50;
    setPurchaseSuccessMessage('📺 Video Ad Completed! +50 Free Euchre Coins added to your vault!');
    setTimeout(() => setPurchaseSuccessMessage(null), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Outer Shell strictly matching 1080x760 dimensions */}
      <div
        id="hats-shop-modal"
        style={{
          width: 'min(1080px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 48px))',
        }}
        className="relative bg-[#0c1220] border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white shrink-0"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border border-yellow-300 flex items-center justify-center shadow-lg">
              <EuchreCoin size="md" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200 uppercase tracking-wide">
                PALACE SHOP & VAULT
              </h2>
              <div className="flex items-center gap-2 text-xs text-amber-400/90 font-medium">
                <span>Vault Balance:</span>
                <span className="flex items-center gap-1 font-bold text-yellow-300">
                  <EuchreCoin size="xs" />
                  {playerProfile.gold.toLocaleString()} Coins
                </span>
                <span>•</span>
                <span className="text-stone-300 font-bold">${playerProfile.chips.toLocaleString()} Chips</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer shrink-0"
            title="Close Shop"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Purchase Confirmation Alert */}
        {purchaseSuccessMessage && (
          <div className="my-2 p-2.5 bg-emerald-950/90 border border-emerald-500/80 rounded-xl text-emerald-200 text-xs font-bold text-center animate-in zoom-in-95 duration-150">
            {purchaseSuccessMessage}
          </div>
        )}

        {/* Simplified Shop Category Tabs */}
        <div className="grid grid-cols-2 gap-2 my-3 bg-[#080d19] p-1.5 rounded-2xl border border-slate-800 text-xs font-black shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('vault');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'vault'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <EuchreCoin size="xs" />
            <span>Coin Bundles</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('hats');
            }}
            className={`py-2.5 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'hats'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow-md font-black'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Saloon Hats Outfitter</span>
          </button>
        </div>

        {/* TAB 1: SIMPLIFIED COIN VAULT */}
        {activeTab === 'vault' && (
          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {/* Free Coins Sponsor Card */}
            <div className="p-4 bg-emerald-950/40 border-2 border-emerald-500/60 rounded-2xl flex items-center justify-between shadow-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 text-2xl">
                  <Tv className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-emerald-200">Daily Bonus: Watch Short Video</h4>
                  <p className="text-xs text-stone-400">
                    Earn +50 Sovereign Coins instantly for watching a quick sponsor video.
                  </p>
                </div>
              </div>

              <button
                onClick={handleWatchAd}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-stone-950 text-xs font-black rounded-xl shadow transition active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <EuchreCoin size="xs" />
                <span>Claim +50 Coins</span>
              </button>
            </div>

            {/* Coin Bundles Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {COIN_PACKAGES.map((pkg) => (
                <div
                  key={pkg.coins}
                  className="relative p-4 bg-[#0a101f] border border-slate-800 hover:border-amber-500/60 rounded-2xl flex flex-col justify-between shadow-md transition group"
                >
                  <span className="absolute -top-2.5 right-3 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 shadow">
                    {pkg.badge}
                  </span>

                  <div>
                    <div className="w-10 h-10 mb-2 rounded-xl bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
                      <EuchreCoin size="sm" />
                    </div>
                    <div className="font-black text-lg text-amber-200 flex items-center gap-1.5">
                      <span>{pkg.coins.toLocaleString()}</span>
                      <span className="text-xs text-amber-400 font-bold uppercase">Coins</span>
                    </div>
                    <div className="text-[11px] text-stone-400 mt-1">
                      Instantly credited to your vault balance.
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="font-black text-base text-white">{pkg.price}</div>

                    <button
                      onClick={() => handleBuyCoins(pkg.coins, pkg.price)}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs rounded-xl shadow transition active:scale-95 cursor-pointer"
                    >
                      Buy Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: HATS OUTFITTER */}
        {activeTab === 'hats' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 overflow-y-auto pr-1">
            {HATS_CATALOG.map((hat) => {
              const isOwned = playerProfile.unlockedHats.includes(hat.id);
              const isEquipped = playerProfile.currentHatId === hat.id;
              const canAfford =
                (hat.costChips === 0 || playerProfile.chips >= hat.costChips) &&
                (hat.costGold === 0 || playerProfile.gold >= hat.costGold);

              return (
                <div
                  key={hat.id}
                  id={`hat-card-${hat.id}`}
                  className={`relative flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                    isEquipped
                      ? 'bg-amber-950/30 border-yellow-400 ring-2 ring-yellow-400/40'
                      : isOwned
                      ? 'bg-[#0a101f] border-slate-700'
                      : 'bg-[#080d19] border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-3xl shadow-inner shrink-0">
                        {hat.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-100 truncate">{hat.name}</h4>
                          <span
                            className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border shrink-0 ${getRarityBadge(
                              hat.rarity
                            )}`}
                          >
                            {hat.rarity}
                          </span>
                        </div>

                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2">
                          {hat.description}
                        </p>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-400 font-medium mt-2 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-yellow-400 shrink-0" />
                      <span>+{hat.luckBonus}% Intimidation Aura</span>
                    </div>
                  </div>

                  {/* Price and Action Button */}
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800">
                    {isOwned ? (
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Owned
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-xs font-black">
                        {hat.costGold > 0 && (
                          <span className="text-yellow-300 flex items-center gap-1">
                            <EuchreCoin size="xs" />
                            {hat.costGold} Coins
                          </span>
                        )}
                        {hat.costGold === 0 && hat.costChips > 0 && (
                          <span className="text-amber-300 font-bold">
                            ${hat.costChips.toLocaleString()}
                          </span>
                        )}
                        {hat.costGold === 0 && hat.costChips === 0 && (
                          <span className="text-emerald-400 font-bold">FREE</span>
                        )}
                      </div>
                    )}

                    {isEquipped ? (
                      <span className="text-[11px] font-black text-yellow-300 bg-yellow-500/20 border border-yellow-400/50 px-2.5 py-1 rounded-xl">
                        Equipped
                      </span>
                    ) : isOwned ? (
                      <button
                        onClick={() => {
                          sounds.playClick();
                          onEquipHat(hat.id);
                        }}
                        className="text-xs font-bold text-stone-950 bg-yellow-400 hover:bg-yellow-300 px-3 py-1 rounded-xl shadow transition active:scale-95 cursor-pointer"
                      >
                        Equip
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          sounds.playWin();
                          onBuyHat(hat);
                        }}
                        disabled={!canAfford}
                        className="text-xs font-black text-stone-950 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 px-3 py-1 rounded-xl shadow transition active:scale-95 disabled:opacity-40 cursor-pointer"
                      >
                        Buy Hat
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
