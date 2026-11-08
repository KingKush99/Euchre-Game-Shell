import React, { useState, useEffect, useRef } from 'react';
import { TownLocation, PlayerProfile } from '../types/poker';
import { TOWNS_DATA, PROPERTIES_DATA } from '../data/gameData';
import { sounds } from '../utils/soundEffects';
import {
  Compass,
  MapPin,
  Menu,
  MessageSquare,
  Music,
  Settings,
  LogOut,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Sparkles,
  Trophy,
  Swords,
  Coins,
  Building,
  User,
  Send,
  X,
  ChevronRight,
  Eye,
  CheckCircle2,
  CloudSun,
  Thermometer,
  Clock,
  Navigation,
  Shield,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import { gameAudio } from '../utils/gameAudioEngine';
import { CampaignWorldMapModal } from './CampaignWorldMapModal';
import { CampaignMusicModal } from './CampaignMusicModal';
import { CompactCampaignPlayer } from './CompactCampaignPlayer';
import { ThreeTown3D } from './ThreeTown3D';

interface CampaignWorldScreenProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  onSelectTown: (town: TownLocation, mode: 'cash' | 'tournament' | 'boss_duel') => void;
  onOpenSettings: () => void;
  onReturnToMainMenu: () => void;
  onOpenProperties: () => void;
  onOpenShop: () => void;
  onOpenProgression?: () => void;
}

interface ChatMessage {
  id: string;
  sender: string;
  avatar: string;
  text: string;
  type: 'player' | 'npc' | 'system';
  time: string;
  badge?: string;
}

