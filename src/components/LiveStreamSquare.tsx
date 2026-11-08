import React, { useRef, useEffect, useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import {
  Radio,
  Sparkles,
  Users,
  Trophy,
  MessageSquare,
  Send,
  Gem,
  Smile,
  ChevronDown,
  ChevronUp,
  Volume2,
  VolumeX,
  Flame,
  Tv,
  Heart,
  Share2,
  CheckCircle2,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LiveStreamSquareProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  tableMode: 'cash' | 'tournament' | 'boss_duel';
  lastGameEvent?: {
    type: 'allin' | 'win' | 'fold' | 'raise' | 'conquer' | 'badbeat' | 'idle';
    actorName?: string;
    amount?: number;
  };
  onEnterSaloon?: () => void;
}

interface StreamerChatMsg {
  id: string;
  user: string;
  color: string;
  badge?: 'mod' | 'sub' | 'vip' | 'host' | 'verified';
  text: string;
  time: string;
}

const INITIAL_CHAT_MESSAGES: StreamerChatMsg[] = [
  {
    id: '1',
    user: 'TwitchMod_Sheriff',
    color: '#10b981',
    badge: 'mod',
    text: 'Welcome to the Wild West Poker Championship stream! 🤠 Keep chat friendly!',
    time: '12:00',
  },
  {
    id: '2',
    user: 'CardShark_99',
    color: '#ec4899',
    badge: 'sub',
    text: 'Governor on table today?! Lets gooo! 🔥 PogChamp',
    time: '12:01',
  },
  {
    id: '3',
    user: 'AceHighSaloon',
    color: '#f59e0b',
    badge: 'vip',
    text: 'The reads on this player are insane! Watch out for boss duels 💰',
    time: '12:01',
  },
  {
    id: '4',
    user: 'AustinCowboy',
    color: '#38bdf8',
    badge: 'sub',
    text: 'Playing from Dallas right now! 👑 EZ WIN',
    time: '12:02',
  },
  {
    id: '5',
    user: 'BluffMaster_TX',
    color: '#a855f7',
    badge: 'verified',
    text: 'Show the cards after this hand! ♠️',
    time: '12:02',
  },
];

const STREAM_VIEWERS = [
  { name: 'PokerPro2026', color: '#38bdf8', badge: 'sub' as const },
  { name: 'RedRiverGamer', color: '#f43f5e', badge: 'vip' as const },
  { name: 'SaloonBabe', color: '#ec4899', badge: 'sub' as const },
  { name: 'TexasHoldemKing', color: '#eab308', badge: 'verified' as const },
  { name: 'LoneStarGambler', color: '#10b981', badge: 'mod' as const },
  { name: 'Gunslinger_Jack', color: '#a855f7', badge: 'sub' as const },
  { name: 'LuckyCharm77', color: '#fb923c', badge: 'vip' as const },
];

const EMOTES = ['🔥', '🤠', '💰', '♠️', '🏆', '💎', '👑', '🎉', '🤯', '🍿'];

export const LiveStreamSquare: React.FC<LiveStreamSquareProps> = ({
  playerProfile,
  currentTown,
  tableMode,
  lastGameEvent,
  onEnterSaloon,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'stream' | 'chat'>('stream');
  const [chatMessages, setChatMessages] = useState<StreamerChatMsg[]>(INITIAL_CHAT_MESSAGES);
  const [inputChat, setInputChat] = useState('');
  const [viewerCount, setViewerCount] = useState(4820);
  const [likesCount, setLikesCount] = useState(1280);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentary, setCommentary] = useState<string>('Streaming live from the Saloon table!');
  const [streamAudioPlaying, setStreamAudioPlaying] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Periodic simulated live viewer fluctuations & active chat stream
  useEffect(() => {
    const chatInterval = setInterval(() => {
      // Random viewer fluctuation
      setViewerCount((prev) => Math.max(3200, prev + Math.floor((Math.random() - 0.48) * 15)));

      // Generate realistic dynamic poker chat message
      const randomUser = STREAM_VIEWERS[Math.floor(Math.random() * STREAM_VIEWERS.length)];
      const phrases = [
        'Great fold honestly, villain had two pair 🧠',
        'Stack up those chips! 💰💰💰',
        'Is he going for Governor of Texas title today?! 🤠',
        'Pot is getting huge on table 1! 🔥',
        'Nice hat equipped! Looks sharp! 🎩',
        'That check-raise was filthy! PogChamp',
        'Chat, what are we betting on the turn? 🤔',
        'All in with the nuts!! 🚀',
        'Big Jack in the saloon is shaking in his boots 😂',
        'EZ cash game profit today 💵',
        'Saloon hype train is at 80%!! 🚂',
        'Cheer100 for good luck! 💎',
      ];

      const now = new Date();
      const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
      const newMsg: StreamerChatMsg = {
        id: `auto_${Date.now()}_${Math.random()}`,
        user: randomUser.name,
        color: randomUser.color,
        badge: randomUser.badge,
        text: phrases[Math.floor(Math.random() * phrases.length)],
        time,
      };

      setChatMessages((prev) => [...prev.slice(-35), newMsg]);
    }, 4500);

    return () => clearInterval(chatInterval);
  }, []);

  // React directly to in-game poker events with high-energy chat bursts!
  useEffect(() => {
    if (!lastGameEvent || lastGameEvent.type === 'idle') return;

    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    let eventTexts: string[] = [];
    let commentaryLine = '';

    if (lastGameEvent.type === 'allin') {
      eventTexts = [
        '🚨 ALL IN ALERT!! 🚨',
        'HOLD ONTO YOUR HATS BOYS! 🤠',
        'NO WAY HE SHOVED! PogChamp',
        'CLENCH TIME!! 🍿',
      ];
      commentaryLine = '🚨 HUGE ALL-IN ON THE TABLE!';
    } else if (lastGameEvent.type === 'win') {
      eventTexts = [
        'EZ WIN!! 💰💰💰',
        'GOVERNOR STATUS UNLOCKED! 👑',
        'MASSIVE POT TAKEDOWN! 🎉',
        'GG WP! What a hand! 🔥',
      ];
      commentaryLine = '🏆 MONSTER POT WON! High Roller play!';
    } else if (lastGameEvent.type === 'raise') {
      eventTexts = [
        'Aggressive raise! Putting the pressure on! 📈',
        'He is not messing around! 💪',
        'Bigger pot brewing! 🪙',
      ];
      commentaryLine = '⚡ Aggressive raise across the felt!';
    } else if (lastGameEvent.type === 'fold') {
      eventTexts = [
        'Disciplined fold! Saved chips 🛡️',
        'Live to fight another hand! 🤝',
        'Smart play.',
      ];
      commentaryLine = '🛡️ Solid laydown, onto the next hand!';
    } else if (lastGameEvent.type === 'conquer') {
      eventTexts = [
        'TOWN CONQUERED!! 🏆🏆🏆',
        'THE NEW GOVERNOR HAS ARRIVED! 👑🤠',
        'SALOON BOSS DOWN!! 💥',
      ];
      commentaryLine = '👑 TOWN BOSS CONQUERED! Texas Legend!';
    }

    if (eventTexts.length > 0) {
      const burstMessages: StreamerChatMsg[] = eventTexts.slice(0, 2).map((text, idx) => {
        const u = STREAM_VIEWERS[(Math.floor(Math.random() * STREAM_VIEWERS.length) + idx) % STREAM_VIEWERS.length];
        return {
          id: `event_${Date.now()}_${idx}`,
          user: u.name,
          color: u.color,
          badge: u.badge,
          text,
          time,
        };
      });

      setChatMessages((prev) => [...prev.slice(-35), ...burstMessages]);
      setCommentary(commentaryLine);
    }
  }, [lastGameEvent]);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [chatMessages, activeTab]);

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputChat.trim()) return;

    sounds.playClick();
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    const userMsg: StreamerChatMsg = {
      id: `user_${Date.now()}`,
      user: playerProfile.name || 'You (Host)',
      color: '#38bdf8',
      badge: 'host',
      text: inputChat.trim(),
      time,
    };

    setChatMessages((prev) => [...prev.slice(-35), userMsg]);
    setInputChat('');

    // Instant viewer response in chat after 1 second
    setTimeout(() => {
      const fan = STREAM_VIEWERS[Math.floor(Math.random() * STREAM_VIEWERS.length)];
      const replies = ['True!! 🔥', '100% agree!', 'LFG 🤠', 'Good call streamer! 👑'];
      setChatMessages((prev) => [
        ...prev.slice(-35),
        {
          id: `reply_${Date.now()}`,
          user: fan.name,
          color: fan.color,
          badge: fan.badge,
          text: replies[Math.floor(Math.random() * replies.length)],
          time,
        },
      ]);
    }, 1200);
  };

  const handleCheerBits = () => {
    sounds.playWin();
    confetti({ particleCount: 45, spread: 60, origin: { x: 0.12, y: 0.8 } });
    const now = new Date();
    const time = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    setChatMessages((prev) => [
      ...prev.slice(-35),
      {
        id: `bits_${Date.now()}`,
        user: 'TexasSuperFan',
        color: '#ec4899',
        badge: 'vip',
        text: 'cheer100 GOOD LUCK IN THE SALOON GOVERNOR! 💎💎💎',
        time,
      },
    ]);
  };

  const handleLikeStream = () => {
    sounds.playChipSound();
    setLikesCount((prev) => prev + 1);
    setHasLiked(true);
    confetti({ particleCount: 20, spread: 40, origin: { x: 0.08, y: 0.85 } });
  };

  return (
    <div
      id="livestream-bottom-left-dock"
      className="fixed bottom-3 left-3 z-30 select-none flex flex-col items-start font-sans"
    >
      {/* 1. THE BOTTOM-LEFT LIVESTREAM BUTTON */}
      <button
        id="livestream-toggle-btn"
        onClick={() => {
          sounds.playClick();
          setIsOpen(!isOpen);
        }}
        className={`group flex items-center gap-2 px-3 py-2 rounded-2xl shadow-[0_4px_25px_rgba(168,85,247,0.4)] border-2 transition-all active:scale-95 ${
          isOpen
            ? 'bg-gradient-to-r from-purple-900 via-stone-900 to-purple-950 border-purple-400 text-purple-100'
            : 'bg-stone-900/95 hover:bg-stone-800 border-purple-500/80 text-purple-200'
        }`}
        title="Toggle Poker Live Stream & Real-Time Chat"
      >
        {/* Pulsating Live Broadcast Indicator */}
        <span className="flex h-2.5 w-2.5 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-90" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-red-500/80 shadow" />
        </span>

        <span className="font-serif font-black text-xs uppercase tracking-wider text-purple-200 group-hover:text-white">
          LIVESTREAM
        </span>

        {/* Live Viewers Pill */}
        <span className="bg-purple-950/80 text-purple-300 font-mono font-bold text-[10px] px-1.5 py-0.5 rounded-lg border border-purple-500/40">
          {(viewerCount / 1000).toFixed(1)}k 👁️
        </span>

        {isOpen ? (
          <ChevronDown className="w-3.5 h-3.5 text-purple-400 transition-transform" />
        ) : (
          <ChevronUp className="w-3.5 h-3.5 text-purple-400 transition-transform" />
        )}
      </button>

      {/* 2. THE EXPANDED LIVESTREAM BROADCAST & LIVE CHAT WINDOW */}
      {isOpen && (
        <div className="mt-2 relative w-72 sm:w-80 h-72 sm:h-80 bg-stone-950/95 border-2 border-purple-500/60 rounded-3xl shadow-[0_12px_45px_rgba(0,0,0,0.9)] backdrop-blur-xl overflow-hidden flex flex-col transition-all">
          {/* Live Broadcast Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-r from-purple-950 via-stone-900 to-purple-950 border-b border-purple-600/40">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <div>
                <h4 className="font-serif font-black text-xs text-purple-200 leading-tight">
                  🔴 {currentTown.name} Saloon Cup
                </h4>
                <p className="text-[10px] text-purple-400 font-medium">
                  {tableMode === 'boss_duel'
                    ? '⚔️ Boss Duel Stream'
                    : tableMode === 'tournament'
                    ? '🏆 Saloon Championship'
                    : '💵 High Stakes Cash Game'}
                </p>
              </div>
            </div>

            {/* View Mode Tabs: Stream Broadcast vs Live Chat */}
            <div className="flex items-center bg-stone-900/90 p-0.5 rounded-xl border border-purple-500/40 text-[10px]">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('stream');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
                  activeTab === 'stream'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-stone-400 hover:text-purple-300'
                }`}
              >
                <Tv className="w-3 h-3" />
                <span>Stream</span>
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('chat');
                }}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition ${
                  activeTab === 'chat'
                    ? 'bg-purple-600 text-white shadow'
                    : 'text-stone-400 hover:text-purple-300'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span>Live Chat</span>
              </button>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="relative flex-1 w-full overflow-hidden flex flex-col justify-between bg-[#0b0813]">
            {activeTab === 'stream' ? (
              /* STREAM BROADCAST VIEW (Streamer HUD, Commentary & Live Chat Snippet) */
              <div className="flex flex-col h-full justify-between p-2.5">
                {/* Streamer Cam / Studio Overlay */}
                <div className="relative bg-gradient-to-br from-stone-900 to-purple-950/80 rounded-2xl p-2 border border-purple-500/30 shadow-inner flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {/* Animated Streamer Avatar */}
                    <div className="relative">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-md">
                        <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center text-xl">
                          🤠
                        </div>
                      </div>
                      <span className="absolute -bottom-1 -right-1 bg-red-600 text-white text-[8px] font-black px-1 rounded-full border border-stone-950">
                        LIVE
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-amber-200">
                          {playerProfile.name || 'Governor'}
                        </span>
                        <span className="bg-purple-500/30 text-purple-300 text-[9px] px-1.5 py-0.2 rounded font-bold border border-purple-400/40">
                          PRO
                        </span>
                      </div>
                      {/* Audio visualizer bars */}
                      <div className="flex items-center gap-0.5 mt-1">
                        {[40, 70, 100, 55, 85, 30, 95].map((h, i) => (
                          <div
                            key={i}
                            className="w-1 bg-purple-400 rounded-full animate-pulse"
                            style={{
                              height: `${h * 0.12}px`,
                              animationDelay: `${i * 120}ms`,
                            }}
                          />
                        ))}
                        <span className="text-[9px] text-stone-400 ml-1 font-mono">
                          MIC ON
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Like / Cheer Quick Controls */}
                  <div className="flex flex-col items-end gap-1">
                    <button
                      onClick={handleLikeStream}
                      className={`flex items-center gap-1 px-2 py-1 rounded-xl text-[10px] font-bold border transition ${
                        hasLiked
                          ? 'bg-rose-600 text-white border-rose-400'
                          : 'bg-stone-900/80 text-rose-300 border-rose-500/40 hover:bg-rose-950'
                      }`}
                    >
                      <Heart className="w-3 h-3 fill-current" />
                      <span>{likesCount}</span>
                    </button>

                    <button
                      onClick={handleCheerBits}
                      className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white rounded-xl text-[10px] font-black shadow border border-pink-400 transition active:scale-95"
                    >
                      <Gem className="w-3 h-3 text-yellow-300" />
                      <span>Cheer</span>
                    </button>
                  </div>
                </div>

                {/* Commentary Callout Banner */}
                <div className="bg-purple-950/70 border border-purple-500/40 rounded-xl px-2.5 py-1.5 text-[11px] text-amber-200 font-medium shadow flex items-center gap-1.5 my-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{commentary}</span>
                </div>

                {/* Mini Live Chat Stream Preview */}
                <div className="flex-1 bg-stone-950/80 rounded-2xl p-2 border border-purple-900/40 overflow-y-auto space-y-1 my-1 text-[10px]">
                  {chatMessages.slice(-4).map((msg) => (
                    <div key={msg.id} className="leading-tight flex items-start gap-1">
                      {msg.badge === 'host' && (
                        <span className="bg-red-500/30 text-red-300 text-[8px] font-black px-1 rounded">
                          HOST
                        </span>
                      )}
                      {msg.badge === 'mod' && (
                        <span className="bg-emerald-500/30 text-emerald-300 text-[8px] font-black px-1 rounded">
                          MOD
                        </span>
                      )}
                      {msg.badge === 'vip' && (
                        <span className="bg-yellow-500/30 text-yellow-300 text-[8px] font-black px-1 rounded">
                          VIP
                        </span>
                      )}
                      {msg.badge === 'sub' && (
                        <span className="bg-pink-500/30 text-pink-300 text-[8px] font-black px-1 rounded">
                          SUB
                        </span>
                      )}
                      <span style={{ color: msg.color }} className="font-bold shrink-0">
                        {msg.user.slice(0, 11)}:
                      </span>
                      <span className="text-stone-200 break-words">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Switch to Full Live Chat */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setActiveTab('chat');
                  }}
                  className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-purple-200 hover:text-white rounded-xl text-[10px] font-bold border border-purple-600/40 transition flex items-center justify-center gap-1.5"
                >
                  <MessageSquare className="w-3 h-3 text-purple-400" />
                  <span>Open Full Live Chat ({chatMessages.length} msgs)</span>
                </button>
              </div>
            ) : (
              /* DEDICATED FULL LIVE CHAT STREAM */
              <div className="flex flex-col h-full justify-between p-2">
                {/* Chat Header & Bits Cheer */}
                <div className="flex items-center justify-between pb-1.5 border-b border-purple-900/60 px-1">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                    <span className="font-bold text-xs text-purple-200">
                      Live Stream Chat
                    </span>
                  </div>
                  <button
                    onClick={handleCheerBits}
                    className="flex items-center gap-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-black px-2 py-0.5 rounded-lg text-[9px] shadow border border-pink-300 transition active:scale-95"
                  >
                    <Gem className="w-2.5 h-2.5" /> 100 Bits
                  </button>
                </div>

                {/* Scrollable Live Chat Feed */}
                <div
                  ref={chatScrollRef}
                  className="flex-1 overflow-y-auto space-y-1.5 my-1.5 px-1 pr-1.5 text-[11px] font-sans scroll-smooth"
                >
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className="leading-snug flex items-start gap-1.5 hover:bg-stone-900/40 p-0.5 rounded transition"
                    >
                      {/* Badges */}
                      {msg.badge === 'host' && (
                        <span className="bg-red-500 text-stone-950 text-[8px] font-black px-1 rounded tracking-wide">
                          HOST
                        </span>
                      )}
                      {msg.badge === 'mod' && (
                        <span className="bg-emerald-500 text-stone-950 text-[8px] font-black px-1 rounded tracking-wide">
                          MOD
                        </span>
                      )}
                      {msg.badge === 'vip' && (
                        <span className="bg-yellow-400 text-stone-950 text-[8px] font-black px-1 rounded tracking-wide">
                          VIP
                        </span>
                      )}
                      {msg.badge === 'sub' && (
                        <span className="bg-pink-500 text-white text-[8px] font-black px-1 rounded tracking-wide">
                          SUB
                        </span>
                      )}
                      {msg.badge === 'verified' && (
                        <span className="bg-purple-500 text-white text-[8px] font-black px-1 rounded tracking-wide">
                          PRO
                        </span>
                      )}

                      <span style={{ color: msg.color }} className="font-bold shrink-0">
                        {msg.user}:
                      </span>
                      <span className="text-stone-100 break-words">{msg.text}</span>
                    </div>
                  ))}
                </div>

                {/* Quick Emote Reactions Bar */}
                <div className="flex items-center gap-1 px-1 py-1 border-t border-purple-950 overflow-x-auto">
                  {EMOTES.map((em) => (
                    <button
                      key={em}
                      onClick={() => {
                        sounds.playClick();
                        setInputChat((prev) => prev + em);
                      }}
                      className="hover:scale-125 transition text-xs p-0.5 rounded"
                      type="button"
                    >
                      {em}
                    </button>
                  ))}
                </div>

                {/* Send Chat Form */}
                <form onSubmit={handleSendChat} className="flex gap-1.5 mt-1">
                  <input
                    type="text"
                    value={inputChat}
                    onChange={(e) => setInputChat(e.target.value)}
                    placeholder="Send a message to live chat..."
                    className="flex-1 bg-stone-900 border border-purple-500/40 text-stone-100 text-xs px-2.5 py-1.5 rounded-xl outline-none focus:border-purple-400"
                  />
                  <button
                    type="submit"
                    className="bg-purple-600 hover:bg-purple-500 text-white px-3 py-1.5 rounded-xl font-bold transition active:scale-95 flex items-center justify-center"
                    title="Send"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
