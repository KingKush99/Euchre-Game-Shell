import React, { useState } from 'react';
import { X, HelpCircle, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';

interface FAQModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile?: PlayerProfile;
}

export const FAQ_QUESTIONS = [
  {
    id: 1,
    question: "How do I play Euchre and what cards are used?",
    answer: "Euchre is played with a 24-card deck (9, 10, J, Q, K, A of all four suits). 4 players compete in 2 partnerships (P0+P2 vs P1+P3).",
    level: "Novice",
  },
  {
    id: 2,
    question: "What is the Right Bower and Left Bower?",
    answer: "The Jack of the trump suit is the 'Right Bower' (highest card in the game). The Jack of the same color suit is the 'Left Bower' (second highest trump card!).",
    level: "Novice",
  },
  {
    id: 3,
    question: "What does calling a 'Loner' mean?",
    answer: "If you have an exceptionally strong trump hand, you can opt to play alone without your partner. Taking all 5 tricks awards 4 points!",
    level: "Novice",
  },
  {
    id: 4,
    question: "How do I earn Texas Sovereigns token currency?",
    answer: "Earn Sovereigns by winning Euchre matches, completing daily login streaks, defeating town bosses, playing arcade slots, and rolling the Daily Dice!",
    level: "Novice",
  },
  {
    id: 5,
    question: "How do I customize my 3D Character?",
    answer: "Open your Player Profile, select 'CUSTOMIZE CHARACTER', choose styles for eyes, hair, shirt, pants, and pick color palette swatches. Click 'SAVE CHARACTER'!",
    level: "Novice",
  },
  {
    id: 6,
    question: "How do I level up my XP rank?",
    answer: "Every match played, trick won, and daily activity awards XP. Level 1 requires 1,000 XP, Level 2 requires 3,000 XP, and every subsequent level adds 1,000 XP.",
    level: "Novice",
  },
  {
    id: 7,
    question: "What is the difference between chips, gold, and Sovereigns?",
    answer: "Chips are used for table buy-ins; Gold buys properties & hats; Sovereigns are rare premium tokens usable in the Marketplace and high-stakes duels.",
    level: "Intermediate",
  },
  {
    id: 8,
    question: "How do Real Estate properties generate hourly income?",
    answer: "Purchased saloons, banks, and silver mines passively generate chips every hour even when offline. Collect them in the Real Estate modal!",
    level: "Intermediate",
  },
  {
    id: 9,
    question: "How does the Candy Crush-style Campaign map work?",
    answer: "Travel across 10 Texas cities (Austin, San Antonio, Houston, Dallas, etc.), earning up to 3 stars per city and unlocking boss showdowns!",
    level: "Intermediate",
  },
  {
    id: 10,
    question: "What is the Daily Dice Yahtzee reward multiplier?",
    answer: "Roll 5 dice up to 3 times to form Yahtzee combinations (Full House, Large Straight, 5 of a kind). Your final score is doubled into free token rewards!",
    level: "Intermediate",
  },
  {
    id: 11,
    question: "How do item rarities work in Inventory?",
    answer: "Items fall into 4 tiers: Common (80% drop rate), Rare (15% drop rate), Legendary (4% drop rate), and God Tier (1% ultra-rare drop rate).",
    level: "Intermediate",
  },
  {
    id: 12,
    question: "How do I send DMs and Notes to Self?",
    answer: "Click the blue DMs button on the right edge of your screen, or click 'Note to self' on your profile to record personal notes and strategies.",
    level: "Intermediate",
  },
  {
    id: 13,
    question: "How do I change my Username & Mascot avatar?",
    answer: "Click the edit pencil icon on your profile avatar to open the Profile Details modal. Select from 32 CSS mascots or upload your own photo!",
    level: "Intermediate",
  },
  {
    id: 14,
    question: "Why is there a 7-day restriction on username changes?",
    answer: "To prevent identity fraud and maintain clean multiplayer standings, usernames can only be updated once every 7 calendar days.",
    level: "Experienced",
  },
  {
    id: 15,
    question: "How does the Marketplace Crypto cash out function?",
    answer: "In the Marketplace tab, request cash outs to SOL, BTC, ETH, or USDT wallets, or trade Sovereigns tokens directly for in-game assets.",
    level: "Experienced",
  },
  {
    id: 16,
    question: "What happens when you 'Euchre' the calling team?",
    answer: "If the team that called trump fails to take at least 3 tricks, they are 'Euchred' and the defending team scores 2 points!",
    level: "Experienced",
  },
  {
    id: 17,
    question: "How do right-click context menus work on player profiles?",
    answer: "Right-click any player's name in follower/following lists to quick-action: Add Friend, Send Message, or Visit Profile.",
    level: "Experienced",
  },
  {
    id: 18,
    question: "How do I rotate and zoom my 3D character in Palace Studio?",
    answer: "Click & drag on the 3D character preview or scroll your mouse wheel to spin and inspect your avatar in full 360° space.",
    level: "Experienced",
  },
  {
    id: 19,
    question: "Can I watch live Twitch streams inside the app?",
    answer: "Yes! Click the Twitch Live Chat button on the middle-left edge to open stream chat, or select the Live Stream action card on the home screen.",
    level: "Experienced",
  },
  {
    id: 20,
    question: "How does the Palace Assistant AI help in real time?",
    answer: "Click the bottom-left AI button to ask questions about rules, upload screenshots, or get instant tactical Euchre tips.",
    level: "Experienced",
  },
  {
    id: 21,
    question: "What are the rules for sorting Home Screen Action Cards?",
    answer: "Use the sort buttons: 'default' toggles custom order, 'use' sorts by frequency, 'name' sorts A-Z / Z-A, and 'color' sorts by hue vibrancy.",
    level: "Master",
  },
  {
    id: 22,
    question: "How do I unlock God Tier legendary items?",
    answer: "God Tier items (1% chance) drop exclusively from conquering final city bosses and achieving top rank in monthly Governor tournaments.",
    level: "Master",
  },
  {
    id: 23,
    question: "What are the 10 settings tabs in the Settings modal?",
    answer: "Access Notification, Audio, Visual, Privacy, Accessibility, Language, Gameplay, Safety, Data & Storage, and Account Security controls.",
    level: "Master",
  },
  {
    id: 24,
    question: "How does history stack navigation work on player bios?",
    answer: "When visiting profiles from search or follower lists, click the red top-left Back Arrow (←) to step back through visited bios.",
    level: "Master",
  },
  {
    id: 25,
    question: "How do I unlock all 10 Texas Cities on the Campaign Map?",
    answer: "Defeat each city's reigning boss in turn: Austin → San Antonio → Houston → Dallas → El Paso → Fort Worth → Arlington → Corpus Christi → Plano → Lubbock!",
    level: "Master",
  },
];

