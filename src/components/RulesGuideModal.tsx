import React, { useState, useRef } from 'react';
import {
  X,
  Compass,
  FileText,
  Play,
  Sparkles,
  ChevronRight,
  Gamepad2,
  Users,
  MapPin,
  BookOpen,
  Crown,
  Building2,
  Coins,
  HelpCircle,
  Sliders,
  User,
  Dices,
  Calendar,
  Mail,
  Tv,
  Music,
  BarChart3,
  Menu,
  MessageSquare,
  Smile,
  Bot,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { ThreeCharacterCanvas } from './ThreeCharacterCanvas';

interface RulesGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile?: PlayerProfile;
  onLaunchWalkthrough?: () => void;
}

const WALKTHROUGH_OVERVIEW_BUTTONS = [
  { id: 1, title: 'Single Player Match', icon: Gamepad2, category: 'Lobby', desc: 'Instant 4-player AI showdown with custom bots' },
  { id: 2, title: 'Multiplayer Lobby', icon: Users, category: 'Lobby', desc: 'Real-time online tables and private match codes' },
  { id: 3, title: 'Frontier Campaign Map', icon: MapPin, category: 'Adventure', desc: '10 Texas cities, 3D saloon walks & boss duels' },
  { id: 4, title: 'Rules Documentation', icon: BookOpen, category: 'Knowledge', desc: 'Concise official single-page manual' },
  { id: 5, title: '3D Hats & Themes', icon: Sparkles, category: 'Customization', desc: '3D cowboy hats, painted felts & custom card backs' },
  { id: 6, title: '10-Tier Leaderboard', icon: Crown, category: 'Rankings', desc: 'Dealer to Grand Euchre, top clans & player ladder' },
  { id: 7, title: 'Saloon Real Estate', icon: Building2, category: 'Economy', desc: 'Buy saloons, mines & ranches for daily rent payouts' },
  { id: 8, title: 'Coin & Token Shop', icon: Coins, category: 'Economy', desc: 'Sovereign tokens, chips & saloon booster bundles' },
  { id: 9, title: 'FAQ & Strategy Guide', icon: HelpCircle, category: 'Knowledge', desc: 'Bidding tactics & accordion dropdown pro-tips' },
  { id: 10, title: 'Settings & Audio', icon: Sliders, category: 'System', desc: 'Volume mixers, auto-deal toggles & graphic styles' },
  { id: 11, title: 'Player Profile & 3D Dossier', icon: User, category: 'Identity', desc: '3D avatar editor, win rates & match statistics' },
  { id: 12, title: 'Daily Dice Fortune', icon: Dices, category: 'Rewards', desc: '24h lucky dice roll for jackpot chip multipliers' },
  { id: 13, title: 'Daily Calendar Rewards', icon: Calendar, category: 'Rewards', desc: '30-day streak rewards & saloon treasure chests' },
  { id: 14, title: 'Mailbox & Direct Messages', icon: Mail, category: 'Social', desc: 'Friend gifts, clan notices & achievement rewards' },
  { id: 15, title: 'YouTube Live Tournaments', icon: Tv, category: 'Media', desc: 'Embedded live championships & real-time chat' },
  { id: 16, title: 'Saloon Music Jukebox', icon: Music, category: 'Media', desc: 'Authentic country saloon tracks & volume player' },
  { id: 17, title: 'Top-Left Live Scoreboard', icon: BarChart3, category: 'Table', desc: '10-point match target & team trick counter' },
  { id: 18, title: 'Top-Right Hamburger Menu', icon: Menu, category: 'Table', desc: 'Consolidated menu dropping down directly underneath' },
  { id: 19, title: 'Bottom-Left Chat & Logs', icon: MessageSquare, category: 'Table', desc: 'TAB key toggle for live chat and play-by-play logs' },
  { id: 20, title: 'Bottom-Right 32 Emote Actions', icon: Smile, category: 'Table', desc: '10 free gestures & 22 progressive animated sound emotes' },
  { id: 21, title: 'Footer AI Assistant & Slots', icon: Bot, category: 'Palace', desc: 'Interactive saloon AI chatbot & mini slot machine' },
];