export const CampaignWorldScreen: React.FC<CampaignWorldScreenProps> = ({
  playerProfile,
  currentTown,
  onSelectTown,
  onOpenSettings,
  onReturnToMainMenu,
  onOpenProperties,
  onOpenShop,
  onOpenProgression,
}) => {
  // Modals state
  const [showWorldMap, setShowWorldMap] = useState<boolean>(false);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [showHamburgerDropdown, setShowHamburgerDropdown] = useState<boolean>(false);
  const [showReturnConfirm, setShowReturnConfirm] = useState<boolean>(false);
  const [showInteriorModal, setShowInteriorModal] = useState<{
    name: string;
    type: 'card_house' | 'store' | 'guild' | 'hall';
    description: string;
  } | null>(null);
  const [showNpcDialog, setShowNpcDialog] = useState<{
    name: string;
    title: string;
    avatar: string;
    dialogue: string;
    questOffer?: string;
  } | null>(null);

  // Active Town state
  const [activeTown, setActiveTown] = useState<TownLocation>(currentTown);

  // Bottom Left Chat state
  const [isChatCollapsed, setIsChatCollapsed] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'System Broadcast',
      avatar: '📢',
      text: `Welcome to ${currentTown.name}! Signature Venue: ${currentTown.keyArchitecture?.[0] || 'Card House'} is now open.`,
      type: 'system',
      time: '12:00 PM',
      badge: 'OFFICIAL',
    },
    {
      id: 'msg_2',
      sender: activeTown.bossName,
      avatar: '🤠',
      text: activeTown.bossQuote || 'Looking for a game of Euchre? Take a seat at our table!',
      type: 'npc',
      time: '12:01 PM',
      badge: 'TOWN BOSS',
    },
    {
      id: 'msg_3',
      sender: 'CardSharp_99',
      avatar: '🃏',
      text: 'Anyone calling loners today? The pot is getting huge!',
      type: 'player',
      time: '12:02 PM',
    },
  ]);

  // Bottom Right Mini-Map state
  const [miniMapZoom, setMiniMapZoom] = useState<number>(1);
  const [isMiniMapCollapsed, setIsMiniMapCollapsed] = useState<boolean>(false);

  // Camera Perspective Mode (Inside Hamburger Menu)
  const [cameraMode, setCameraMode] = useState<'follow' | 'orbit' | 'birds_eye'>('follow');

  // Player Position in Town Canvas (0 to 100 coordinates)
  const [playerCoord, setPlayerCoord] = useState<{ x: number; y: number }>({ x: 50, y: 70 });
  const [activeInteractTarget, setActiveInteractTarget] = useState<{
    id: string;
    name: string;
    type: 'building' | 'npc' | 'table';
    action: string;
  } | null>(null);

  // Keyboard shortcut: Press Tab to toggle Twitch Live Chat
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'Tab') {
        e.preventDefault();
        sounds.playClick();
        setIsChatCollapsed((c) => !c);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Music Bar visibility state
  const [showMusicBar, setShowMusicBar] = useState<boolean>(false);
  const [isPlayingMusic, setIsPlayingMusic] = useState<boolean>(gameAudio.getState().isPlaying);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = gameAudio.subscribe((st) => {
      setIsPlayingMusic(st.isPlaying);
    });
    return () => unsub();
  }, []);

  // Town Atmosphere Data
  const townWeather = 'Crisp & Sunny';
  const townTemp = '62°F';
  const townTime = '2:45 PM';
  const townCompletion = playerProfile.conqueredTowns.includes(activeTown.id) ? 100 : 45;

  // Town Landmarks in current active town
  const townLandmarks = [
    {
      id: 'landmark_card_house',
      name: activeTown.keyArchitecture?.[0] || `${activeTown.name} Card House`,
      type: 'building' as const,
      x: 50,
      y: 28,
      icon: '🏛️',
      color: 'from-amber-700 to-amber-900',
    },
    {
      id: 'landmark_store',
      name: activeTown.keyArchitecture?.[1] || 'General Store & Guild',
      type: 'building' as const,
      x: 22,
      y: 45,
      icon: '🏪',
      color: 'from-emerald-800 to-teal-950',
    },
    {
      id: 'landmark_plaza',
      name: activeTown.keyArchitecture?.[2] || 'Town Commons & Card Pavilion',
      type: 'building' as const,
      x: 78,
      y: 45,
      icon: '🎪',
      color: 'from-rose-800 to-stone-900',
    },
    {
      id: 'npc_boss',
      name: activeTown.bossName,
      title: 'Town Boss & Grandmaster',
      type: 'npc' as const,
      x: 50,
      y: 46,
      icon: '🤠',
      avatar: activeTown.bossAvatar,
    },
    {
      id: 'npc_dealer',
      name: 'Saloon Table Host',
      title: 'Tournament Clerk',
      type: 'npc' as const,
      x: 35,
      y: 62,
      icon: '🎩',
      avatar: 'Clerk',
    },
  ];

  // Movement handler with Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in chat
      if (document.activeElement?.tagName === 'INPUT') return;

      const step = 4;
      if (e.key === 'w' || e.key === 'ArrowUp') {
        setPlayerCoord((prev) => ({ ...prev, y: Math.max(15, prev.y - step) }));
      } else if (e.key === 's' || e.key === 'ArrowDown') {
        setPlayerCoord((prev) => ({ ...prev, y: Math.min(85, prev.y + step) }));
      } else if (e.key === 'a' || e.key === 'ArrowLeft') {
        setPlayerCoord((prev) => ({ ...prev, x: Math.max(10, prev.x - step) }));
      } else if (e.key === 'd' || e.key === 'ArrowRight') {
        setPlayerCoord((prev) => ({ ...prev, x: Math.min(90, prev.x + step) }));
      } else if (e.key === 'e' || e.key === 'E') {
        if (activeInteractTarget) {
          triggerInteraction(activeInteractTarget);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeInteractTarget]);

  // Proximity detection to landmarks
  useEffect(() => {
    let nearest: any = null;
    let minDistance = 14;

    for (const lm of townLandmarks) {
      const dist = Math.hypot(playerCoord.x - lm.x, playerCoord.y - lm.y);
      if (dist < minDistance) {
        nearest = lm;
        break;
      }
    }

    const nextId = nearest ? nearest.id : null;
    setActiveInteractTarget((prev) => {
      if (prev?.id === nextId) return prev;
      if (!nearest) return null;
      return {
        id: nearest.id,
        name: nearest.name,
        type: nearest.type,
        action: nearest.type === 'building' ? 'ENTER VENUE' : 'TALK TO NPC',
      };
    });
  }, [playerCoord, activeTown]);

  const triggerInteraction = (target: { id: string; name: string; type: string }) => {
    sounds.playClick();
    if (target.id === 'landmark_card_house') {
      setShowInteriorModal({
        name: target.name,
        type: 'card_house',
        description: `The grand 4-seat Euchre parlor of ${activeTown.name}. Join cash tables, enter tournament brackets, or challenge ${activeTown.bossName}!`,
      });
    } else if (target.id === 'landmark_store') {
      onOpenShop();
    } else if (target.id === 'landmark_plaza') {
      onOpenProperties();
    } else if (target.type === 'npc') {
      setShowNpcDialog({
        name: target.name,
        title: target.id === 'npc_boss' ? 'Town Champion' : 'Euchre Clerk',
        avatar: target.id === 'npc_boss' ? '🤠' : '🎩',
        dialogue:
          target.id === 'npc_boss'
            ? activeTown.bossQuote ||
              `Welcome to ${activeTown.name}! If you want to claim this territory, you'll have to beat my partnership in a heads-up duel!`
            : `Welcome, traveler! The tables are hot today. We're paying out ${activeTown.tournamentPrize.toLocaleString()} chips in the local cup!`,
        questOffer:
          target.id === 'npc_boss'
            ? `Win 1 Cash Match & 1 Tournament in ${activeTown.name} to conquer this city!`
            : undefined,
      });
    }
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sounds.playClick();
    const newMsg: ChatMessage = {
      id: `chat_${Date.now()}`,
      sender: playerProfile.name || 'You',
      avatar: '🤠',
      text: chatInput.trim(),
      type: 'player',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Simulate friendly NPC reply
    setTimeout(() => {
      const replies = [
        `Good luck at the tables, ${playerProfile.name}!`,
        'Remember to count the Left Bower before leading trump!',
        `The prize pool in ${activeTown.name} is looking great today!`,
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        {
          id: `npc_reply_${Date.now()}`,
          sender: activeTown.bossName,
          avatar: '🤠',
          text: randomReply,
          type: 'npc',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: 'TOWN BOSS',
        },
      ]);
    }, 1500);
  };

  return (
    <div className="relative w-full h-screen bg-[#070b14] text-stone-100 overflow-hidden select-none">
      
      {/* ========================================================================= */}
      {/* 3D FULL WEBGL TOWN ENVIRONMENT VIEWPORT WITH CUSTOM USER CHARACTER */}
      {/* ========================================================================= */}
      <div className="relative w-full h-full bg-[#0a0f1d] overflow-hidden">
        <ThreeTown3D
          playerProfile={playerProfile}
          currentTown={activeTown}
          onSelectTownId={(townId) => {
            const found = TOWNS_DATA.find((t) => t.id === townId);
            if (found) setActiveTown(found);
          }}
          onEnterSaloon={(mode) => onSelectTown(activeTown, mode)}
          onOpenProperties={onOpenProperties}
          onOpenShop={onOpenShop}
          onOpenWheel={() => onSelectTown(activeTown, 'cash')}
          onPlayerPositionChange={(coord) => setPlayerCoord(coord)}
          cameraMode={cameraMode}
        />
      </div>

      {/* ========================================================================= */}
      {/* STRICT PERSISTENT CAMPAIGN HUD (MATCHING BOWER KINGDOMS AESTHETIC) */}
      {/* ========================================================================= */}

      {/* 1. TOP LEFT: SLEEK WORLD MAP BUTTON */}
      <div className="fixed top-3 sm:top-4 left-3 sm:left-4 z-40 flex items-center gap-2">
        <button
          onClick={() => {
            sounds.playClick();
            setShowWorldMap(true);
          }}
          className="h-10 sm:h-11 px-3 sm:px-4 rounded-xl bg-stone-900/95 hover:bg-stone-800 border-2 border-amber-500/70 text-amber-200 font-black text-xs uppercase tracking-wider shadow-xl flex items-center gap-2 transition active:scale-95 backdrop-blur-md cursor-pointer"
          title="Open Frontier World Map"
        >
          <Compass className="w-4 h-4 text-amber-400" />
          <span>World Map</span>
        </button>
      </div>

      {/* 2. TOP CENTER: CLEAN TOWN INFORMATION HUD */}
      <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-40 max-w-[calc(100vw-150px)]">
        <div className="bg-[#0b101c]/95 border border-amber-500/60 rounded-2xl px-3.5 py-1.5 shadow-2xl backdrop-blur-md flex items-center gap-3 text-xs text-amber-100">
          {/* Gold Coin Medallion */}
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300 to-yellow-600 border border-yellow-200 text-stone-950 font-black flex items-center justify-center text-xs shadow shrink-0">
            $
          </div>

          {/* Town Name */}
          <div className="text-left min-w-0">
            <div className="font-black text-xs sm:text-sm text-white tracking-wide leading-tight truncate">
              {activeTown.name} · {activeTown.region || 'Frontier District'}
            </div>
          </div>

          {/* Stat Badges on Right */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Gold Pill */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-black text-xs">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>{playerProfile.chips.toLocaleString()} Gold</span>
            </div>

            {/* Title / Challenger Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-teal-950/60 border border-teal-400/40 text-teal-300 font-black text-xs">
              <Trophy className="w-3.5 h-3.5 text-teal-400" />
              <span>{playerProfile.title || 'Bower Challenger'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TOP RIGHT: HAMBURGER MENU BUTTON & DROPDOWN */}
      <div className="fixed top-3 sm:top-4 right-3 sm:right-4 z-40">
        <div className="relative">
          {/* Hamburger button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowHamburgerDropdown((prev) => !prev);
            }}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#0e1628]/95 hover:bg-[#15223e] border-2 border-amber-500/80 text-amber-200 shadow-xl flex items-center justify-center transition active:scale-95 backdrop-blur-md"
            title="Campaign Menu"
          >
            <Menu className="w-5 h-5 text-amber-300" />
          </button>

          {/* Hamburger Dropdown Menu */}
          {showHamburgerDropdown && (
            <div className="absolute right-0 top-13 w-60 bg-[#0c1322] border-2 border-amber-500/50 rounded-2xl shadow-2xl p-2 text-xs space-y-1 animate-in slide-in-from-top-2 duration-150 z-50">
              <div className="px-2.5 pt-1.5 pb-1 text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center justify-between">
                <span>Camera Perspective</span>
              </div>
              <div className="grid grid-cols-1 gap-1 px-1">
                {[
                  { id: 'follow', label: 'Third-Person Follow', icon: '🤠' },
                  { id: 'birds_eye', label: "Bird's Eye Overview", icon: '🦅' },
                  { id: 'orbit', label: 'Cinematic Orbit', icon: '🎬' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => {
                      sounds.playClick();
                      setCameraMode(mode.id as any);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-xl text-left font-bold flex items-center justify-between transition ${
                      cameraMode === mode.id
                        ? 'bg-amber-500 text-stone-950 font-black'
                        : 'text-stone-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{mode.icon}</span>
                      <span>{mode.label}</span>
                    </span>
                    {cameraMode === mode.id && <span className="text-xs font-black">✓</span>}
                  </button>
                ))}
              </div>

              <div className="h-px bg-slate-800 my-1.5" />

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowHamburgerDropdown(false);
                  setShowMusicModal(true);
                  setShowMusicBar(true);
                }}
                className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left font-bold text-stone-200 flex items-center gap-2.5 transition"
              >
                <Music className="w-4 h-4 text-amber-400" />
                <span>Music & Atmosphere</span>
              </button>

              {onOpenProgression && (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHamburgerDropdown(false);
                    onOpenProgression();
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-slate-800 text-left font-bold text-stone-200 flex items-center gap-2.5 transition"
                >
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>Achievements & Awards</span>
                </button>
              )}

              <div className="h-px bg-slate-800 my-1" />

              <button
                onClick={() => {
                  sounds.playClick();
                  setShowHamburgerDropdown(false);
                  setShowReturnConfirm(true);
                }}
                className="w-full p-2.5 rounded-xl hover:bg-rose-950 text-left font-black text-rose-400 flex items-center gap-2.5 transition"
              >
                <LogOut className="w-4 h-4 text-rose-500" />
                <span>Main Menu</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4. BOTTOM CENTER: SOUNDTRACK CARD (Clean, no duplicate interaction bar) */}
      <div className="fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-auto">
        <div className="bg-[#090e18]/90 border border-amber-500/40 rounded-xl px-3 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
          <div className="text-left min-w-0">
            <div className="text-[9px] font-black uppercase tracking-wider text-amber-400 leading-none">
              Soundtrack
            </div>
            <div className="font-bold text-xs text-white truncate leading-tight">
              Kitty Card Reverie
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              gameAudio.togglePlay();
            }}
            className="w-7 h-7 rounded-full bg-amber-400 hover:bg-amber-300 text-stone-950 flex items-center justify-center shadow transition active:scale-95 shrink-0"
            title={isPlayingMusic ? 'Pause Music' : 'Play Music'}
          >
            {isPlayingMusic ? (
              <Pause className="w-3.5 h-3.5 fill-stone-950" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-stone-950 ml-0.5" />
            )}
          </button>
        </div>
      </div>

      {/* 5. BOTTOM LEFT: TOWN CHAT BUTTON & DRAWER */}
      <div className="fixed bottom-4 left-4 z-40">
        <button
          onClick={() => {
            sounds.playClick();
            setIsChatOpen((prev) => !prev);
          }}
          className="h-12 px-4 rounded-2xl bg-[#0e1628]/95 hover:bg-[#15223e] border-2 border-pink-500/80 text-pink-300 shadow-[0_0_20px_rgba(236,72,153,0.35)] flex items-center gap-2.5 transition transform hover:scale-105 active:scale-95 backdrop-blur-md"
        >
          <div className="w-6 h-6 rounded-lg bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-300">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <span className="font-black text-xs uppercase tracking-wider text-white">
            TOWN CHAT
          </span>
        </button>

        {/* Live Chat Drawer */}
        {isChatOpen && (
          <div className="absolute bottom-16 left-0 w-80 sm:w-84 h-72 sm:h-76 rounded-3xl bg-[#0b111e]/95 border-2 border-pink-500/50 shadow-2xl backdrop-blur-md flex flex-col overflow-hidden animate-in slide-in-from-bottom-2 duration-150">
            <div className="h-11 px-4 bg-gradient-to-r from-[#1f1024] to-[#0b111e] border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-pink-300">
                <MessageSquare className="w-4 h-4 text-pink-400" />
                <span>BOWER KINGDOM CHAT</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-800 hover:bg-slate-700 text-stone-400 hover:text-white flex items-center justify-center text-xs"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-2 rounded-xl border ${
                    msg.type === 'system'
                      ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                      : msg.type === 'npc'
                      ? 'bg-purple-950/20 border-purple-500/30 text-purple-100'
                      : 'bg-slate-900/80 border-slate-800 text-stone-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{msg.avatar}</span>
                      <span className="font-black text-white">{msg.sender}</span>
                      {msg.badge && (
                        <span className="text-[8px] font-black uppercase px-1 py-0.2 rounded bg-amber-400 text-stone-950">
                          {msg.badge}
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] font-mono text-stone-500">{msg.time}</span>
                  </div>
                  <p className="text-[11px] leading-snug pl-5">{msg.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendChat} className="p-2 border-t border-slate-800 bg-[#080c16] flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Chat with Bower Kingdom locals..."
                className="flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs outline-none focus:border-pink-400 placeholder:text-stone-500"
              />
              <button
                type="submit"
                className="w-8 h-8 rounded-xl bg-pink-500 hover:bg-pink-400 text-white flex items-center justify-center transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* 6. BOTTOM RIGHT: SLEEK COMPACT TOWN RADAR */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="w-36 h-36 rounded-2xl bg-[#090d16]/90 border border-amber-500/40 shadow-xl backdrop-blur-md p-2 flex flex-col justify-between overflow-hidden">
          <div className="flex items-center justify-between px-1">
            <span className="text-[9px] font-black uppercase text-amber-400 tracking-wider">
              Town Radar
            </span>
          </div>

          {/* Cross-Roads Mini Map */}
          <div className="relative flex-1 bg-[#140f0c] rounded-xl border border-stone-800/80 overflow-hidden flex items-center justify-center my-1">
            {/* Roads */}
            <div className="absolute top-0 bottom-0 w-4 bg-[#cca066]/80" />
            <div className="absolute left-0 right-0 h-4 bg-[#cca066]/80" />

            {/* Landmark Dots */}
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-rose-500 shadow" title="Tavern" />
            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-purple-500 shadow" title="Plaza" />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-teal-500 shadow" title="Store" />
            <div className="absolute bottom-1 left-2 w-2.5 h-2.5 rounded-full bg-blue-500 shadow" title="Table" />
            <div className="absolute bottom-1 right-2 w-2.5 h-2.5 rounded-full bg-amber-500 shadow" title="Bank" />

            {/* Player Location Cyan Diamond Marker */}
            <div
              style={{
                left: `${Math.max(20, Math.min(80, playerCoord.x))}%`,
                top: `${Math.max(20, Math.min(80, playerCoord.y))}%`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-all duration-150"
            >
              <div className="w-3 h-3 bg-cyan-400 border border-white rotate-45 shadow-[0_0_8px_rgba(34,211,238,0.9)]" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ENTERABLE BUILDING INTERIOR MODAL (SALOON / CARD HOUSE) */}
      {/* ========================================================================= */}
      {showInteriorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl bg-[#0e1628] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-amber-50">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-3xl shadow">
                  🏛️
                </div>
                <div>
                  <h3 className="font-black text-lg text-amber-300 uppercase tracking-wide">
                    {showInteriorModal.name}
                  </h3>
                  <p className="text-xs text-stone-400">{showInteriorModal.description}</p>
                </div>
              </div>

              <button
                onClick={() => setShowInteriorModal(null)}
                className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-800 border border-amber-400/30 text-amber-200 flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 3 Game Modes to Sit & Play */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Mode 1: Cash Game */}
              <div className="p-4 rounded-2xl bg-[#10182b] border border-slate-700/80 flex flex-col justify-between hover:border-amber-400 transition group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center mb-2">
                    <Coins className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-white">Cash Game Table</h4>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Classic 4-player Euchre match to 10 points. Earn chips on every trick and win.
                  </p>
                  <div className="mt-2 text-xs font-bold text-amber-300">
                    Buy-In: ${activeTown.buyIn} Chips
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowInteriorModal(null);
                    onSelectTown(activeTown, 'cash');
                  }}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow transition"
                >
                  SIT & PLAY CASH
                </button>
              </div>

              {/* Mode 2: Tournament Cup */}
              <div className="p-4 rounded-2xl bg-[#10182b] border border-slate-700/80 flex flex-col justify-between hover:border-amber-400 transition group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-300 flex items-center justify-center mb-2">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-white">{activeTown.name} Cup</h4>
                  <p className="text-[11px] text-stone-400 mt-1">
                    Multi-round bracket tournament against elite town card sharps.
                  </p>
                  <div className="mt-2 text-xs font-bold text-yellow-300">
                    Prize: ${activeTown.tournamentPrize.toLocaleString()}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowInteriorModal(null);
                    onSelectTown(activeTown, 'tournament');
                  }}
                  className="mt-4 w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-black text-xs uppercase rounded-xl border border-amber-500/40 shadow transition"
                >
                  ENTER CUP
                </button>
              </div>

              {/* Mode 3: Boss Duel */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-[#2a131b] to-[#10182b] border border-rose-600/50 flex flex-col justify-between hover:border-rose-400 transition group">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center mb-2">
                    <Swords className="w-5 h-5" />
                  </div>
                  <h4 className="font-black text-sm text-white">Duel {activeTown.bossName}</h4>
                  <p className="text-[11px] text-stone-400 mt-1">
                    High stakes championship duel to conquer {activeTown.name}!
                  </p>
                  <div className="mt-2 text-xs font-bold text-rose-300">
                    Boss: {activeTown.bossName}
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playAllIn();
                    setShowInteriorModal(null);
                    onSelectTown(activeTown, 'boss_duel');
                  }}
                  className="mt-4 w-full py-2 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white font-black text-xs uppercase rounded-xl shadow-lg transition"
                >
                  CHALLENGE BOSS
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* NPC DIALOGUE & QUEST MODAL */}
      {/* ========================================================================= */}
      {showNpcDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0e1628] border-2 border-amber-400 rounded-3xl p-6 shadow-2xl text-amber-50 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-3xl shadow">
                {showNpcDialog.avatar}
              </div>
              <div>
                <h3 className="font-black text-base text-amber-300 uppercase">
                  {showNpcDialog.name}
                </h3>
                <span className="text-xs text-stone-400 font-bold uppercase">
                  {showNpcDialog.title}
                </span>
              </div>
            </div>

            <div className="p-4 bg-[#080d18] border border-slate-800 rounded-2xl text-xs text-stone-200 leading-relaxed font-serif italic">
              &ldquo;{showNpcDialog.dialogue}&rdquo;
            </div>

            {showNpcDialog.questOffer && (
              <div className="p-3 bg-amber-500/10 border border-amber-400/40 rounded-xl text-xs text-amber-300 flex items-center gap-2">
                <Trophy className="w-4 h-4 shrink-0 text-yellow-400" />
                <span>
                  <strong>Active Objective:</strong> {showNpcDialog.questOffer}
                </span>
              </div>
            )}

            <button
              onClick={() => setShowNpcDialog(null)}
              className="w-full py-2.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl transition"
            >
              CLOSE DIALOGUE
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* RETURN TO MAIN MENU CONFIRMATION DIALOG */}
      {/* ========================================================================= */}
      {showReturnConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#0e1628] border-2 border-amber-500 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 mx-auto flex items-center justify-center shadow-lg">
              <LogOut className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-black text-base text-white uppercase tracking-wide">
                RETURN TO MAIN MENU?
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Your campaign progress and position in {activeTown.name} have been saved automatically.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowReturnConfirm(false)}
                className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-stone-300 font-black text-xs uppercase rounded-xl transition"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setShowReturnConfirm(false);
                  onReturnToMainMenu();
                }}
                className="flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow-lg transition"
              >
                RETURN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL OVERLAYS (WORLD MAP & CAMPAIGN MUSIC) */}
      {/* ========================================================================= */}
      <CampaignWorldMapModal
        isOpen={showWorldMap}
        onClose={() => setShowWorldMap(false)}
        playerProfile={playerProfile}
        currentTownId={activeTown.id}
        onTravelToTown={(town) => {
          setActiveTown(town);
          setPlayerCoord({ x: 50, y: 70 });
        }}
      />

      <CampaignMusicModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
      />

      {/* Compact Bottom-Center Playback Bar (ONLY if user explicitly toggles/opens music) */}
      {showMusicBar && !showMusicModal && (
        <CompactCampaignPlayer
          onOpenFullModal={() => setShowMusicModal(true)}
        />
      )}

    </div>
  );
};
