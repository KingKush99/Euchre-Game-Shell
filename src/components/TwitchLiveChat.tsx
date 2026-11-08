import React, { useState, useEffect, useRef } from 'react';
import { TwitchChatMessage } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { Send, Smile, MessageSquare, X } from 'lucide-react';

export const TwitchGlitchIcon: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Black 3D shadow extrusion */}
    <path d="M50 30 H190 V130 H150 L120 160 H90 L70 180 V160 H50 V30 Z" fill="black" />
    {/* White main chat bubble face */}
    <path d="M65 45 H185 V125 H145 L115 155 H95 V125 H65 V45 Z" fill="white" />
    {/* Two vertical black slit eyes */}
    <rect x="110" y="70" width="16" height="30" fill="black" />
    <rect x="150" y="70" width="16" height="30" fill="black" />
  </svg>
);

interface TwitchLiveChatProps {
  lastGameEvent?: {
    type: 'allin' | 'win' | 'fold' | 'raise' | 'conquer' | 'badbeat' | 'idle';
    actorName?: string;
    amount?: number;
  };
  onClose?: () => void;
}

const DEFAULT_MESSAGES: TwitchChatMessage[] = [
  {
    id: 'm1',
    username: 'Gunslinger',
    userColor: '#ec4899',
    badge: 'sub',
    message: 'Let’s goooo! Road to Dallas Governor! 🤠',
    time: '12:01',
  },
  {
    id: 'm2',
    username: 'PokerQueen',
    userColor: '#a855f7',
    badge: 'vip',
    message: 'That river call in San Antonio was pure ice in the veins 🔥',
    time: '12:01',
  },
  {
    id: 'm3',
    username: 'RiverRat',
    userColor: '#3b82f6',
    message: 'Never fold pocket pairs! NEVER! 💰',
    time: '12:02',
  },
  {
    id: 'm4',
    username: 'Sheriff_MOD',
    userColor: '#10b981',
    badge: 'mod',
    message: 'Welcome everyone! Keep it clean in the saloon chat 📜',
    time: '12:02',
  },
];

const QUICK_EMOTES = ['🤠', '🔥', '💰', '🃏', '👑', '⭐', '💀'];

const RANDOM_CHATTERS = [
  { name: 'TexanAce', color: '#06b6d4', badge: 'sub' as const },
  { name: 'CowboyGamer', color: '#eab308', badge: 'vip' as const },
  { name: 'CardsOnFire', color: '#f43f5e', badge: undefined },
  { name: 'HoldEmLegend', color: '#8b5cf6', badge: 'sub' as const },
  { name: 'DocHolliday', color: '#10b981', badge: 'vip' as const },
];