export const FAQModal: React.FC<FAQModalProps> = ({ isOpen, onClose }) => {
  const [expandedId, setExpandedId] = useState<number | null>(1);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md flex flex-col gap-2 max-h-[85vh] overflow-hidden">
        {/* DROPDOWN CONTAINER ATTACHED RIGHT UNDERNEATH (Matching exact width and red theme color) */}
        <div className="relative w-full bg-gradient-to-b from-red-600 via-red-700 to-red-900 border-2 border-red-400 rounded-3xl p-4 flex flex-col flex-1 overflow-hidden shadow-2xl">
          {/* Close Button Top Right */}
          <div className="flex items-center justify-between pb-3 border-b border-red-500/50 mb-3">
            <span className="text-sm font-black uppercase text-amber-300 tracking-wider">
              Euchre Gameplay FAQ
            </span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition active:scale-90"
            >
              <X className="w-4 h-4 stroke-[3]" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[65vh]">
            {FAQ_QUESTIONS.map((q) => {
              const isExpanded = expandedId === q.id;
              return (
                <div key={q.id} className="flex flex-col">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setExpandedId(isExpanded ? null : q.id);
                    }}
                    className={`w-full p-3 rounded-2xl flex items-center justify-between text-left transition ${
                      isExpanded
                        ? 'bg-red-800 border-2 border-amber-400 shadow-lg'
                        : 'bg-[#61070d] hover:bg-red-800/80 border border-red-700/60'
                    }`}
                  >
                    <div className="flex items-center gap-3 pr-2">
                      {/* Yellow/Gold Circle Number Pill */}
                      <div className="w-7 h-7 rounded-full bg-amber-400 text-stone-950 font-black text-xs flex items-center justify-center shrink-0 shadow">
                        {q.id}
                      </div>

                      <span className="font-bold text-xs sm:text-sm text-white leading-snug">
                        {q.question}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-amber-300 shrink-0">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </button>

                  {/* Expanded Answer Body */}
                  {isExpanded && (
                    <div className="mt-1.5 p-3.5 bg-[#450308] border border-red-500/50 rounded-2xl text-xs text-red-100 leading-relaxed font-medium animate-in slide-in-from-top-1 duration-150 shadow-inner">
                      <div className="text-[10px] font-black uppercase text-amber-400 mb-1">
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
      </div>
    </div>
  );
};
