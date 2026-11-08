import React, { useState } from 'react';
import { X, Globe, Image, Video, Mic, Send, Sparkles, ChevronDown } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { PlayerProfile } from '../types/poker';

interface PalaceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile?: PlayerProfile;
}

interface Message {
  sender: 'assistant' | 'user';
  text: string;
}

const TOP_10_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', welcome: 'Welcome to Euchre Paradise! I can explain rules, help with strategy, or analyze game situations.' },
  { code: 'zh', name: 'Mandarin Chinese', native: '中文', welcome: '欢迎来到尤克天堂！我可以解释规则、协助策略，或分析游戏局势。' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', welcome: 'यूकर पैराडाइज में आपका स्वागत है! मैं नियमों की व्याख्या कर सकता हूँ और रणनीति में मदद कर सकता हूँ।' },
  { code: 'es', name: 'Spanish', native: 'Español', welcome: '¡Bienvenido a Euchre Paradise! Puedo explicar reglas, ayudar con estrategias o analizar situaciones de juego.' },
  { code: 'fr', name: 'French', native: 'Français', welcome: 'Bienvenue à Euchre Paradise! Je peux expliquer les règles, vous aider avec les stratégies et analyser les cartes.' },
  { code: 'ar', name: 'Arabic', native: 'العربية', welcome: 'مرحبًا بك في يوكار بارادايس! يمكنني شرح القواعد والمساعدة في الاستراتيجية واستعراض اللعب.' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', welcome: 'ইউকার প্যারাডাইসে স্বাগতম! আমি কৌশল এবং নিয়মকানুন ব্যাখ্যা করতে পারি।' },
  { code: 'ru', name: 'Russian', native: 'Русский', welcome: 'Добро пожаловать в Euchre Paradise! Я могу объяснить правила, помочь с стратегией и разобрать расклады.' },
  { code: 'pt', name: 'Portuguese', native: 'Português', welcome: 'Bem-vindo ao Euchre Paradise! Posso explicar regras, ajudar na estratégia e analisar jogadas.' },
  { code: 'ur', name: 'Urdu', native: 'اردو', welcome: 'یوکر پیراڈائز میں خوش آمدید! میں قواعد اور حکمت عملی کی وضاحت کر سکتا ہوں۔' },
];

export const PalaceAssistantModal: React.FC<PalaceAssistantModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
}) => {
  const [selectedLang, setSelectedLang] = useState(TOP_10_LANGUAGES[0]);
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: TOP_10_LANGUAGES[0].welcome,
    },
  ]);
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleLanguageChange = (lang: typeof TOP_10_LANGUAGES[0]) => {
    sounds.playClick();
    setSelectedLang(lang);
    setShowLangDropdown(false);
    setMessages((prev) => {
      // Change language of default greeting message directly without adding a second message
      if (prev.length > 0 && prev[0].sender === 'assistant') {
        const updated = [...prev];
        updated[0] = { ...updated[0], text: lang.welcome };
        return updated;
      }
      return [{ sender: 'assistant', text: lang.welcome }];
    });
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    sounds.playClick();
    const userMsg = inputValue;
    setMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setInputValue('');

    // AI response simulation grounded in selected language
    setTimeout(() => {
      let reply = `[${selectedLang.name}] In Euchre, Jacks of the trump suit and matching color suit are the highest trump cards (Right Bower and Left Bower)! Remember to count tricks carefully.`;
      if (userMsg.toLowerCase().includes('rule') || userMsg.toLowerCase().includes('how')) {
        reply = `[${selectedLang.name}] Euchre is played with 24 cards (9 through Ace). Each team aims to take 3 out of 5 tricks to score 1 point, or 5 tricks for 2 points!`;
      } else if (userMsg.toLowerCase().includes('strategy') || userMsg.toLowerCase().includes('win')) {
        reply = `[${selectedLang.name}] Always try to lead your partner's called suit! If you hold both Bowers, consider calling a Loner for massive points.`;
      }
      setMessages((prev) => [...prev, { sender: 'assistant', text: reply }]);
      sounds.playWin();
    }, 800);
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 w-[520px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-6rem)] aspect-square bg-[#0b1329] border-2 border-emerald-500/80 rounded-3xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.95)] text-white flex flex-col justify-between overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
      {/* Top Header with Glowing Language Dropdown */}
      <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800 relative z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
          <div>
            <h3 className="font-black text-base sm:text-lg text-white leading-none">Palace Assistant</h3>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">Multimodal AI • {selectedLang.native}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 relative">
          {/* Glowing Top 10 World Language Dropdown Trigger */}
          <button
            onClick={() => setShowLangDropdown(!showLangDropdown)}
            className="px-2.5 py-1.5 rounded-2xl bg-slate-900 border-2 border-emerald-400/80 text-emerald-300 flex items-center gap-1.5 hover:bg-slate-800 transition shadow-[0_0_15px_rgba(52,211,153,0.4)] text-xs font-black cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
            <span>{selectedLang.native}</span>
            <ChevronDown className="w-3 h-3 text-emerald-400" />
          </button>

          {/* Language Dropdown List */}
          {showLangDropdown && (
            <div className="absolute top-full right-0 mt-2 z-50 w-56 bg-[#080e1e] border-2 border-emerald-500 rounded-2xl p-2 shadow-2xl text-xs space-y-1 animate-in fade-in duration-150">
              <div className="px-2 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 border-b border-slate-800">
                TOP 10 WORLD LANGUAGES
              </div>
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {TOP_10_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl font-bold flex items-center justify-between transition ${
                      selectedLang.code === lang.code
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-black'
                        : 'text-stone-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">{lang.native}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition active:scale-90"
          >
            <X className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
      </div>

      {/* Chat Messages Body */}
      <div className="flex-1 w-full overflow-y-auto py-3 space-y-3 pr-1">
          <div className="text-center">
            <span className="text-[10px] font-black tracking-widest uppercase text-stone-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">
              TODAY
            </span>
          </div>

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-9 h-9 rounded-2xl bg-emerald-400 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5" />
                </div>
              )}

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed shadow-lg ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-[#121f3d] border border-slate-700 text-stone-200 rounded-bl-none'
                }`}
              >
                {msg.sender === 'assistant' && (
                  <p className="text-[11px] font-black text-emerald-400 mb-1">Palace Assistant</p>
                )}
                <p>{msg.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar Controls matching Screenshot 2 */}
        <div className="w-full pt-3 border-t border-slate-800 flex items-center gap-2">
          {/* File Image Button */}
          <button className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-emerald-400">
            <Image className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-cyan-500 text-[8px] font-black text-stone-950 rounded-full flex items-center justify-center">
              +
            </span>
          </button>

          {/* Video Play Button */}
          <button className="relative p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-cyan-400">
            <Video className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 text-[8px] font-black text-white rounded-full flex items-center justify-center">
              1
            </span>
          </button>

          {/* Mic Button */}
          <button className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-stone-300">
            <Mic className="w-4 h-4" />
          </button>

          {/* Input Box */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask about Euchre..."
            className="flex-1 bg-[#101b36] border border-slate-700 rounded-2xl px-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400 placeholder:text-stone-500"
          />

          {/* Green Send Button */}
          <button
            onClick={handleSendMessage}
            className="p-3 bg-emerald-400 hover:bg-emerald-300 text-stone-950 rounded-2xl font-black transition active:scale-95 shadow-lg"
          >
            <Send className="w-4 h-4 stroke-[3]" />
          </button>
        </div>
    </div>
  );
};
