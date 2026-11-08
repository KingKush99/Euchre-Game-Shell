import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { PlayerProfile, PropertyItem } from '../types/poker';
import { PROPERTIES_DATA, TOWNS_DATA } from '../data/gameData';
import { sounds } from '../utils/soundEffects';
import {
  X,
  Gavel,
  Flame,
  PlusCircle,
  Heart,
  Building,
  Coins,
  Check,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  History,
  ShieldCheck,
  TrendingUp,
  Tag,
  Share2,
  Filter,
  Info,
  DollarSign,
  Award,
  ChevronRight,
  Zap,
  Crown,
  Gem,
  Watch,
  Layers,
  Shirt,
  Building2,
} from 'lucide-react';
import { EuchreCoin } from './EuchreCoin';

interface PropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onBuyProperty: (prop: PropertyItem) => void;
  onUpgradeProperty: (prop: PropertyItem) => void;
  onCollectIncome: (totalIncome: number) => void;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  category:
    | 'Haute Couture & Fine Jewelry'
    | 'Designer Saloon Attire'
    | 'Mastercrafted Card Decks'
    | 'Luxury Saloon Interiors'
    | 'Fine Heirloom Relics'
    | 'Sealed Treasury Vaults'
    | 'Rare Match Collectibles'
    | 'Characters & Avatars'
    | 'Card Decks & Finishes'
    | 'Table Felt Themes'
    | 'Emote Packs & Celebrations'
    | 'Voice Packs & Soundtracks'
    | 'Unopened Mystery Packs'
    | 'Saloon Real Estate Deeds';
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary' | 'Mythic';
  seller: string;
  sellerRating: number;
  currentBid: number;
  buyNowPrice?: number;
  bidsCount: number;
  timeLeft: string;
  timeLeftSeconds: number;
  icon: string;
  itemType?: 'tiara' | 'gloves' | 'deck' | 'choker' | 'boots' | 'felt' | 'gown' | 'watch' | 'brooch' | 'mystery_crate' | 'card_guard' | 'avatar';
  material?: string;
  hallmark?: string;
  condition?: string;
  description: string;
  isNFT?: boolean;
  isAuction: boolean;
  edition?: string;
  imageBg?: string;
  bidHistory?: { bidder: string; amount: number; time: string }[];
}