export const RulesGuideModal: React.FC<RulesGuideModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onLaunchWalkthrough,
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'walkthrough'>('docs');
  const [selectedOverviewButton, setSelectedOverviewButton] = useState<number | null>(null);
  const docContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const scrollToSection = (id: string) => {
    sounds.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        style={{
          width: 'min(1180px, calc(100vw - 24px))',
          height: 'min(860px, calc(100vh - 24px))',
        }}
        className="relative bg-[#0c1222] border-2 border-slate-700 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-slate-100 shrink-0"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#090e1a] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              {activeTab === 'docs' ? <FileText className="w-5 h-5" /> : <Compass className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight font-serif">
                {activeTab === 'docs' ? 'Official Rules Documentation' : 'Interactive Site Guide Walkthrough'}
              </h2>
              <p className="text-[11px] text-slate-400">
                Official Rules, Card Rankings & Gameplay Manual
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        {/* TWO PROMINENT TABS: 1. DOCUMENTATION (DOCS) vs 2. LAUNCHING SITE WALKTHROUGH */}
        <div className="grid grid-cols-2 gap-2 px-5 py-2.5 bg-[#080d18] border-b border-slate-800 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('docs');
            }}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-amber-500 text-slate-950 shadow-md ring-2 ring-amber-400'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>1. Rules Documentation (Docs)</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('walkthrough');
            }}
            className={`py-2 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'walkthrough'
                ? 'bg-emerald-500 text-slate-950 shadow-md ring-2 ring-emerald-400'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>2. Launching the Site Walkthrough (21 Steps)</span>
          </button>
        </div>

        {/* TAB 1: RULES DOCUMENTATION (PDF / DOCS FORMAT WITH LEFT-SIDE JUMP NAVIGATION) */}
        {activeTab === 'docs' && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#060a14]">
            {/* LEFT-SIDE VERTICAL JUMP NAVIGATION */}
            <div className="w-full md:w-64 bg-[#090f1d] border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col shrink-0 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-800">
                <FileText className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">
                  Jump To Section
                </span>
              </div>

              <nav className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 text-xs font-bold">
                {[
                  { id: 'sec-overview', label: '1. Overview & Deal', icon: '🃏' },
                  { id: 'sec-bowers', label: '2. Trump & Bowers', icon: '⚡' },
                  { id: 'sec-bidding', label: '3. Bidding Rules', icon: '🗣️' },
                  { id: 'sec-gameplay', label: '4. Trick Play', icon: '🎯' },
                  { id: 'sec-scoring', label: '5. Scoring & Loner', icon: '🏆' },
                  { id: 'sec-saloon', label: '6. Saloon Rules', icon: '🤠' },
                  { id: 'sec-tiers', label: '7. 10 Rank Tiers', icon: '👑' },
                ].map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-slate-300 hover:text-white bg-slate-900/60 hover:bg-amber-500/20 border border-slate-800/80 hover:border-amber-400/40 transition text-left whitespace-nowrap cursor-pointer group"
                  >
                    <span className="text-sm group-hover:scale-110 transition">{sec.icon}</span>
                    <span className="truncate">{sec.label}</span>
                  </button>
                ))}
              </nav>

              <div className="hidden md:block mt-auto pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                <p className="font-semibold text-slate-300 mb-1">💡 Quick Tip:</p>
                <p className="leading-snug">The Left Bower is always the Jack matching the trump color (e.g. Jack of Diamonds when Hearts is trump).</p>
              </div>
            </div>

            {/* ONE SINGLE UNIFIED DOCUMENT CONTAINER (PDF / DOCS STYLE) */}
            <div
              ref={docContainerRef}
              className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto bg-[#080e1c] select-text w-full"
            >
              <div className="w-full bg-[#0c1426] border border-slate-700/80 rounded-2xl p-6 sm:p-8 md:p-10 shadow-xl space-y-8 text-slate-200 text-sm leading-relaxed font-sans">
                
                {/* SECTION 1: OVERVIEW & DEAL */}
                <section id="sec-overview" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>1. Overview & Dealing</span>
                  </h2>
                  <p>
                    Euchre is a classic 4-player trick-taking card game played in two fixed partnerships facing each other across the table (North-South vs. East-West).
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-slate-300 pl-2">
                    <li><strong className="text-white">Deck:</strong> 24 cards comprising 9, 10, Jack, Queen, King, and Ace in all four suits.</li>
                    <li><strong className="text-white">Deal:</strong> Each player is dealt 5 cards. The remaining 4 cards form the <em>Kitty</em>, placed face down on the center table.</li>
                    <li><strong className="text-white">Turn-Up:</strong> The top card of the kitty is turned face up, initiating Round 1 of Trump bidding.</li>
                  </ul>
                </section>

                {/* SECTION 2: TRUMP & BOWERS */}
                <section id="sec-bowers" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>2. Trump & The Bowers Hierarchy</span>
                  </h2>
                  <p>
                    Trump is the dominant suit that outranks all standard suit cards. The Jacks hold special sovereign power:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
                    <li><strong className="text-amber-200">Right Bower:</strong> The Jack of the declared trump suit. It is the highest and most powerful card in the game.</li>
                    <li><strong className="text-amber-200">Left Bower:</strong> The Jack of the <em>same color</em> as the trump suit (e.g., Jack of Diamonds when Hearts is Trump). It legally becomes a Trump card and is the second-highest card in the game.</li>
                    <li><strong className="text-white">Trump Rank:</strong> Right Bower &gt; Left Bower &gt; Ace &gt; King &gt; Queen &gt; 10 &gt; 9.</li>
                    <li><strong className="text-white">Non-Trump Rank:</strong> Ace &gt; King &gt; Queen &gt; Jack (unless Left Bower) &gt; 10 &gt; 9.</li>
                  </ul>
                </section>

                {/* SECTION 3: BIDDING */}
                <section id="sec-bidding" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>3. Bidding Phases</span>
                  </h2>
                  <p>
                    Bidding establishes the Trump suit for the hand:
                  </p>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
                    <li><strong className="text-white">Round 1 (Turn-Up Card):</strong> Starting clockwise from the dealer’s left, players may <em>Order Up</em> the turned-up suit as Trump, or <em>Pass</em>. If ordered up, the dealer picks up the turned-up card into their hand and discards one card face-down.</li>
                    <li><strong className="text-white">Round 2 (Any Suit):</strong> If all 4 players pass in Round 1, the top card is turned down. Players may call any of the other 3 suits, or pass.</li>
                    <li><strong className="text-white">Stick the Dealer:</strong> If all players pass Round 2, the dealer is required to name a trump suit.</li>
                    <li><strong className="text-white">Going Alone:</strong> Any player who declares Trump can choose to <em>Go Alone</em>. Their partner sits out the hand face-down, allowing the loner to attempt a 4-point sweep.</li>
                  </ul>
                </section>

                {/* SECTION 4: TRICK PLAY */}
                <section id="sec-gameplay" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>4. Gameplay & Trick Taking</span>
                  </h2>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
                    <li>The player to the dealer’s left leads the first card. Each player plays one card clockwise.</li>
                    <li><strong className="text-white">Follow Suit Rule:</strong> You must play a card matching the led suit if you have one. Remember that the Left Bower is legally part of the Trump suit, not its original printed suit.</li>
                    <li>If you have no cards of the led suit, you may play a Trump card to win the trick, or play any off-suit card (sluff).</li>
                    <li>The highest trump played wins the trick. If no trump was played, the highest card of the led suit wins. The winner of each trick leads the next card.</li>
                  </ul>
                </section>

                {/* SECTION 5: SCORING & LONER */}
                <section id="sec-scoring" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>5. Scoring & Match Points</span>
                  </h2>
                  <p>
                    The team that calls Trump (the <em>Makers</em>) must take at least 3 of the 5 tricks to fulfill their contract:
                  </p>
                  <div className="bg-[#080d18] border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Makers win 3 or 4 tricks</span>
                      <strong className="text-amber-300 font-mono">1 Point</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Makers win all 5 tricks (March)</span>
                      <strong className="text-amber-300 font-mono">2 Points</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-300">Loner wins all 5 tricks (Alone March)</span>
                      <strong className="text-amber-300 font-mono">4 Points</strong>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-rose-300">Defenders win 3+ tricks (Euchre!)</span>
                      <strong className="text-rose-400 font-mono">2 Points to Defenders</strong>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className="text-emerald-300 font-bold">Winning the Game</span>
                      <strong className="text-emerald-400 font-mono">First to 10 Points</strong>
                    </div>
                  </div>
                </section>

                {/* SECTION 6: SALOON RULES */}
                <section id="sec-saloon" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>6. Saloon Rules & Economy</span>
                  </h2>
                  <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
                    <li><strong className="text-white">Chips:</strong> Used for table stakes, purchasing saloon properties, and unlocking cosmetic items.</li>
                    <li><strong className="text-white">Sovereign Tokens:</strong> Premium reward tokens won through tournaments, achievements, and campaign boss duels.</li>
                    <li><strong className="text-white">32 Emote Actions:</strong> Express yourself at the table with genuine character gestures and audio cheers. The first 10 emotes are completely free for all players.</li>
                    <li><strong className="text-white">Fair Play & RNG:</strong> Card shuffling uses cryptographically secure random distribution. Computer players have zero knowledge of hidden cards.</li>
                  </ul>
                </section>

                {/* SECTION 7: 10 TIERS */}
                <section id="sec-tiers" className="space-y-3">
                  <h2 className="text-lg font-black text-amber-300 flex items-center gap-2 border-b border-slate-800 pb-1.5 font-serif">
                    <span>7. Competitive Rank Tiers</span>
                  </h2>
                  <p>
                    Players progress through 10 official skill tiers by winning ranked matches and tournaments:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs font-mono">
                    {[
                      { name: '1. Dealer', elo: '0 - 499' },
                      { name: '2. Caller', elo: '500 - 999' },
                      { name: '3. Taker', elo: '1,000 - 1,499' },
                      { name: '4. Guard', elo: '1,500 - 1,999' },
                      { name: '5. Maker', elo: '2,000 - 2,499' },
                      { name: '6. Artist', elo: '2,500 - 2,999' },
                      { name: '7. Lonestar', elo: '3,000 - 3,499' },
                      { name: '8. Master', elo: '3,500 - 3,999' },
                      { name: '9. Bower Power', elo: '4,000 - 4,499' },
                      { name: '10. Grand Euchre', elo: '4,500+' },
                    ].map((t, idx) => (
                      <div key={idx} className="p-2 bg-[#080d18] border border-slate-800 rounded-lg text-center">
                        <div className="font-bold text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-amber-400">{t.elo} ELO</div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* In-Document Bottom Back to Top */}
                <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                  <span>Official Saloon Rules Manual</span>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      if (docContainerRef.current) {
                        docContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="text-amber-400 hover:text-amber-300 font-bold cursor-pointer transition flex items-center gap-1"
                  >
                    <span>Back to top</span>
                    <span>↑</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LAUNCHING THE SITE WALKTHROUGH (CLEAN LAUNCH HUB WITHOUT START BUTTON MATRIX) */}
        {activeTab === 'walkthrough' && (
          <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#070b16] flex flex-col justify-between select-none">
            <div className="space-y-6 max-w-4xl mx-auto w-full">
              
              {/* Hero Launch Card with 3D Character Preview & Call To Action */}
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-amber-950/60 border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  {/* Free-standing 3D character preview */}
                  <div className="relative w-28 h-36 sm:w-32 sm:h-40 shrink-0">
                    <ThreeCharacterCanvas
                      eyeStyle={playerProfile?.eyeStyle || 'Classic Dot'}
                      noseStyle={playerProfile?.noseStyle || 'Pointed Nose'}
                      mouthStyle={playerProfile?.mouthStyle || 'Smile'}
                      hairStyle={playerProfile?.hairStyle || 'Cowboy Hat + Pigtails'}
                      colors={{
                        hair: playerProfile?.hairColor || '#3b2314',
                        shirt: playerProfile?.shirtColor || '#ec4899',
                        pants: '#1e293b',
                        shoes: '#000000',
                        eyes: '#1e293b',
                        skin: playerProfile?.skinColor || '#fcd34d',
                      }}
                      autoRotate={false}
                      zoom={3.4}
                      rotationAngle={0.1}
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/40">
                      INTERACTIVE FULL-SCREEN TOUR
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white mt-2 font-serif">
                      Guided 21-Button Saloon Tour
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
                      Experience a guided tour where your 3D avatar guides you through every menu, table control, and game mode.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    sounds.playClick();
                    onClose();
                    if (onLaunchWalkthrough) onLaunchWalkthrough();
                  }}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm shadow-[0_10px_30px_rgba(16,185,129,0.4)] transition flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
                >
                  <Play className="w-5 h-5 fill-slate-950" />
                  <span>START WALKTHROUGH NOW</span>
                </button>
              </div>

              {/* Feature Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="text-2xl">🎯</div>
                  <h4 className="text-sm font-black text-white">Every Modal Explored</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Walk through all 21 buttons with real live modals rendered step-by-step.
                  </p>
                </div>
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="text-2xl">⌨️</div>
                  <h4 className="text-sm font-black text-white">Arrow Key Navigation</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Use <strong className="text-amber-300">← Left</strong> and <strong className="text-amber-300">Right →</strong> arrow keys on your keyboard to navigate back and forth.
                  </p>
                </div>
                <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2">
                  <div className="text-2xl">🤠</div>
                  <h4 className="text-sm font-black text-white">Stable Character Position</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your avatar and speech bubble stay conveniently in one fixed spot without jumping.
                  </p>
                </div>
              </div>

            </div>

            {/* Bottom Launch Button */}
            <div className="pt-4 border-t border-slate-800 flex items-center justify-between max-w-4xl mx-auto w-full">
              <span className="text-xs text-slate-400">
                21 Steps • Keyboard-supported live interactive tour
              </span>
              <button
                onClick={() => {
                  sounds.playClick();
                  onClose();
                  if (onLaunchWalkthrough) onLaunchWalkthrough();
                }}
                className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow transition flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Launch Interactive Tour</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