export const TwitchLiveChat: React.FC<TwitchLiveChatProps> = ({ lastGameEvent, onClose }) => {
  const [messages, setMessages] = useState<TwitchChatMessage[]>(DEFAULT_MESSAGES);
  const [inputMsg, setInputMsg] = useState('');
  const [showEmotes, setShowEmotes] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Periodic random chatter
  useEffect(() => {
    const interval = setInterval(() => {
      const chatter = RANDOM_CHATTERS[Math.floor(Math.random() * RANDOM_CHATTERS.length)];
      const randomTexts = [
        'W play right here 🤠',
        'Stack those chips! 💰',
        'Who is ready for Dallas?! ⭐',
        'EZ win today boys 🔥',
        'Governor of Poker GOAT 👑',
      ];
      const text = randomTexts[Math.floor(Math.random() * randomTexts.length)];
      const now = new Date();
      const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

      setMessages((prev) => [
        ...prev.slice(-30),
        {
          id: `rand_${Date.now()}`,
          username: chatter.name,
          userColor: chatter.color,
          badge: chatter.badge,
          message: text,
          time: timeStr,
        },
      ]);
    }, 5500);

    return () => clearInterval(interval);
  }, []);

  // React to game events
  useEffect(() => {
    if (!lastGameEvent) return;

    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;
    let text = '';
    let user = 'StreamChat';
    let color = '#ec4899';

    if (lastGameEvent.type === 'allin') {
      text = `🚨 ALL-IN ALERT!! HOLD ON TO YOUR STETSONS!! 💰💰`;
      user = 'AllInBot';
      color = '#ef4444';
    } else if (lastGameEvent.type === 'win') {
      text = `HUGE POT WON!! +$${(lastGameEvent.amount || 0).toLocaleString()} 🤑 🔥`;
      user = 'HighRoller';
      color = '#eab308';
    } else if (lastGameEvent.type === 'conquer') {
      text = `🏆 NEW TERRITORY CONQUERED!! 👑⭐`;
      user = 'FrontierHost';
      color = '#3b82f6';
    }

    if (text) {
      setMessages((prev) => [
        ...prev.slice(-30),
        {
          id: `evt_${Date.now()}`,
          username: user,
          userColor: color,
          badge: 'mod',
          message: text,
          time: timeStr,
        },
      ]);
    }
  }, [lastGameEvent]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    sounds.playClick();
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}`;

    setMessages((prev) => [
      ...prev.slice(-30),
      {
        id: `user_${Date.now()}`,
        username: 'You',
        userColor: '#38bdf8',
        badge: 'broadcaster',
        message: inputMsg.trim(),
        time: timeStr,
      },
    ]);

    setInputMsg('');
    setShowEmotes(false);
  };

  return (
    <div className="fixed top-1/2 -translate-y-1/2 left-20 sm:left-22 z-50 w-[380px] sm:w-[440px] h-[380px] sm:h-[440px] max-w-[calc(100vw-6.5rem)] max-h-[calc(100vh-2rem)] aspect-square bg-stone-950/95 border-2 border-[#9146FF] rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-md overflow-hidden flex flex-col animate-in slide-in-from-left-5 duration-200 font-sans">
      {/* Twitch Chat Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#9146FF] text-white border-b border-purple-400/40 shrink-0">
        <div className="flex items-center gap-2 font-bold text-xs">
          <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
            <path d="M11.571 4.714h1.715v5.143h-1.715zm4.715 0h1.714v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
          </svg>
          <span className="font-black tracking-wider uppercase">Stream Chat</span>
        </div>

        <button
          onClick={() => {
            sounds.playClick();
            if (onClose) onClose();
          }}
          className="w-6 h-6 rounded-full bg-black/30 hover:bg-rose-600 text-purple-100 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow"
          title="Close Twitch Chat"
          aria-label="Close"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>

      {/* Messages Feed */}
      <div
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#0e0e10] text-xs leading-relaxed min-h-0"
      >
        {messages.map((m) => (
          <div key={m.id} className="break-words">
            <span className="text-[10px] text-stone-500 mr-1.5 font-bold">{m.time}</span>
            <span className="font-black mr-1 cursor-pointer" style={{ color: m.userColor }}>
              {m.username}:
            </span>
            <span className="text-stone-200">{m.message}</span>
          </div>
        ))}
      </div>

      {/* Quick Emotes Bar */}
      {showEmotes && (
        <div className="bg-stone-900 p-1.5 flex items-center justify-around border-t border-stone-800 shrink-0">
          {QUICK_EMOTES.map((em) => (
            <button
              key={em}
              onClick={() => setInputMsg((p) => `${p} ${em}`.trim())}
              className="text-base p-1 hover:bg-stone-800 rounded transition"
            >
              {em}
            </button>
          ))}
        </div>
      )}

      {/* Chat Form */}
      <form onSubmit={handleSendMessage} className="p-2 bg-stone-950 flex items-center gap-1.5 border-t border-stone-800 shrink-0">
        <button
          type="button"
          onClick={() => setShowEmotes(!showEmotes)}
          className="p-1.5 text-stone-400 hover:text-purple-300 transition"
        >
          <Smile className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Send a chat message..."
          className="flex-1 bg-stone-900 border border-stone-800 focus:border-[#9146FF] text-stone-100 text-xs px-2.5 py-1.5 rounded-xl outline-none"
        />

        <button
          type="submit"
          disabled={!inputMsg.trim()}
          className="p-2 bg-[#9146FF] hover:bg-[#772ce8] disabled:opacity-40 text-white rounded-xl transition"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
