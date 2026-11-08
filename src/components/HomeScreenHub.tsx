import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { FAQ_QUESTIONS } from './FAQModal';
import { FooterInfoModal, FooterSectionType } from './FooterInfoModal';
import {
  ShoppingBag,
  Gavel,
  Layers,
  Users,
  User,
  Swords,
  MapPin,
  BookOpen,
  Sparkles,
  Trophy,
  Award,
  Music,
  Settings,
  HelpCircle,
  Play,
  Volume2,
  VolumeX,
  ChevronDown,
  X,
  Bot,
  Dices,
  Smartphone,
  Globe,
  Send,
  MessageCircle,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

// Custom Chess Pawn Icon matching the user's reference image format
const PawnIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Round Head */}
    <circle cx="12" cy="5" r="2.8" />
    {/* Neck Collar */}
    <path d="M8.5 9h7c.4 0 .7.3.7.7s-.3.7-.7.7h-7c-.4 0-.7-.3-.7-.7s.3-.7.7-.7z" />
    {/* Body / Waist */}
    <path d="M9.8 11c-.3 2.5-1.7 5.2-2.5 7h9.4c-.8-1.8-2.2-4.5-2.5-7h-4.4z" />
    {/* Tiered Base */}
    <rect x="6" y="18.8" width="12" height="1.8" rx="0.6" />
    <rect x="4.8" y="21.2" width="14.4" height="1.5" rx="0.5" />
  </svg>
);