export const ItemVisualGraphic: React.FC<{ item: MarketplaceItem; size?: 'sm' | 'md' | 'lg' }> = ({
  item,
  size = 'md',
}) => {
  const isMythic = item.rarity === 'Mythic';
  const isLegendary = item.rarity === 'Legendary';
  const isEpic = item.rarity === 'Epic';

  const sizeClasses = {
    sm: 'w-11 h-11 text-lg',
    md: 'w-14 h-14 text-xl',
    lg: 'w-20 h-20 text-3xl',
  }[size];

  const iconSize = size === 'lg' ? 'w-10 h-10' : size === 'md' ? 'w-7 h-7' : 'w-5 h-5';

  const renderIcon = () => {
    switch (item.itemType) {
      case 'tiara':
        return <Crown className={`${iconSize} text-yellow-300 drop-shadow-[0_2px_8px_rgba(250,204,21,0.8)]`} />;
      case 'gloves':
      case 'boots':
      case 'gown':
        return <Shirt className={`${iconSize} text-rose-300 drop-shadow-[0_2px_8px_rgba(244,63,94,0.7)]`} />;
      case 'deck':
        return <Layers className={`${iconSize} text-cyan-300 drop-shadow-[0_2px_8px_rgba(6,182,212,0.8)]`} />;
      case 'choker':
      case 'brooch':
      case 'card_guard':
        return <Gem className={`${iconSize} text-pink-400 drop-shadow-[0_2px_8px_rgba(244,114,182,0.8)]`} />;
      case 'watch':
        return <Watch className={`${iconSize} text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.8)]`} />;
      case 'felt':
        return <Sparkles className={`${iconSize} text-emerald-300 drop-shadow-[0_2px_8px_rgba(52,211,153,0.8)]`} />;
      case 'mystery_crate':
        return <Award className={`${iconSize} text-purple-300 drop-shadow-[0_2px_8px_rgba(192,132,252,0.8)]`} />;
      default:
        return <Gem className={`${iconSize} text-amber-300 drop-shadow-[0_2px_8px_rgba(251,191,36,0.8)]`} />;
    }
  };

  return (
    <div
      className={`relative ${sizeClasses} rounded-2xl flex items-center justify-center shrink-0 overflow-hidden shadow-lg border transition-transform duration-300 ${
        isMythic
          ? 'bg-gradient-to-br from-amber-600/40 via-yellow-500/20 to-rose-900/50 border-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.4)]'
          : isLegendary
          ? 'bg-gradient-to-br from-purple-800/40 via-fuchsia-900/30 to-slate-900/60 border-purple-400/80 shadow-[0_0_15px_rgba(192,132,252,0.3)]'
          : isEpic
          ? 'bg-gradient-to-br from-pink-900/40 via-rose-950/40 to-slate-900/60 border-pink-400/60 shadow-[0_0_12px_rgba(244,114,182,0.25)]'
          : 'bg-gradient-to-br from-blue-900/40 via-cyan-950/40 to-slate-900/60 border-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.2)]'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent opacity-80 pointer-events-none" />
      <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-white/50" />
      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-white/50" />
      <div className="relative z-10 flex items-center justify-center">{renderIcon()}</div>
      {(isMythic || isLegendary) && (
        <span className="absolute top-1 right-1 text-[8px] text-yellow-200 animate-pulse">✦</span>
      )}
    </div>
  );
};

const INITIAL_MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'm1',
    name: 'Empress Rose-Gold Diamond Tiara',
    category: 'Haute Couture & Fine Jewelry',
    rarity: 'Mythic',
    seller: 'AtelierDeTexas',
    sellerRating: 5.0,
    currentBid: 1450,
    buyNowPrice: 2800,
    bidsCount: 24,
    timeLeft: '04m 12s',
    timeLeftSeconds: 252,
    icon: '👑',
    itemType: 'tiara',
    material: '24K Rose Gold & 48 Pavé Diamonds',
    hallmark: 'Royal Court Jeweler #001',
    condition: 'Pristine Flawless',
    description: 'Exclusive 1-of-1 Mythic Rose-Gold Tiara embedded with 48 pavé diamonds, central morganite teardrop, and custom glowing halo animation.',
    isNFT: true,
    isAuction: true,
    edition: '#001 / 1 (Masterwork)',
    imageBg: 'from-amber-600 to-rose-950',
    bidHistory: [
      { bidder: 'Gunslinger99', amount: 1450, time: '2m ago' },
      { bidder: 'LuckyAce', amount: 1300, time: '5m ago' },
      { bidder: 'PalaceQueen', amount: 1150, time: '12m ago' },
    ],
  },
  {
    id: 'm2',
    name: 'Midnight Sapphire Silk Opera Gloves',
    category: 'Designer Saloon Attire',
    rarity: 'Legendary',
    seller: 'SaloonCouture',
    sellerRating: 4.9,
    currentBid: 820,
    buyNowPrice: 1500,
    bidsCount: 14,
    timeLeft: '14m 30s',
    timeLeftSeconds: 870,
    icon: '🧤',
    itemType: 'gloves',
    material: 'Midnight Sapphire Velvet & French Pearl Stitch',
    hallmark: 'Chamberlain Atelier',
    condition: 'Hand-Tailored Silk',
    description: 'Ultra-luxurious opera-length sapphire velvet gloves with cascading pearl cuffs and smooth card deal animations.',
    isAuction: true,
    edition: '#012 / 50',
    imageBg: 'from-blue-900 to-indigo-950',
    bidHistory: [
      { bidder: 'EuchreQueen', amount: 820, time: '3m ago' },
      { bidder: 'AminaAce', amount: 750, time: '11m ago' },
    ],
  },
  {
    id: 'm3',
    name: 'Starlight Crystal 24K Gilded Deck',
    category: 'Mastercrafted Card Decks',
    rarity: 'Legendary',
    seller: 'CardsmithPro',
    sellerRating: 5.0,
    currentBid: 950,
    buyNowPrice: 1800,
    bidsCount: 19,
    timeLeft: '18m 45s',
    timeLeftSeconds: 1125,
    icon: '🎴',
    itemType: 'deck',
    material: 'Prismatic Optical Crystal & 24K Gold Leaf',
    hallmark: 'Royal Mint of Texas',
    condition: 'Gem Mint 10',
    description: 'Deep prismatic optical glass card faces with laser-etched Euchre pips, 24K gold foil trim, and radiant court figures.',
    isAuction: true,
    edition: '#042 / 100',
    imageBg: 'from-slate-900 to-cyan-950',
    bidHistory: [
      { bidder: 'CrystalCollector', amount: 950, time: '1m ago' },
      { bidder: 'HighRollerX', amount: 880, time: '9m ago' },
    ],
  },
  {
    id: 'm4',
    name: 'Baroness Ruby & Platinum Choker',
    category: 'Haute Couture & Fine Jewelry',
    rarity: 'Mythic',
    seller: 'HeritageGems',
    sellerRating: 5.0,
    currentBid: 3200,
    buyNowPrice: 4800,
    bidsCount: 31,
    timeLeft: '01h 15m',
    timeLeftSeconds: 4500,
    icon: '💎',
    itemType: 'choker',
    material: 'Hand-Chiseled Platinum & Pigeon-Blood Rubies',
    hallmark: 'House of Valois 1876',
    condition: 'Museum Grade',
    description: 'Heirloom Victorian high-society necklace featuring 7 cushion-cut Burmese rubies suspended on intricately hand-wrought platinum filigree.',
    isNFT: true,
    isAuction: true,
    edition: '#002 / 5',
    imageBg: 'from-rose-900 to-slate-950',
    bidHistory: [
      { bidder: 'LadyBower', amount: 3200, time: '4m ago' },
      { bidder: 'TexasTitan', amount: 3000, time: '16m ago' },
    ],
  },
  {
    id: 'm5',
    name: 'Haute Couture Pearlized Cowgirl Boots',
    category: 'Designer Saloon Attire',
    rarity: 'Epic',
    seller: 'AustinLeatherworks',
    sellerRating: 4.8,
    currentBid: 490,
    buyNowPrice: 900,
    bidsCount: 11,
    timeLeft: '35m 10s',
    timeLeftSeconds: 2110,
    icon: '👢',
    itemType: 'boots',
    material: 'Italian Pearlized Calfskin & Sterling Silver Spurs',
    hallmark: 'Austin Western Guild',
    condition: 'Hand-Tooled Leather',
    description: 'Bespoke pearlized calfskin boots with turquoise floral filigree, sterling silver spurs, and custom saloon footstep sound effects.',
    isAuction: true,
    edition: '#088 / 250',
    imageBg: 'from-amber-800 to-stone-900',
    bidHistory: [
      { bidder: 'VelvetViper', amount: 490, time: '7m ago' },
      { bidder: 'DocHolliday', amount: 430, time: '20m ago' },
    ],
  },
  {
    id: 'm6',
    name: 'Championship Rose Quartz Table Felt',
    category: 'Luxury Saloon Interiors',
    rarity: 'Epic',
    seller: 'SaloonArchitect',
    sellerRating: 4.9,
    currentBid: 560,
    buyNowPrice: 1100,
    bidsCount: 13,
    timeLeft: '42m 00s',
    timeLeftSeconds: 2520,
    icon: '✨',
    itemType: 'felt',
    material: 'Polished Blush Quartz & Rose Velvet Card Felt',
    hallmark: 'Saloon Architect Studio',
    condition: 'Flawless Finish',
    description: 'Polished blush quartz card table with illuminated 24K gold filigree seams and plush rose-colored velvet card felt.',
    isAuction: true,
    edition: 'Saloon Signature',
    imageBg: 'from-pink-900 to-rose-950',
    bidHistory: [
      { bidder: 'PinkAce', amount: 560, time: '12m ago' },
    ],
  },
  {
    id: 'm7',
    name: 'Celestial Sun & Moon Foil Deck',
    category: 'Mastercrafted Card Decks',
    rarity: 'Mythic',
    seller: 'EuchreEcosystem',
    sellerRating: 5.0,
    currentBid: 2900,
    buyNowPrice: 4200,
    bidsCount: 28,
    timeLeft: '02h 10m',
    timeLeftSeconds: 7800,
    icon: '✨',
    itemType: 'deck',
    material: 'Iridescent Starlight Foil & Black Core Stock',
    hallmark: 'Euchre Masters Series #007',
    condition: 'Mint 10 (Foil Shimmer)',
    description: 'Cosmic Euchre deck with iridescent holographic foil card backs, hand-painted lunar court aces, and sparkling trump particle trails.',
    isNFT: true,
    isAuction: true,
    edition: '#007 / 25',
    imageBg: 'from-violet-950 to-amber-950',
    bidHistory: [
      { bidder: 'SolarFlare', amount: 2900, time: '5m ago' },
      { bidder: 'WhaleHunter', amount: 2750, time: '22m ago' },
    ],
  },
  {
    id: 'm8',
    name: 'Artisan Emerald Bower Brooch',
    category: 'Fine Heirloom Relics',
    rarity: 'Legendary',
    seller: 'FrontierJewelers',
    sellerRating: 4.9,
    currentBid: 1100,
    buyNowPrice: 2100,
    bidsCount: 16,
    timeLeft: '28m 15s',
    timeLeftSeconds: 1695,
    icon: '💎',
    itemType: 'brooch',
    material: 'Colombian Emeralds & Sculpted Platinum',
    hallmark: 'Frontier Jewelers 1888',
    condition: 'Vintage Masterpiece',
    description: 'Sculpted platinum Jack of Bowers heraldic pin with deep Colombian emerald facets and diamond filigree borders.',
    isAuction: true,
    edition: '#019 / 100',
    imageBg: 'from-emerald-900 to-teal-950',
    bidHistory: [
      { bidder: 'EmeraldDuke', amount: 1100, time: '8m ago' },
    ],
  },
  {
    id: 'm9',
    name: 'Royal Diamond Velvet Mystery Crate',
    category: 'Sealed Treasury Vaults',
    rarity: 'Legendary',
    seller: 'PalaceTreasury',
    sellerRating: 5.0,
    currentBid: 1250,
    buyNowPrice: 2200,
    bidsCount: 22,
    timeLeft: '11m 40s',
    timeLeftSeconds: 700,
    icon: '🎁',
    itemType: 'mystery_crate',
    material: 'Quilted Royal Purple Velvet & 18K Brass Latch',
    hallmark: 'Palace Sovereign Vault #504',
    condition: 'Sealed Unopened',
    description: 'Sealed high-society velvet-lined treasure chest guaranteed to contain at least 1 Legendary deck, couture jewelry, or rare avatar accessory.',
    isAuction: true,
    edition: 'Sealed Vault Item #504',
    imageBg: 'from-indigo-900 to-purple-950',
    bidHistory: [
      { bidder: 'MysterySeeker', amount: 1250, time: '2m ago' },
    ],
  },
  {
    id: 'm10',
    name: 'Golden Hour Silk Evening Gown',
    category: 'Designer Saloon Attire',
    rarity: 'Mythic',
    seller: 'ParisianCouture',
    sellerRating: 5.0,
    currentBid: 3800,
    buyNowPrice: 5500,
    bidsCount: 36,
    timeLeft: '03h 00m',
    timeLeftSeconds: 10800,
    icon: '👗',
    itemType: 'gown',
    material: 'Liquid Gold Silk Chiffon & Swarovski Crystals',
    hallmark: 'Parisian Saloon Couture',
    condition: 'Haute Couture Runway',
    description: 'Bespoke flowing liquid-gold silk ballgown embroidered with thousands of Swarovski micro-crystals, creating a shimmering halo at the Euchre table.',
    isNFT: true,
    isAuction: true,
    edition: '#001 / 3 (Haute Couture)',
    imageBg: 'from-yellow-600 to-amber-950',
    bidHistory: [
      { bidder: 'DuchessOfAustin', amount: 3800, time: '1m ago' },
      { bidder: 'GoldenLady', amount: 3600, time: '15m ago' },
    ],
  },
  {
    id: 'm11',
    name: 'Vintage 1890 Diamond Pocket Watch',
    category: 'Fine Heirloom Relics',
    rarity: 'Epic',
    seller: 'SwissHorology',
    sellerRating: 4.7,
    currentBid: 680,
    buyNowPrice: 1250,
    bidsCount: 9,
    timeLeft: '50m 30s',
    timeLeftSeconds: 3030,
    icon: '⌚',
    itemType: 'watch',
    material: 'Sterling Silver & Mother-of-Pearl Dial',
    hallmark: 'Geneva Horology 1890',
    condition: 'Fully Restored Running',
    description: 'Hand-engraved Swiss pocket watch with exposed gear movement, mother-of-pearl dial, and diamond hour markers.',
    isAuction: true,
    edition: '#112 / 500',
    imageBg: 'from-stone-800 to-slate-900',
    bidHistory: [
      { bidder: 'TimeKeeper', amount: 680, time: '19m ago' },
    ],
  },
  {
    id: 'm12',
    name: 'Princess Amethyst Sovereign Card Guard',
    category: 'Luxury Saloon Interiors',
    rarity: 'Rare',
    seller: 'GemGuardians',
    sellerRating: 4.8,
    currentBid: 290,
    buyNowPrice: 550,
    bidsCount: 7,
    timeLeft: '58m 10s',
    timeLeftSeconds: 3490,
    icon: '💎',
    itemType: 'card_guard',
    material: 'Solid Deep Amethyst Crystal & 18K White Gold',
    hallmark: 'Bower Guardians Guild',
    condition: 'Hand-Cut Crystal',
    description: 'Faceted Brazilian amethyst card weight encased in engraved 18K white gold crown claws to protect your cards from being mucked.',
    isAuction: true,
    edition: '#340 / 1000',
    imageBg: 'from-purple-900 to-slate-950',
    bidHistory: [
      { bidder: 'CrystalFan', amount: 290, time: '25m ago' },
    ],
  },
];

export const PropertiesModal: React.FC<PropertiesModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onBuyProperty,
  onUpgradeProperty,
  onCollectIncome,
}) => {
  const [activeTab, setActiveTab] = useState<'auctions' | 'featured' | 'sell' | 'watchlist' | 'realestate'>('auctions');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [items, setItems] = useState<MarketplaceItem[]>(INITIAL_MARKETPLACE_ITEMS);
  const [watchlistIds, setWatchlistIds] = useState<string[]>(['m1', 'm4']);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [inspectItem, setInspectItem] = useState<MarketplaceItem | null>(null);

  // New Listing Form State
  const [sellName, setSellName] = useState('');
  const [sellCategory, setSellCategory] = useState<MarketplaceItem['category']>('Haute Couture & Fine Jewelry');
  const [sellRarity, setSellRarity] = useState<MarketplaceItem['rarity']>('Rare');
  const [sellStartingBid, setSellStartingBid] = useState(250);
  const [sellBuyNow, setSellBuyNow] = useState(500);
  const [sellDescription, setSellDescription] = useState('');

  // Live timer tick
  useEffect(() => {
    if (!isOpen) return;
    const timer = setInterval(() => {
      setItems((prevItems) =>
        prevItems.map((item) => {
          if (item.timeLeftSeconds <= 1) {
            return {
              ...item,
              timeLeftSeconds: 3600,
              timeLeft: '59m 59s',
            };
          }
          const nextSec = item.timeLeftSeconds - 1;
          const mins = Math.floor(nextSec / 60);
          const secs = nextSec % 60;
          const hrs = Math.floor(mins / 60);
          const formatted =
            hrs > 0
              ? `${hrs}h ${mins % 60}m`
              : `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
          return {
            ...item,
            timeLeftSeconds: nextSec,
            timeLeft: formatted,
          };
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen]);

  if (!isOpen) return null;

  const now = Date.now();
  let totalPendingIncome = 0;

  const propertyStatusList = PROPERTIES_DATA.map((prop) => {
    const userProp = playerProfile.properties[prop.id];
    const isOwned = Boolean(userProp?.owned);
    const level = userProp?.level || 1;
    const lastCollected = userProp?.lastCollected || now;

    const hoursElapsed = Math.min(24, Math.max(0, (now - lastCollected) / (1000 * 60 * 60)));
    const multiplier = 1 + (level - 1) * 0.5;
    const pendingChips = isOwned ? Math.floor(prop.incomePerHour * multiplier * Math.max(0.1, hoursElapsed)) : 0;

    totalPendingIncome += pendingChips;
    const town = TOWNS_DATA.find((t) => t.id === prop.townId);

    const cleanIcon = prop.name.toLowerCase().includes('pub') || prop.name.toLowerCase().includes('saloon')
      ? '🍻'
      : prop.name.toLowerCase().includes('hotel')
      ? '🏨'
      : prop.name.toLowerCase().includes('foundry') || prop.name.toLowerCase().includes('mine')
      ? '⚒️'
      : prop.name.toLowerCase().includes('mansion') || prop.name.toLowerCase().includes('estate')
      ? '🏰'
      : '🏪';

    return {
      ...prop,
      isOwned,
      level,
      pendingChips,
      townName: town?.name || 'Wild West',
      icon: cleanIcon,
    };
  });

  const handleToggleWatchlist = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    setWatchlistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handlePlaceBid = (item: MarketplaceItem, customIncrement = 50) => {
    const bidAmount = item.currentBid + customIncrement;
    if (playerProfile.chips < bidAmount) {
      sounds.playCardDeal();
      setFeedbackMsg('❌ Insufficient Chips to place bid!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    sounds.playWin();
    confetti({ particleCount: 60, spread: 60, origin: { x: 0.5, y: 0.6 } });

    const newHistory = [
      { bidder: playerProfile.name || 'You', amount: bidAmount, time: 'Just now' },
      ...(item.bidHistory || []),
    ];

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === item.id) {
          return {
            ...i,
            currentBid: bidAmount,
            bidsCount: i.bidsCount + 1,
            bidHistory: newHistory,
          };
        }
        return i;
      })
    );

    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem({
        ...inspectItem,
        currentBid: bidAmount,
        bidsCount: inspectItem.bidsCount + 1,
        bidHistory: newHistory,
      });
    }

    setFeedbackMsg(`🎉 Placed winning bid of $${bidAmount.toLocaleString()} on ${item.name}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleBuyNow = (item: MarketplaceItem) => {
    const cost = item.buyNowPrice || item.currentBid * 1.5;
    if (playerProfile.chips < cost) {
      sounds.playCardDeal();
      setFeedbackMsg('❌ Insufficient Chips to Buy Now!');
      setTimeout(() => setFeedbackMsg(null), 3000);
      return;
    }

    sounds.playWin();
    confetti({ particleCount: 90, spread: 80, origin: { x: 0.5, y: 0.6 } });

    playerProfile.chips -= cost;
    setItems((prev) => prev.filter((i) => i.id !== item.id));
    if (inspectItem && inspectItem.id === item.id) {
      setInspectItem(null);
    }

    setFeedbackMsg(`🏆 Purchased ${item.name} for $${cost.toLocaleString()}!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellName.trim()) return;

    sounds.playWin();
    const newItem: MarketplaceItem = {
      id: `m-custom-${Date.now()}`,
      name: sellName.trim(),
      category: sellCategory,
      rarity: sellRarity,
      seller: playerProfile.name || 'You',
      sellerRating: 5.0,
      currentBid: sellStartingBid,
      buyNowPrice: sellBuyNow,
      bidsCount: 0,
      timeLeft: '24h 00m',
      timeLeftSeconds: 86400,
      icon: '✨',
      itemType: sellCategory.includes('Jewelry')
        ? 'tiara'
        : sellCategory.includes('Attire')
        ? 'gloves'
        : sellCategory.includes('Decks')
        ? 'deck'
        : sellCategory.includes('Interiors')
        ? 'felt'
        : sellCategory.includes('Relics')
        ? 'watch'
        : sellCategory.includes('Treasury')
        ? 'mystery_crate'
        : 'deck',
      material: sellCategory.includes('Jewelry')
        ? '24K Gold & Natural Diamonds'
        : sellCategory.includes('Attire')
        ? 'Bespoke Velvet Silk'
        : 'Mastercrafted Special Edition',
      hallmark: `${playerProfile.name || 'Custom'} Atelier`,
      condition: 'Mint Flawless',
      description: sellDescription || 'Player-listed luxury auction collectible on the Palace marketplace.',
      isAuction: true,
      edition: 'Player Masterpiece #001',
      imageBg: 'from-amber-900 to-yellow-950',
      bidHistory: [],
    };

    setItems((prev) => [newItem, ...prev]);
    setSellName('');
    setSellDescription('');
    setActiveTab('auctions');
    setFeedbackMsg(`🚀 Successfully listed "${newItem.name}" on the Auction House!`);
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesTab =
      activeTab === 'auctions'
        ? true
        : activeTab === 'featured'
        ? item.rarity === 'Mythic' || item.rarity === 'Legendary'
        : activeTab === 'watchlist'
        ? watchlistIds.includes(item.id)
        : true;

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#070c18] text-white flex flex-col p-3 sm:p-6 select-none overflow-hidden animate-in fade-in duration-200">
      <div className="relative w-full h-full flex flex-col overflow-hidden">
        {/* TOP BAR: Palace Header + Balance + Close */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl sm:text-2xl">
                🏛️
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  AUCTION HOUSE
                </span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                  LIVE
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-none mt-0.5">
                Palace Auctions & Real Estate
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Player Balances */}
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 px-3 py-1.5 rounded-2xl shadow-inner">
              <div className="flex items-center gap-1.5 text-xs font-black text-amber-300">
                <Coins className="w-4 h-4 text-yellow-400" />
                <span>${playerProfile.chips.toLocaleString()}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>{playerProfile.sovereigns?.toLocaleString() || 0}</span>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="w-10 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition hover:scale-105 active:scale-95 cursor-pointer shrink-0"
              title="Close Auctions"
            >
              <X className="w-5 h-5 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* NAVIGATION PILL TABS */}
        <div className="flex items-center justify-between gap-2 py-2.5 shrink-0 overflow-x-auto no-scrollbar border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* List Item - Leftmost on the bar as requested */}
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('sell');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'sell'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-stone-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <PlusCircle className="w-4 h-4 text-emerald-400" />
              <span>List Item</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('auctions');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'auctions'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-stone-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Gavel className="w-4 h-4" />
              <span>Auctions ({items.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('featured');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'featured'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-stone-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Featured</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('watchlist');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'watchlist'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-stone-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Heart className="w-4 h-4 text-pink-400" />
              <span>Watchlist ({watchlistIds.length})</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('realestate');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'realestate'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900/90 text-stone-300 border border-slate-800 hover:bg-slate-800'
              }`}
            >
              <Building className="w-4 h-4 text-cyan-400" />
              <span>Real Estate</span>
            </button>
          </div>

          {/* Search bar inside auction list */}
          {(activeTab === 'auctions' || activeTab === 'featured' || activeTab === 'watchlist') && (
            <div className="relative w-60 hidden md:block">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-400"
              />
            </div>
          )}
        </div>

        {/* FEEDBACK TOAST */}
        {feedbackMsg && (
          <div className="my-1.5 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-xs sm:text-sm font-black animate-in fade-in flex items-center gap-2 shrink-0">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* CATEGORY FILTER CHIPS */}
        {(activeTab === 'auctions' || activeTab === 'featured' || activeTab === 'watchlist') && (
          <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar shrink-0">
            {[
              'All',
              'Haute Couture & Fine Jewelry',
              'Designer Saloon Attire',
              'Mastercrafted Card Decks',
              'Luxury Saloon Interiors',
              'Fine Heirloom Relics',
              'Sealed Treasury Vaults',
              'Rare Match Collectibles',
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  sounds.playClick();
                  setSelectedCategory(cat);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-amber-400 text-slate-950 shadow font-black'
                    : 'bg-slate-900/80 text-stone-300 border border-slate-800 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* MAIN BODY AREA */}
        <div className="flex-1 overflow-y-auto pr-1 py-2">
          {/* TAB: AUCTIONS / FEATURED / WATCHLIST */}
          {(activeTab === 'auctions' || activeTab === 'featured' || activeTab === 'watchlist') && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 pb-6">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    sounds.playClick();
                    setInspectItem(item);
                  }}
                  className="group bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-3.5 flex flex-col justify-between gap-2.5 shadow-md hover:shadow-xl transition duration-200 cursor-pointer relative overflow-hidden"
                >
                  {/* Top Header in Card */}
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        item.rarity === 'Mythic'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black'
                          : item.rarity === 'Legendary'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40'
                          : item.rarity === 'Epic'
                          ? 'bg-pink-500/20 text-pink-300 border border-pink-400/40'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-400/40'
                      }`}>
                        {item.rarity}
                      </span>

                      <div className="flex items-center gap-1">
                        {item.isNFT && (
                          <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-400/40 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" /> NFT
                          </span>
                        )}
                        <button
                          onClick={(e) => handleToggleWatchlist(item.id, e)}
                          className={`p-1 rounded-md transition ${
                            watchlistIds.includes(item.id)
                              ? 'text-pink-400 fill-pink-400'
                              : 'text-stone-500 hover:text-stone-300'
                          }`}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Graphic & Title */}
                    <div className="flex items-center gap-3 mt-2.5">
                      <div className="group-hover:scale-105 transition-transform shrink-0">
                        <ItemVisualGraphic item={item} size="md" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-black text-white group-hover:text-amber-300 transition truncate">
                          {item.name}
                        </h3>
                        {item.material ? (
                          <p className="text-[10px] text-amber-300/90 font-medium truncate flex items-center gap-1">
                            <span>✨</span>
                            <span>{item.material}</span>
                          </p>
                        ) : (
                          <p className="text-[10px] text-stone-400 font-mono truncate">
                            @{item.seller}
                          </p>
                        )}
                        {item.hallmark && (
                          <span className="text-[9px] text-stone-400 font-mono block truncate">
                            {item.hallmark}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-2.5 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[9px] text-stone-400 block font-bold">BID</span>
                        <span className="text-sm font-black text-amber-400">
                          ${item.currentBid.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-stone-400 block font-bold">ENDS IN</span>
                        <span className="text-xs font-black text-rose-400 flex items-center gap-1 justify-end font-mono">
                          <Clock className="w-3 h-3" />
                          {item.timeLeft}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePlaceBid(item, 50);
                        }}
                        className="py-1.5 px-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 rounded-xl text-xs font-black shadow transition active:scale-95 cursor-pointer text-center"
                      >
                        Bid +$50
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBuyNow(item);
                        }}
                        className="py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black shadow transition active:scale-95 cursor-pointer text-center"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB: LIST ASSET */}
          {activeTab === 'sell' && (
            <div className="max-w-2xl mx-auto bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <div>
                <h2 className="text-xl font-black text-white">Create Auction Listing</h2>
                <p className="text-xs text-stone-400">
                  List your rare cards, avatars, table felts, or collectibles on the public exchange.
                </p>
              </div>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                    Asset Title / Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={sellName}
                    onChange={(e) => setSellName(e.target.value)}
                    placeholder="e.g. Royal Lone Hand Diamond Deck"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                      Category
                    </label>
                    <select
                      value={sellCategory}
                      onChange={(e: any) => setSellCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Haute Couture & Fine Jewelry">Haute Couture & Fine Jewelry</option>
                      <option value="Designer Saloon Attire">Designer Saloon Attire</option>
                      <option value="Mastercrafted Card Decks">Mastercrafted Card Decks</option>
                      <option value="Luxury Saloon Interiors">Luxury Saloon Interiors</option>
                      <option value="Fine Heirloom Relics">Fine Heirloom Relics</option>
                      <option value="Sealed Treasury Vaults">Sealed Treasury Vaults</option>
                      <option value="Rare Match Collectibles">Rare Match Collectibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                      Rarity Tier
                    </label>
                    <select
                      value={sellRarity}
                      onChange={(e: any) => setSellRarity(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-bold text-white focus:outline-none focus:border-amber-400"
                    >
                      <option value="Common">Common</option>
                      <option value="Rare">Rare</option>
                      <option value="Epic">Epic</option>
                      <option value="Legendary">Legendary</option>
                      <option value="Mythic">Mythic (NFT Verified)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                      Starting Bid ($ Chips)
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={sellStartingBid}
                      onChange={(e) => setSellStartingBid(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                      Buy Now Instant Price ($ Chips)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={sellBuyNow}
                      onChange={(e) => setSellBuyNow(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-wider text-amber-400 block mb-1">
                    Description & Lore
                  </label>
                  <textarea
                    rows={3}
                    value={sellDescription}
                    onChange={(e) => setSellDescription(e.target.value)}
                    placeholder="Describe item history, finishes, custom animations..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black rounded-xl text-sm shadow-lg transition active:scale-95 cursor-pointer"
                >
                  🚀 Publish Auction to Marketplace
                </button>
              </form>
            </div>
          )}

          {/* TAB: SALOON REAL ESTATE DEEDS */}
          {activeTab === 'realestate' && (
            <div className="space-y-4 pb-6">
              {/* Uncollected Rents Summary Banner */}
              {totalPendingIncome > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 p-4 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-2xl">
                      💰
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white">Uncollected Saloon Estate Rents</h4>
                      <p className="text-xs text-emerald-300 font-bold">
                        +${totalPendingIncome.toLocaleString()} Chips available to claim right now
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playWin();
                      onCollectIncome(totalPendingIncome);
                      setFeedbackMsg(`💰 Collected $${totalPendingIncome.toLocaleString()} from your saloon estates!`);
                      setTimeout(() => setFeedbackMsg(null), 3000);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-lg transition active:scale-95 cursor-pointer"
                  >
                    Collect All Rents
                  </button>
                </div>
              )}

              {/* Real Estate Properties Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {propertyStatusList.map((prop) => (
                  <div
                    key={prop.id}
                    className={`bg-slate-900/90 border rounded-2xl p-5 flex flex-col justify-between gap-4 shadow-md transition duration-200 ${
                      prop.isOwned ? 'border-emerald-500/50' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                            {prop.icon}
                          </div>
                          <div>
                            <h4 className="text-base font-black text-white leading-tight">{prop.name}</h4>
                            <span className="text-xs text-stone-400 font-bold">{prop.townName}</span>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                          prop.isOwned
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                            : 'bg-slate-800 text-stone-400'
                        }`}>
                          {prop.isOwned ? `Level ${prop.level}` : 'Unowned'}
                        </span>
                      </div>

                      <div className="mt-4 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between font-bold">
                          <span className="text-stone-400">Hourly Income:</span>
                          <span className="text-amber-400 font-black">${prop.incomePerHour}/hr</span>
                        </div>
                        {prop.isOwned && (
                          <div className="flex justify-between font-bold">
                            <span className="text-stone-400">Uncollected Rent:</span>
                            <span className="text-emerald-400 font-black">+${prop.pendingChips.toLocaleString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between font-bold">
                          <span className="text-stone-400">Property Type:</span>
                          <span className="text-stone-300">{prop.type}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (prop.isOwned) {
                          onUpgradeProperty(prop);
                        } else {
                          onBuyProperty(prop);
                        }
                      }}
                      className={`w-full py-2.5 rounded-xl font-black text-xs shadow-md transition active:scale-95 cursor-pointer text-center ${
                        prop.isOwned
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950'
                          : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950'
                      }`}
                    >
                      {prop.isOwned
                        ? `Upgrade Deed ($${(prop.upgradeCost || prop.cost * 0.6).toLocaleString()})`
                        : `Acquire Deed ($${prop.cost.toLocaleString()})`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* INSPECT ITEM MODAL OVERLAY */}
        {inspectItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
            <div className="relative w-full max-w-xl bg-slate-900 border-2 border-amber-500/60 rounded-3xl p-6 text-white shadow-2xl space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-4">
                  <ItemVisualGraphic item={inspectItem} size="lg" />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950">
                        {inspectItem.rarity}
                      </span>
                      {inspectItem.edition && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          {inspectItem.edition}
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-black text-white">{inspectItem.name}</h3>
                    <span className="text-xs text-amber-400 font-bold">{inspectItem.category}</span>
                  </div>
                </div>
                <button
                  onClick={() => setInspectItem(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-stone-300 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Luxury Hallmark & Material Specification */}
              {(inspectItem.material || inspectItem.hallmark) && (
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 text-xs">
                  {inspectItem.material && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">PRECIOUS MATERIALS</span>
                      <span className="text-amber-200 font-semibold">{inspectItem.material}</span>
                    </div>
                  )}
                  {inspectItem.hallmark && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-stone-400 block">AUTHENTIC HALLMARK</span>
                      <span className="text-stone-300 font-mono">{inspectItem.hallmark}</span>
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-stone-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
                {inspectItem.description}
              </p>

              {/* Price & Bid Stats */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">CURRENT BID</span>
                  <span className="text-lg font-black text-amber-400">${inspectItem.currentBid.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">TIME REMAINING</span>
                  <span className="text-sm font-black text-rose-400">{inspectItem.timeLeft}</span>
                </div>
              </div>

              {/* Bid History Log */}
              {inspectItem.bidHistory && inspectItem.bidHistory.length > 0 && (
                <div>
                  <span className="text-[10px] font-black uppercase text-stone-400 tracking-wider block mb-1">
                    Live Bidding History
                  </span>
                  <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-xl border border-slate-800 text-xs font-mono">
                    {inspectItem.bidHistory.map((h, i) => (
                      <div key={i} className="flex justify-between items-center text-stone-300 py-0.5">
                        <span className="font-bold text-amber-300">@{h.bidder}</span>
                        <span className="text-emerald-400 font-black">${h.amount.toLocaleString()}</span>
                        <span className="text-stone-500 text-[10px]">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => handlePlaceBid(inspectItem, 50)}
                  className="py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black rounded-xl text-xs hover:from-amber-400 hover:to-yellow-400 transition cursor-pointer"
                >
                  Place Bid (+ $50)
                </button>
                <button
                  onClick={() => handleBuyNow(inspectItem)}
                  className="py-3 bg-emerald-500 text-slate-950 font-black rounded-xl text-xs hover:bg-emerald-400 transition cursor-pointer"
                >
                  Instant Buy Now (${(inspectItem.buyNowPrice || inspectItem.currentBid * 1.5).toLocaleString()})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