// Variations Layers Icon matching the card format
const VariationsIcon: React.FC<{ className?: string }> = ({ className = 'w-7 h-7' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d="M2 17l10 5 10-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </svg>
);

interface HomeScreenHubProps {
  playerProfile: PlayerProfile;
  selectedTown: TownLocation;
  mainMenuTheme?: string;
  onOpenThemes?: () => void;
  onStartGame: () => void;
  onOpenMap: () => void;
  onOpenCalendar: () => void;
  onOpenShop: () => void;
  onOpenRules: () => void;
  onOpenHats: () => void;
  onOpenProfile: () => void;
  onOpenProperties: () => void;
  onOpenHamburger: () => void;
  onOpenMusic?: () => void;
  onOpenLiveVideo?: () => void;
  onOpenSettings?: () => void;
  onOpenFAQ?: () => void;
  onOpenDailyDice?: () => void;
  onOpenLeaderboard?: () => void;
  onOpenProgression?: () => void;
  onOpenCampaign?: () => void;
  onOpenSinglePlayer?: () => void;
  onOpenMultiplayer?: () => void;
  onOpenSlots?: () => void;
  onOpenAssistant?: () => void;
  onUpdateProfile?: (updated: PlayerProfile) => void;
  onlineNow?: number;
  allTimeVisitors?: number;
}

const MAIN_MENU_THEME_STYLES: Record<
  string,
  {
    bgClass: string;
    imageUrl?: string;
    overlayGradient: string;
    accentGlow: string;
    badgeStyle: string;
    themeTitle: string;
    motif: string;
  }
> = {
  main_menu_1: {
    bgClass: 'bg-[#18110a]',
    imageUrl: '/themes/main_menu_1.jpg',
    overlayGradient: 'from-amber-950/40 via-black/40 to-stone-950/80',
    accentGlow: 'text-amber-400',
    badgeStyle: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    themeTitle: 'Stamped Parchment Card Suits',
    motif: '♠️ ♥️ ♦️ ♣️',
  },
  main_menu_2: {
    bgClass: 'bg-[#080d1a]',
    imageUrl: '/themes/main_menu_2.jpg',
    overlayGradient: 'from-blue-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-blue-400',
    badgeStyle: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    themeTitle: 'Victorian Navy Damask & Filigree',
    motif: '⚜️ 💎 ♠️ 👑',
  },
  main_menu_3: {
    bgClass: 'bg-[#1a0c0a]',
    imageUrl: '/themes/main_menu_3.jpg',
    overlayGradient: 'from-red-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-red-400',
    badgeStyle: 'bg-red-500/20 border-red-500/30 text-red-300',
    themeTitle: 'Scottish Highland Tartan Plaid',
    motif: '🧣 🌲 🍂 ☕',
  },
  main_menu_4: {
    bgClass: 'bg-[#180f08]',
    imageUrl: '/themes/main_menu_4.jpg',
    overlayGradient: 'from-amber-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-amber-400',
    badgeStyle: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    themeTitle: 'Jack Leather Diamond Lattice',
    motif: '🃏 👑 🗡️ ♠️',
  },
  main_menu_5: {
    bgClass: 'bg-[#0a101d]',
    imageUrl: '/themes/main_menu_5.jpg',
    overlayGradient: 'from-blue-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
    themeTitle: 'Midnight Porch Lanterns & Lake',
    motif: '🏮 🌌 🌲 🌙',
  },
  main_menu_6: {
    bgClass: 'bg-[#090d18]',
    imageUrl: '/themes/main_menu_6.jpg',
    overlayGradient: 'from-slate-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-sky-300',
    badgeStyle: 'bg-sky-500/20 border-sky-500/30 text-sky-200',
    themeTitle: 'Moonlit Lake Cabin & Cards',
    motif: '🏡 🌙 🌲 🂡',
  },
  main_menu_7: {
    bgClass: 'bg-[#1a080d]',
    imageUrl: '/themes/main_menu_7.jpg',
    overlayGradient: 'from-rose-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-rose-400',
    badgeStyle: 'bg-rose-500/20 border-rose-500/30 text-rose-200',
    themeTitle: 'Regal Crimson Brocade & Royalty',
    motif: '👑 🍷 ⚜️ 💎',
  },
  main_menu_8: {
    bgClass: 'bg-[#181108]',
    imageUrl: '/themes/main_menu_8.jpg',
    overlayGradient: 'from-amber-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-400',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    themeTitle: 'Carved Gold & Walnut Battleaxe Kings',
    motif: '🪓 👑 🥇 ⚔️',
  },
  main_menu_9: {
    bgClass: 'bg-[#0d0d12]',
    imageUrl: '/themes/main_menu_9.jpg',
    overlayGradient: 'from-stone-950/70 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
    themeTitle: 'Midnight Baroque Aces & Gold Cartouches',
    motif: '🂡 🂱 🃁 🃑',
  },
  main_menu_10: {
    bgClass: 'bg-[#150f08]',
    imageUrl: '/themes/main_menu_10.jpg',
    overlayGradient: 'from-amber-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
    themeTitle: 'Gilded Saloon Royalty Tapestry',
    motif: '🏛️ 👑 🏮 🌟',
  },
  // Backwards compatibility aliases
  theme_1: {
    bgClass: 'bg-[#18110a]',
    imageUrl: '/themes/main_menu_1.jpg',
    overlayGradient: 'from-amber-950/40 via-black/40 to-stone-950/80',
    accentGlow: 'text-amber-400',
    badgeStyle: 'bg-amber-500/10 border-amber-500/20 text-amber-300',
    themeTitle: 'Stamped Parchment Card Suits',
    motif: '♠️ ♥️ ♦️ ♣️',
  },
  theme_2: {
    bgClass: 'bg-[#080d1a]',
    imageUrl: '/themes/main_menu_2.jpg',
    overlayGradient: 'from-blue-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-blue-400',
    badgeStyle: 'bg-blue-500/20 border-blue-500/40 text-blue-300',
    themeTitle: 'Victorian Navy Damask & Filigree',
    motif: '⚜️ 💎 ♠️ 👑',
  },
  theme_3: {
    bgClass: 'bg-[#1a0c0a]',
    imageUrl: '/themes/main_menu_3.jpg',
    overlayGradient: 'from-red-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-red-400',
    badgeStyle: 'bg-red-500/20 border-red-500/30 text-red-300',
    themeTitle: 'Scottish Highland Tartan Plaid',
    motif: '🧣 🌲 🍂 ☕',
  },
  theme_4: {
    bgClass: 'bg-[#180f08]',
    imageUrl: '/themes/main_menu_4.jpg',
    overlayGradient: 'from-amber-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-amber-400',
    badgeStyle: 'bg-amber-500/20 border-amber-500/30 text-amber-300',
    themeTitle: 'Jack Leather Diamond Lattice',
    motif: '🃏 👑 🗡️ ♠️',
  },
  theme_5: {
    bgClass: 'bg-[#0a101d]',
    imageUrl: '/themes/main_menu_5.jpg',
    overlayGradient: 'from-blue-950/50 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
    themeTitle: 'Midnight Porch Lanterns & Lake',
    motif: '🏮 🌌 🌲 🌙',
  },
  theme_6: {
    bgClass: 'bg-[#090d18]',
    imageUrl: '/themes/main_menu_6.jpg',
    overlayGradient: 'from-slate-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-sky-300',
    badgeStyle: 'bg-sky-500/20 border-sky-500/30 text-sky-200',
    themeTitle: 'Moonlit Lake Cabin & Cards',
    motif: '🏡 🌙 🌲 🂡',
  },
  theme_7: {
    bgClass: 'bg-[#1a080d]',
    imageUrl: '/themes/main_menu_7.jpg',
    overlayGradient: 'from-rose-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-rose-400',
    badgeStyle: 'bg-rose-500/20 border-rose-500/30 text-rose-200',
    themeTitle: 'Regal Crimson Brocade & Royalty',
    motif: '👑 🍷 ⚜️ 💎',
  },
  theme_8: {
    bgClass: 'bg-[#181108]',
    imageUrl: '/themes/main_menu_8.jpg',
    overlayGradient: 'from-amber-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-400',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300',
    themeTitle: 'Carved Gold & Walnut Battleaxe Kings',
    motif: '🪓 👑 🥇 ⚔️',
  },
  theme_9: {
    bgClass: 'bg-[#0d0d12]',
    imageUrl: '/themes/main_menu_9.jpg',
    overlayGradient: 'from-stone-950/70 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-200',
    themeTitle: 'Midnight Baroque Aces & Gold Cartouches',
    motif: '🂡 🂱 🃁 🃑',
  },
  theme_10: {
    bgClass: 'bg-[#150f08]',
    imageUrl: '/themes/main_menu_10.jpg',
    overlayGradient: 'from-amber-950/60 via-black/40 to-stone-950/80',
    accentGlow: 'text-yellow-300',
    badgeStyle: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-200',
    themeTitle: 'Gilded Saloon Royalty Tapestry',
    motif: '🏛️ 👑 🏮 🌟',
  },
};

interface ActionCardDef {
  id: string;
  title: string;
  subtitle: string;
  color: string;
  brightness: number;
  icon: any;
  tag?: string;
  actionType: string;
  isLiveVideo?: boolean;
  isVariationsDropdown?: boolean;
  isPlayersDropdown?: boolean;
}

export const HomeScreenHub: React.FC<HomeScreenHubProps> = ({
  playerProfile,
  selectedTown,
  mainMenuTheme = 'theme_1',
  onOpenThemes,
  onStartGame,
  onOpenMap,
  onOpenCalendar,
  onOpenShop,
  onOpenRules,
  onOpenHats,
  onOpenProfile,
  onOpenProperties,
  onOpenHamburger,
  onOpenMusic,
  onOpenLiveVideo,
  onOpenSettings,
  onOpenFAQ,
  onOpenDailyDice,
  onOpenLeaderboard,
  onOpenProgression,
  onOpenCampaign,
  onOpenSinglePlayer,
  onOpenMultiplayer,
  onOpenSlots,
  onOpenAssistant,
  onUpdateProfile,
  onlineNow = 1,
  allTimeVisitors = 1,
}) => {
  const activeTheme = MAIN_MENU_THEME_STYLES[mainMenuTheme] || MAIN_MENU_THEME_STYLES.theme_1;

  // Dropdown States for Variations & Players
  const [selectedVariation, setSelectedVariation] = useState('Classic Euchre');
  const [selectedPlayersCount, setSelectedPlayersCount] = useState('2 Players');
  const [columnCount, setColumnCount] = useState<1 | 2 | 4>(4);
  const [footerModalSection, setFooterModalSection] = useState<FooterSectionType | null>(null);

  const variationOptions = [
    'Classic Euchre',
    'Bid Euchre (10-A)',
    'Pepper Euchre',
    "Loner's Paradise",
    'Stick the Dealer',
    '3-Player Cutthroat',
  ];

  const playersOptions = [
    '2 Players',
    '4 Players',
    '3 Players',
    '6 Players',
    '8 Players',
  ];

  const INITIAL_CARDS: ActionCardDef[] = [
    {
      id: 'live_video',
      title: 'Live',
      subtitle: 'Tables happening now',
      color: 'bg-[#e11d23] border-red-500/80 shadow-[0_10px_30px_rgba(225,29,35,0.4)]',
      brightness: 95,
      icon: Play,
      actionType: 'open_live_video',
      isLiveVideo: true,
    },
    {
      id: 'live_shop',
      title: 'Shop',
      subtitle: 'Sovereigns, Coins & Gold',
      color: 'bg-gradient-to-br from-emerald-500 to-teal-700 border-emerald-400/50',
      brightness: 85,
      icon: ShoppingBag,
      actionType: 'open_shop',
    },
    {
      id: 'auctions',
      title: 'Auctions',
      subtitle: 'Rare Euchre Decks & Relics',
      color: 'bg-gradient-to-br from-amber-500 to-yellow-600 border-amber-400/50',
      brightness: 90,
      icon: Gavel,
      tag: 'BID',
      actionType: 'open_properties',
    },
    {
      id: 'variations',
      title: 'Variations',
      subtitle: selectedVariation,
      color: 'bg-[#1d60ea] border-2 border-[#38f8ac] shadow-[0_10px_30px_rgba(29,96,234,0.4)]',
      brightness: 100,
      icon: Layers,
      actionType: 'variations_dropdown',
      isVariationsDropdown: true,
    },
    {
      id: 'players',
      title: 'Players',
      subtitle: selectedPlayersCount,
      color: 'bg-[#1d60ea] border-2 border-[#38f8ac] shadow-[0_10px_30px_rgba(29,96,234,0.4)]',
      brightness: 100,
      icon: Users,
      actionType: 'players_dropdown',
      isPlayersDropdown: true,
    },
    {
      id: 'single_player',
      title: 'Single Player',
      subtitle: 'vs Partner & AI Saloon Bots',
      color: 'bg-gradient-to-br from-blue-600 to-sky-700 border-blue-400/50',
      brightness: 65,
      icon: Users,
      tag: '4 PLAYERS',
      actionType: 'open_single_player',
    },
    {
      id: 'multiplayer',
      title: 'Multiplayer',
      subtitle: 'Euchre Online Saloon Tables',
      color: 'bg-gradient-to-br from-indigo-600 to-purple-800 border-indigo-400/50',
      brightness: 50,
      icon: Swords,
      tag: 'ONLINE',
      actionType: 'open_multiplayer',
    },
    {
      id: 'campaign',
      title: 'Campaign',
      subtitle: 'Towns, 3D Saloons & Boss Duels',
      color: 'bg-gradient-to-br from-orange-500 to-amber-700 border-orange-400/50',
      brightness: 80,
      icon: MapPin,
      tag: '10 CITIES',
      actionType: 'open_campaign',
    },
    {
      id: 'rules_guide',
      title: 'Rules Guide',
      subtitle: 'Trump, Bowers & Loner Points',
      color: 'bg-gradient-to-br from-green-600 to-emerald-800 border-green-400/50',
      brightness: 70,
      icon: BookOpen,
      actionType: 'open_rules',
    },
    {
      id: 'themes',
      title: 'Themes',
      subtitle: '3D Hats & Oil Painted Felts',
      color: 'bg-gradient-to-br from-pink-500 to-rose-700 border-pink-400/50',
      brightness: 82,
      icon: Sparkles,
      actionType: 'open_hats',
    },
    {
      id: 'leaderboard',
      title: 'Leaderboard',
      subtitle: 'Top Sovereign Champions',
      color: 'bg-gradient-to-br from-yellow-500 to-amber-600 border-yellow-400/50',
      brightness: 92,
      icon: Trophy,
      actionType: 'open_leaderboard',
    },
    {
      id: 'achievements',
      title: 'Achievements & Awards',
      subtitle: '25 Tasks, Awards & Prestige',
      color: 'bg-gradient-to-br from-lime-500 to-emerald-700 border-lime-400/50',
      brightness: 88,
      icon: Award,
      actionType: 'open_progression',
    },
    {
      id: 'profile',
      title: 'Profile',
      subtitle: 'Level 1 Character Dossier',
      color: 'bg-gradient-to-br from-violet-600 to-purple-800 border-violet-400/50',
      brightness: 55,
      icon: User,
      actionType: 'open_profile',
    },
    {
      id: 'music',
      title: 'Music',
      subtitle: 'Country Saloon Jukebox',
      color: 'bg-gradient-to-br from-fuchsia-600 to-pink-800 border-fuchsia-400/50',
      brightness: 68,
      icon: Music,
      actionType: 'open_music',
    },
    {
      id: 'settings',
      title: 'Settings',
      subtitle: 'Audio, Visuals & Camera Angle',
      color: 'bg-gradient-to-br from-slate-600 to-zinc-800 border-slate-400/50',
      brightness: 40,
      icon: Settings,
      actionType: 'open_settings',
    },
    {
      id: 'faq',
      title: 'FAQ',
      subtitle: 'Pro Euchre Strategy & Tips',
      color: 'bg-gradient-to-br from-sky-700 to-blue-900 border-sky-400/50',
      brightness: 45,
      icon: HelpCircle,
      actionType: 'open_faq',
    },
  ];

  // Ordered Card List State
  const [cardsOrder, setCardsOrder] = useState<string[]>(INITIAL_CARDS.map((c) => c.id));
  const [cardUsage, setCardUsage] = useState<Record<string, number>>({});

  // Sort States & Sequences
  const [activeSort, setActiveSort] = useState<'default' | 'use' | 'name' | 'color' | 'custom'>('default');
  const [lastOrderBeforeDefault, setLastOrderBeforeDefault] = useState<string[]>(INITIAL_CARDS.map((c) => c.id));
  const [consecutiveDefaultClicks, setConsecutiveDefaultClicks] = useState<number>(0);
  const [consecutiveUseClicks, setConsecutiveUseClicks] = useState<number>(0);
  const [consecutiveNameClicks, setConsecutiveNameClicks] = useState<number>(0);
  const [consecutiveColorClicks, setConsecutiveColorClicks] = useState<number>(0);

  // Drag and Drop state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Inline FAQ Dropdown State
  const [inlineFAQOpen, setInlineFAQOpen] = useState(false);
  const [expandedFAQId, setExpandedFAQId] = useState<number | null>(1);

  // Map of Card definitions
  const cardMap = new Map<string, ActionCardDef>(INITIAL_CARDS.map((c) => [c.id, c]));

  // Handle Card Click Action & Usage Increment
  const handleCardClick = (card: ActionCardDef) => {
    sounds.playClick();
    setCardUsage((prev) => ({
      ...prev,
      [card.id]: (prev[card.id] || 0) + 1,
    }));

    switch (card.actionType) {
      case 'start_game':
        onStartGame();
        break;
      case 'open_single_player':
        if (onOpenSinglePlayer) onOpenSinglePlayer();
        else onStartGame();
        break;
      case 'open_multiplayer':
        if (onOpenMultiplayer) onOpenMultiplayer();
        else onStartGame();
        break;
      case 'open_campaign':
        if (onOpenCampaign) onOpenCampaign();
        else onStartGame();
        break;
      case 'open_progression':
        if (onOpenProgression) onOpenProgression();
        else onOpenProfile();
        break;
      case 'open_live_video':
        if (onOpenLiveVideo) onOpenLiveVideo();
        break;
      case 'open_map':
        if (onOpenCampaign) onOpenCampaign();
        else onOpenMap();
        break;
      case 'open_calendar':
        if (onOpenCalendar) onOpenCalendar();
        break;
      case 'open_shop':
        if (onOpenShop) onOpenShop();
        break;
      case 'open_rules':
        if (onOpenRules) onOpenRules();
        break;
      case 'open_hats':
        if (onOpenHats) onOpenHats();
        break;
      case 'open_profile':
        if (onOpenProfile) onOpenProfile();
        break;
      case 'open_properties':
        if (onOpenProperties) onOpenProperties();
        break;
      case 'open_music':
        if (onOpenMusic) onOpenMusic();
        else onOpenHamburger();
        break;
      case 'open_hamburger':
        if (onOpenHamburger) onOpenHamburger();
        break;
      case 'open_settings':
        if (onOpenSettings) onOpenSettings();
        else onOpenHamburger();
        break;
      case 'open_faq':
        setInlineFAQOpen((prev) => !prev);
        break;
      case 'open_leaderboard':
        if (onOpenLeaderboard) onOpenLeaderboard();
        else onOpenProfile();
        break;
      default:
        break;
    }
  };

  // Sort Click Handler
  const handleSortClick = (sortType: 'default' | 'use' | 'name' | 'color') => {
    sounds.playClick();
    setActiveSort(sortType);

    if (sortType === 'default') {
      setConsecutiveUseClicks(0);
      setConsecutiveNameClicks(0);
      setConsecutiveColorClicks(0);

      const nextCount = consecutiveDefaultClicks + 1;
      setConsecutiveDefaultClicks(nextCount);

      if (nextCount === 1) {
        setLastOrderBeforeDefault([...cardsOrder]);
        setCardsOrder(INITIAL_CARDS.map((c) => c.id));
      } else if (nextCount % 2 === 1) {
        setCardsOrder(INITIAL_CARDS.map((c) => c.id));
      } else {
        setCardsOrder([...lastOrderBeforeDefault]);
      }
    } else if (sortType === 'use') {
      setConsecutiveDefaultClicks(0);
      setConsecutiveNameClicks(0);
      setConsecutiveColorClicks(0);

      const nextCount = consecutiveUseClicks + 1;
      setConsecutiveUseClicks(nextCount);

      const sorted = [...cardsOrder].sort((a, b) => {
        const usageA = cardUsage[a] || 0;
        const usageB = cardUsage[b] || 0;
        return nextCount % 2 === 1 ? usageB - usageA : usageA - usageB;
      });
      setCardsOrder(sorted);
    } else if (sortType === 'name') {
      setConsecutiveDefaultClicks(0);
      setConsecutiveUseClicks(0);
      setConsecutiveColorClicks(0);

      const nextCount = consecutiveNameClicks + 1;
      setConsecutiveNameClicks(nextCount);

      const sorted = [...cardsOrder].sort((a, b) => {
        const titleA = cardMap.get(a)?.title || '';
        const titleB = cardMap.get(b)?.title || '';
        return nextCount % 2 === 1 ? titleA.localeCompare(titleB) : titleB.localeCompare(titleA);
      });
      setCardsOrder(sorted);
    } else if (sortType === 'color') {
      setConsecutiveDefaultClicks(0);
      setConsecutiveUseClicks(0);
      setConsecutiveNameClicks(0);

      const nextCount = consecutiveColorClicks + 1;
      setConsecutiveColorClicks(nextCount);

      const sorted = [...cardsOrder].sort((a, b) => {
        const brightA = cardMap.get(a)?.brightness || 50;
        const brightB = cardMap.get(b)?.brightness || 50;
        return nextCount % 2 === 1 ? brightB - brightA : brightA - brightB;
      });
      setCardsOrder(sorted);
    }
  };

  const handleDragStart = (id: string) => {
    setDraggedCardId(id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetId: string) => {
    if (!draggedCardId || draggedCardId === targetId) return;
    const newOrder = [...cardsOrder];
    const dragIdx = newOrder.indexOf(draggedCardId);
    const targetIdx = newOrder.indexOf(targetId);

    newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, draggedCardId);

    setCardsOrder(newOrder);
    setActiveSort('custom');
    setConsecutiveDefaultClicks(0);
    setDraggedCardId(null);
  };

  return (
    <div
      className={`relative w-full min-h-screen ${activeTheme.bgClass} text-white flex flex-col items-center justify-between overflow-x-hidden transition-colors duration-500`}
      style={
        activeTheme.imageUrl
          ? {
              backgroundImage: `url(${activeTheme.imageUrl})`,
              backgroundRepeat: 'repeat',
              backgroundSize: '280px 280px',
            }
          : undefined
      }
    >
      {/* Dark Tint Overlay for Optimal Card Readability */}
      <div className="absolute inset-0 bg-stone-950/80 pointer-events-none backdrop-blur-[0.5px]" />

      {/* Background Gradient & Motif Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-b ${activeTheme.overlayGradient} pointer-events-none`}
      />
      <div className="absolute top-12 right-12 text-6xl opacity-15 select-none pointer-events-none font-serif font-black">
        {activeTheme.motif}
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 pt-8 flex-1 flex flex-col items-center">
        {/* Hero Title & Subtitle */}
        <div className="text-center my-4 max-w-3xl relative z-10">
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight mt-2 bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent drop-shadow-md">
          Euchre <span className="text-amber-400">Everything</span>
        </h1>
        <p className="text-stone-400 text-xs sm:text-sm mt-1 font-medium">
          Call Trump, take tricks & conquer campaign cities in Euchre Paradise!
        </p>
      </div>

      {/* Top Control Bar: Sort Filter */}
      <div className="w-full max-w-6xl mb-4 flex items-center justify-between bg-[#0f1426] border border-slate-800 p-2 rounded-2xl shadow-xl">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-black uppercase text-amber-400 px-3">SORT:</span>
          {[
            { id: 'default', label: 'default' },
            { id: 'use', label: 'use' },
            { id: 'name', label: 'name' },
            { id: 'color', label: 'color' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleSortClick(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black capitalize transition ${
                activeSort === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-stone-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Action Cards */}
      <div
        className={`w-full max-w-6xl grid ${
          columnCount === 1
            ? 'grid-cols-1'
            : columnCount === 2
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'
        } gap-3 sm:gap-4 mb-6`}
      >
        {cardsOrder.map((id) => {
          const card = cardMap.get(id);
          if (!card) return null;
          const Icon = card.icon;

          return (
            <div key={card.id} className="relative flex flex-col w-full">
              <div
                draggable
                onDragStart={() => handleDragStart(card.id)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(card.id)}
                onClick={() => {
                  if (!card.isVariationsDropdown && !card.isPlayersDropdown) {
                    handleCardClick(card);
                  }
                }}
                className={`relative w-full aspect-square rounded-3xl p-3 sm:p-4 border ${card.color} shadow-2xl flex flex-col items-center justify-between text-center transition-all duration-200 hover:-translate-y-1 group overflow-hidden cursor-grab active:cursor-grabbing`}
              >
                {card.tag && (
                  <span className="absolute top-2.5 right-2.5 bg-black/60 border border-white/20 text-[9px] font-black uppercase text-white px-2 py-0.5 rounded-full backdrop-blur-sm z-10">
                    {card.tag}
                  </span>
                )}

                {/* Live Button Card matching Image 1 */}
                {card.isLiveVideo ? (
                  <div
                    onClick={onOpenLiveVideo}
                    className="relative w-full h-full flex flex-col items-center justify-between cursor-pointer p-3 select-none"
                  >
                    {/* Glass Glossy Arc Top Left */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-md pointer-events-none" />

                    {/* Top Right LIVE Tag matching Image 1 */}
                    <div className="w-full flex justify-end">
                      <span className="bg-[#331418]/60 text-white font-black text-[9px] px-2.5 py-0.5 rounded-md uppercase tracking-wider backdrop-blur-sm border border-white/10">
                        LIVE
                      </span>
                    </div>

                    {/* Center White Card Icon with Ace of Spades (A♠) */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 bg-[#fffdfa] rounded-xl shadow-2xl flex flex-col items-center justify-center my-auto group-hover:scale-105 transition-transform border border-amber-100/80 -rotate-3">
                      <div className="font-serif font-black text-slate-900 text-2xl sm:text-3xl flex items-center tracking-tighter">
                        <span>A</span>
                        <span className="text-xl sm:text-2xl ml-0.5 text-slate-900">♠</span>
                      </div>
                    </div>

                    {/* Card Title & Subtitle */}
                    <div className="text-center w-full">
                      <h3 className="font-black text-base sm:text-lg text-white tracking-tight leading-tight">
                        Live
                      </h3>
                      <p className="text-[10px] sm:text-[11px] text-white/90 font-medium mt-0.5">
                        Tables happening now
                      </p>
                    </div>
                  </div>
                ) : card.isVariationsDropdown ? (
                  /* VARIATIONS DROPDOWN CARD MATCHING IMAGE FORMAT */
                  <div className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer select-none">
                    {/* Glossy arc highlight top-left corner */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-md pointer-events-none" />

                    {/* Centered Icon & Texts */}
                    <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
                      <div className="text-white drop-shadow mb-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <VariationsIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow" />
                      </div>
                      <h3 className="font-black text-base sm:text-lg text-white tracking-wide leading-tight drop-shadow-sm">
                        Variations
                      </h3>
                      <p className="text-xs sm:text-sm text-white font-bold tracking-normal mt-0.5 drop-shadow-sm">
                        {selectedVariation}
                      </p>
                    </div>

                    {/* Bottom-right solid white downward triangle */}
                    <div className="absolute bottom-1 right-1 text-white pointer-events-none select-none z-10 p-1">
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                        <path d="M0 0l5 7 5-7z" />
                      </svg>
                    </div>

                    {/* Full Card Native Select */}
                    <select
                      value={selectedVariation}
                      onChange={(e) => {
                        sounds.playClick();
                        setSelectedVariation(e.target.value);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                      title="Select Variation"
                    >
                      {variationOptions.map((v) => (
                        <option key={v} value={v} className="bg-blue-900 text-white font-bold">
                          {v}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : card.isPlayersDropdown ? (
                  /* PLAYERS DROPDOWN CARD MATCHING IMAGE FORMAT */
                  <div className="relative w-full h-full flex flex-col items-center justify-center cursor-pointer select-none">
                    {/* Glossy arc highlight top-left corner */}
                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/20 rounded-full blur-md pointer-events-none" />

                    {/* Centered Icon & Texts */}
                    <div className="flex flex-col items-center justify-center my-auto z-10 text-center">
                      <div className="text-white drop-shadow mb-1.5 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <PawnIcon className="w-7 h-7 sm:w-8 sm:h-8 fill-white text-white drop-shadow" />
                      </div>
                      <h3 className="font-black text-base sm:text-lg text-white tracking-wide leading-tight drop-shadow-sm">
                        Players
                      </h3>
                      <p className="text-xs sm:text-sm text-white font-bold tracking-normal mt-0.5 drop-shadow-sm">
                        {selectedPlayersCount}
                      </p>
                    </div>

                    {/* Bottom-right solid white downward triangle */}
                    <div className="absolute bottom-1 right-1 text-white pointer-events-none select-none z-10 p-1">
                      <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 fill-white">
                        <path d="M0 0l5 7 5-7z" />
                      </svg>
                    </div>

                    {/* Full Card Native Select */}
                    <select
                      value={selectedPlayersCount}
                      onChange={(e) => {
                        sounds.playClick();
                        setSelectedPlayersCount(e.target.value);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
                      title="Select Players Count"
                    >
                      {playersOptions.map((p) => (
                        <option key={p} value={p} className="bg-blue-900 text-white font-bold">
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white my-auto group-hover:scale-110 transition shadow-lg">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>

                    <div className="w-full text-center mt-auto">
                      <h3 className="font-black text-xs sm:text-sm text-white tracking-wide leading-tight">
                        {card.title}
                      </h3>
                      <p className="text-[9px] sm:text-[11px] text-white/80 font-medium mt-0.5 truncate max-w-full">
                        {card.subtitle}
                      </p>
                    </div>

                    {/* Bottom-right solid white downward triangle for FAQ just like Variations and Players */}
                    {card.id === 'faq' && (
                      <div className="absolute bottom-1 right-1 text-white pointer-events-none select-none z-10 p-1">
                        <svg viewBox="0 0 10 8" className={`w-2.5 h-2.5 fill-white transition-transform duration-200 ${inlineFAQOpen ? 'rotate-180' : ''}`}>
                          <path d="M0 0l5 7 5-7z" />
                        </svg>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* INLINE FAQ DROPDOWN PANEL (Exact same width as button itself) */}
              {card.id === 'faq' && inlineFAQOpen && (
                <div className="w-full bg-[#0d1c38] border-2 border-sky-400/80 rounded-2xl p-3 my-2 text-white flex flex-col gap-2.5 shadow-2xl animate-in slide-in-from-top-2 duration-200 z-30">
                  <div className="flex items-center justify-between pb-1.5 border-b border-sky-500/30">
                    <span className="text-[9px] font-black uppercase tracking-widest text-sky-300">
                      FAQ (25 QUESTIONS)
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setInlineFAQOpen(false);
                      }}
                      className="w-5 h-5 rounded-full bg-sky-950 hover:bg-sky-900 border border-sky-400/50 text-white flex items-center justify-center transition"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  {/* 25 Accordion Questions Direct List */}
                  <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                    {FAQ_QUESTIONS.map((q) => {
                      const isExpanded = expandedFAQId === q.id;
                      return (
                        <div key={q.id} className="flex flex-col">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              sounds.playClick();
                              setExpandedFAQId(isExpanded ? null : q.id);
                            }}
                            className={`w-full p-2 rounded-xl flex items-center justify-between text-left transition ${
                              isExpanded
                                ? 'bg-sky-800/90 border-2 border-amber-400 shadow-md'
                                : 'bg-[#091428] hover:bg-sky-900/60 border border-sky-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 pr-1">
                              <div className="w-4 h-4 rounded-full bg-amber-400 text-stone-950 font-black text-[9px] flex items-center justify-center shrink-0 shadow">
                                {q.id}
                              </div>
                              <span className="font-bold text-[11px] text-white leading-tight">
                                {q.question}
                              </span>
                            </div>
                            <span className="text-[9px] font-bold text-amber-300 shrink-0">
                              {isExpanded ? '▲' : '▼'}
                            </span>
                          </button>

                          {isExpanded && (
                            <div className="mt-1 p-2 bg-[#050b18] border border-sky-500/40 rounded-xl text-[11px] text-sky-100 leading-relaxed font-medium shadow-inner">
                              <div className="text-[9px] font-black uppercase text-amber-400 mb-0.5">
                                ANSWER ({q.level} Level):
                              </div>
                              <p>{q.answer}</p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Column Toggle Control right above Online Now & All-Time Visitors */}
      <div className="w-full max-w-md mx-auto mb-4 flex items-center justify-between bg-[#090e1c] border border-slate-800 rounded-2xl p-3 shadow-xl">
        <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
          <span>COLUMNS:</span>
        </span>
        <div className="flex items-center gap-1.5 bg-[#030712] border border-slate-800 p-1 rounded-xl">
          {[1, 2, 4].map((num) => (
            <button
              key={num}
              onClick={() => setColumnCount(num as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition ${
                columnCount === num
                  ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                  : 'text-stone-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {num} {num === 1 ? 'Col' : 'Cols'}
            </button>
          ))}
        </div>
      </div>
      </div>

      {/* ========================================================================= */}
      {/* FOOTER: 6 Categorical Columns, Language Selector, Mobile App Downloads */}
      {/* Edge-to-edge full width covering the entire bottom section of the homepage */}
      {/* ========================================================================= */}
      <footer className="w-full bg-[#070c1b] border-t border-slate-800 relative z-20 mt-12 py-10 px-4 sm:px-8 lg:px-12 text-left select-text shadow-2xl flex flex-col items-center">
        <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
          {/* Counters: ONLINE NOW and ALL-TIME VISITORS (apart of footer, above footer titles & links) */}
          <div className="w-full flex flex-col items-center justify-center gap-7 pb-4">
            {/* 1. ONLINE NOW */}
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 mb-2.5 drop-shadow-sm">
                ONLINE NOW
              </span>
              <div className="inline-flex border border-slate-700/80 bg-black/95 shadow-2xl overflow-hidden divide-x divide-slate-700/80">
                {(onlineNow ?? 1)
                  .toString()
                  .padStart(8, '0')
                  .split('')
                  .map((digit, i, arr) => {
                    const isLast = i === arr.length - 1;
                    return (
                      <div
                        key={i}
                        className={`relative w-8 sm:w-10 h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-mono select-none shadow-inner ${
                          isLast ? 'bg-red-600 text-white font-black' : 'bg-black text-white font-bold'
                        }`}
                      >
                        <span className="relative z-0">{digit}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* 2. ALL TIME VISITORS */}
            <div className="flex flex-col items-center">
              <span className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-100 mb-2.5 drop-shadow-sm">
                ALL TIME VISITORS
              </span>
              <div className="inline-flex border border-slate-700/80 bg-black/95 shadow-2xl overflow-hidden divide-x divide-slate-700/80">
                {(allTimeVisitors ?? 1)
                  .toString()
                  .padStart(8, '0')
                  .split('')
                  .map((digit, i, arr) => {
                    const isLast = i === arr.length - 1;
                    return (
                      <div
                        key={i}
                        className={`relative w-8 sm:w-10 h-10 sm:h-12 flex items-center justify-center text-lg sm:text-xl font-mono select-none shadow-inner ${
                          isLast ? 'bg-red-600 text-white font-black' : 'bg-black text-white font-bold'
                        }`}
                      >
                        <span className="relative z-0">{digit}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>

          {/* 6 Category Columns with Colorful Headers matching Screenshot 3 */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 text-xs">
          
          {/* 1. ACCESSIBILITY (Sky Blue) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#38bdf8]">
              Accessibility
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('accessibility_options')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Accessibility Options
              </button>
              <button
                onClick={() => setFooterModalSection('suggestions')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Suggestions
              </button>
            </div>
          </div>

          {/* 2. COMPANY (Orange) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#fb923c]">
              Company
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('about_us')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                About Us
              </button>
              <button
                onClick={() => setFooterModalSection('press_kit')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Press Kit
              </button>
              <button
                onClick={() => setFooterModalSection('newsletter')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Newsletter
              </button>
            </div>
          </div>

          {/* 3. COMPETITIONS (Purple) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#c084fc]">
              Competitions
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('tournaments')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Tournaments
              </button>
              <button
                onClick={() => setFooterModalSection('registration')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Registration
              </button>
              <button
                onClick={() => setFooterModalSection('prizes')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Prizes
              </button>
              <button
                onClick={() => setFooterModalSection('awards')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Awards
              </button>
              <button
                onClick={() => setFooterModalSection('player_of_month')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Player of the Month
              </button>
              <button
                onClick={() => setFooterModalSection('hall_of_fame')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Hall of Fame
              </button>
              <button
                onClick={() => setFooterModalSection('credits')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Credits & Credibility
              </button>
            </div>
          </div>

          {/* 4. LEGAL (Green) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#4ade80]">
              Legal
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('terms')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                onClick={() => setFooterModalSection('privacy')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => setFooterModalSection('cookies')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Cookie Policy
              </button>
              <button
                onClick={() => setFooterModalSection('community')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Community Guidelines
              </button>
            </div>
          </div>

          {/* 5. SUPPORT (Coral/Red) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#f87171]">
              Support
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('contact')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Contact Us
              </button>
              <button
                onClick={() => setFooterModalSection('help_center')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Help Center
              </button>
              <button
                onClick={() => {
                  if (onOpenFAQ) onOpenFAQ();
                  else setFooterModalSection('help_center');
                }}
                className="text-left hover:text-white transition cursor-pointer"
              >
                FAQs
              </button>
              <button
                onClick={() => setFooterModalSection('report_bug')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Report a Bug
              </button>
              <button
                onClick={() => setFooterModalSection('feature_request')}
                className="text-left hover:text-white transition cursor-pointer"
              >
                Feature Request
              </button>
            </div>
          </div>

          {/* 6. SOCIAL MEDIA (Cyan) */}
          <div className="flex flex-col gap-2.5">
            <h4 className="font-black text-sm uppercase tracking-wider text-[#22d3ee]">
              Social Media
            </h4>
            <div className="flex flex-col gap-2 text-slate-400 font-medium">
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-blue-500">f</span> Facebook
              </button>
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span>𝕏</span> X
              </button>
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-pink-400">📸</span> Instagram
              </button>
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-yellow-400">👻</span> Snapchat
              </button>
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-red-500">▶</span> YouTube
              </button>
              <button
                onClick={() => setFooterModalSection('social_media')}
                className="text-left hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span className="text-blue-400">in</span> LinkedIn
              </button>
            </div>
          </div>

        </div>

        {/* Center Language Selector Dropdown (Screenshot 3 style) */}
        <div className="flex flex-col items-center justify-center pt-2">
          <button
            onClick={() => setFooterModalSection('language_selector')}
            className="px-5 py-2 rounded-2xl bg-[#0b1322] border border-slate-700 hover:border-slate-500 text-white font-black text-xs flex items-center gap-2.5 shadow-lg transition active:scale-95 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <span>English</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Download Mobile App section with 2 side-by-side buttons */}
        <div className="flex flex-col items-center justify-center gap-3">
          <h5 className="font-black text-xs uppercase tracking-widest text-slate-300">
            Download Mobile App
          </h5>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFooterModalSection('ios_app')}
              className="px-5 py-2.5 bg-[#2563eb] hover:bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>📱</span>
              <span>iOS App</span>
            </button>
            <button
              onClick={() => setFooterModalSection('android_app')}
              className="px-5 py-2.5 bg-[#16a34a] hover:bg-green-600 text-white font-bold text-xs rounded-xl shadow-lg transition active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>🤖</span>
              <span>Android App</span>
            </button>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Quick Links */}
        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div className="flex items-center gap-3 font-semibold">
            <button onClick={onOpenRules} className="hover:text-amber-400 transition">Rules & Guide</button>
            <span>•</span>
            <button onClick={onOpenShop} className="hover:text-yellow-400 transition">Coin Shop</button>
            <span>•</span>
            <button onClick={onOpenProperties} className="hover:text-emerald-400 transition">Saloon Properties</button>
            <span>•</span>
            <button onClick={onOpenDailyDice} className="hover:text-rose-400 transition">Daily Fortune</button>
          </div>
          <p className="font-mono">
            © 2026 Euchre Sovereigns Texas Palace • Built for AI Studio
          </p>
        </div>
        </div>
      </footer>

      {/* Interactive Footer Modal for all footer links */}
      <FooterInfoModal
        isOpen={!!footerModalSection}
        onClose={() => setFooterModalSection(null)}
        section={footerModalSection}
        onOpenFAQ={onOpenFAQ}
        onClaimBonusChips={(amt) => {
          if (onUpdateProfile) {
            onUpdateProfile({
              ...playerProfile,
              chips: playerProfile.chips + amt,
            });
          }
        }}
      />
    </div>
  );
};
