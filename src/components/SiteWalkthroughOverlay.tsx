import React, { useState, useEffect } from 'react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Sparkles,
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
  Flame,
  Volume2,
  Send,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { CharacterPose, ThreeCharacterCanvas } from './ThreeCharacterCanvas';

// Modals imported to render LIVE during each step of the walkthrough
import { SinglePlayerModal } from './SinglePlayerModal';
import { MultiplayerModal } from './MultiplayerModal';
import { CampaignWorldMapModal } from './CampaignWorldMapModal';
import { ThemesModal } from './ThemesModal';
import { RoyalLeaderboardModal } from './RoyalLeaderboardModal';
import { PropertiesModal } from './PropertiesModal';
import { ShopModal } from './ShopModal';
import { FAQModal } from './FAQModal';
import { SettingsModal } from './SettingsModal';
import { PlayerProfileModal } from './PlayerProfileModal';
import { DailyDiceModal } from './DailyDiceModal';
import { DailyCalendarModal } from './DailyCalendarModal';
import { MailboxModal } from './MailboxModal';
import { YouTubeLiveModal } from './YouTubeLiveModal';
import { MusicModal } from './MusicModal';
import { HamburgerMenuModal } from './HamburgerMenuModal';
import { TwitchLiveChat } from './TwitchLiveChat';
import { SlotsModal } from './SlotsModal';
import { PalaceAssistantModal } from './PalaceAssistantModal';

interface SiteWalkthroughOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onSelectModal?: (modalKey: string) => void;
}

interface WalkthroughStep {
  step: number;
  idKey: string;
  title: string;
  modalName: string;
  speechText: string;
  icon: any;
  characterPose: CharacterPose;
  characterLayout: 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';
  arrowPosition: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    direction: 'down' | 'up' | 'left' | 'right';
  };
}

const ALL_SITE_WALKTHROUGH_STEPS: WalkthroughStep[] = [
  {
    step: 1,
    idKey: 'single_player',
    title: 'Single Player Match',
    modalName: 'Single Player Arena Modal',
    speechText:
      'Howdy! Here is the live Single Player Arena! Pick from 5 difficulty tiers (Beginner to World Class), choose your saloon rival bot, and jump into an instant 4-player AI showdown!',
    icon: Gamepad2,
    characterPose: 'pointing_right',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '35%', left: '42%', direction: 'right' },
  },
  {
    step: 2,
    idKey: 'multiplayer',
    title: 'Multiplayer Lobby',
    modalName: 'Multiplayer Matchmaking & Tournaments',
    speechText:
      'Welcome to the live Multiplayer Pavilion! Browse active Texas card rooms, create private tables with customized rules, or register for official cash tournaments!',
    icon: Users,
    characterPose: 'pointing_right',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '28%', left: '35%', direction: 'down' },
  },
  {
    step: 3,
    idKey: 'campaign',
    title: 'Map',
    modalName: '3D Frontier Map & Fog of War',
    speechText:
      'Check out the real 3D Map with Fog of War! Spin the 3D globe, reveal shrouded frontier territories through the fog of war, and travel across 10 historic Texas cities from El Paso to Austin.',
    icon: MapPin,
    characterPose: 'pointing_up',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '32%', left: '48%', direction: 'down' },
  },
  {
    step: 4,
    idKey: 'rules',
    title: 'Rules Documentation Guide',
    modalName: 'Official Single-Page Rules Document',
    speechText:
      'Here is the complete official rules guide! Learn how the Right Bower and Left Bower dominate trump, master Stick the Dealer, and maximize points with Loner calls.',
    icon: BookOpen,
    characterPose: 'pointing_right',
    characterLayout: 'top-left',
    arrowPosition: { top: '30%', left: '30%', direction: 'right' },
  },
  {
    step: 5,
    idKey: 'themes',
    title: '3D Hats & Themes Studio',
    modalName: 'Customization & Themes Modal',
    speechText:
      'Look at all these custom styles! Equip 3D cowboy hats, switch between hand-painted saloon felts, and unlock custom wood-grain card decks to show off at the table.',
    icon: Sparkles,
    characterPose: 'pointing_right',
    characterLayout: 'top-left',
    arrowPosition: { top: '36%', left: '45%', direction: 'down' },
  },
  {
    step: 6,
    idKey: 'leaderboard',
    title: '10-Tier Leaderboard',
    modalName: 'Royal Leaderboard & Tiers Modal',
    speechText:
      'The competitive rankings are live! Climb the 10 tiers from Dealer rank all the way to Grand Euchre, track your ELO rating, and inspect top player medallions.',
    icon: Crown,
    characterPose: 'hands_on_hips',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '30%', left: '35%', direction: 'down' },
  },
  {
    step: 7,
    idKey: 'properties',
    title: 'Saloon Real Estate & Tycoon',
    modalName: 'Properties & Economy Modal',
    speechText:
      'Become a frontier tycoon! Purchase saloons, silver mines, and ranches across Texas to generate passive daily chip rent payouts.',
    icon: Building2,
    characterPose: 'pointing_right',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '40%', left: '40%', direction: 'right' },
  },
  {
    step: 8,
    idKey: 'shop',
    title: 'Coin & Sovereign Shop',
    modalName: 'Sovereign Token & Chip Shop',
    speechText:
      'Stock up on stakes in the live Shop! Exchange fiat or winnings for sovereign gold coins, boost chip vaults, and unlock VIP saloon privileges.',
    icon: Coins,
    characterPose: 'pointing_right',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '38%', left: '35%', direction: 'down' },
  },
  {
    step: 9,
    idKey: 'faq',
    title: 'FAQ & Strategy Guide',
    modalName: 'Interactive FAQ Modal',
    speechText:
      'Got questions? Click into any accordion item to read advanced bidding tactics, card counting strategies, and partner signaling advice.',
    icon: HelpCircle,
    characterPose: 'thinking',
    characterLayout: 'top-right',
    arrowPosition: { top: '34%', left: '45%', direction: 'down' },
  },
  {
    step: 10,
    idKey: 'settings',
    title: 'Settings & Audio Options',
    modalName: 'System & Volume Settings Modal',
    speechText:
      'Fine-tune your gaming setup! Adjust acoustic saloon ambient guitar volume, toggle card riffle sound effects, and switch graphics settings.',
    icon: Sliders,
    characterPose: 'thinking',
    characterLayout: 'top-right',
    arrowPosition: { top: '32%', left: '30%', direction: 'down' },
  },
  {
    step: 11,
    idKey: 'profile',
    title: 'Player Profile & 3D Dossier',
    modalName: '3D Character Studio & Dossier Modal',
    speechText:
      'This is your personal 3D character dossier! Rotate your avatar, customize hairstyles, inspect lifetime win-loss records, and edit your saloon bio.',
    icon: User,
    characterPose: 'waving',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '35%', left: '40%', direction: 'right' },
  },
  {
    step: 12,
    idKey: 'daily_dice',
    title: 'Daily Dice Fortune',
    modalName: 'Lucky Dice Roller Modal',
    speechText:
      'Roll the 5 golden dice every 24 hours! Lock your best numbers, re-roll, and claim massive free chip multipliers and sovereign tokens.',
    icon: Dices,
    characterPose: 'cheering',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '40%', left: '35%', direction: 'down' },
  },
  {
    step: 13,
    idKey: 'calendar',
    title: 'Daily Calendar Rewards',
    modalName: '30-Day Streak Calendar Modal',
    speechText:
      'Check out the 30-Day Calendar! Log in daily to open escalating reward chests, unlock special avatar cosmetics, and build your login streak.',
    icon: Calendar,
    characterPose: 'cheering',
    characterLayout: 'bottom-left',
    arrowPosition: { top: '35%', left: '45%', direction: 'down' },
  },
  {
    step: 14,
    idKey: 'mailbox',
    title: 'Mailbox & Direct Messages',
    modalName: 'Saloon Mailbox & Inbox Modal',
    speechText:
      'Stay connected! The mailbox receives daily gift chips from partners, clan tournament invites, and system jackpot notifications.',
    icon: Mail,
    characterPose: 'pointing_right',
    characterLayout: 'top-left',
    arrowPosition: { top: '32%', left: '30%', direction: 'down' },
  },
  {
    step: 15,
    idKey: 'live_video',
    title: 'YouTube Live & Streams',
    modalName: 'Live Tournament Broadcast Modal',
    speechText:
      'Watch high-stakes Euchre championships streamed live! Enjoy real-time community chat, commentary, and spectator thrills right inside the saloon.',
    icon: Tv,
    characterPose: 'waving',
    characterLayout: 'top-left',
    arrowPosition: { top: '38%', left: '45%', direction: 'down' },
  },
  {
    step: 16,
    idKey: 'music',
    title: 'Saloon Music Jukebox',
    modalName: 'Acoustic Western Music Player Modal',
    speechText:
      'Spin authentic saloon tunes! Select country tracks, adjust saloon acoustic volume, or loop your favorite fiddle melody while you play.',
    icon: Music,
    characterPose: 'hands_on_hips',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '36%', left: '35%', direction: 'down' },
  },
  {
    step: 17,
    idKey: 'scoreboard',
    title: 'Top-Left Live Scoreboard Display',
    modalName: 'Card Table Match HUD & Scoreboard',
    speechText:
      'During card play, look at the top-left HUD! It tracks Team 1 vs Team 2 tricks, current trump suit, and your climb toward the 10-point victory mark.',
    icon: BarChart3,
    characterPose: 'pointing_up',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '18%', left: '20%', direction: 'up' },
  },
  {
    step: 18,
    idKey: 'hamburger',
    title: 'Top-Right Hamburger Menu Dropdown',
    modalName: 'In-Game Dropdown Navigation Menu',
    speechText:
      'The hamburger button in the top-right opens this clean dropdown directly underneath! Quickly access sound controls, music, and lobby navigation.',
    icon: Menu,
    characterPose: 'pointing_up',
    characterLayout: 'bottom-right',
    arrowPosition: { top: '18%', right: '15%', direction: 'up' },
  },
  {
    step: 19,
    idKey: 'chat',
    title: 'Bottom-Left Live Chat & Logs (TAB)',
    modalName: 'Twitch-Style Chat & Play-by-Play Logs',
    speechText:
      'Down in the bottom-left, toggle between live saloon banter and real-time trick play logs. You can press TAB on your keyboard anytime to open or hide it!',
    icon: MessageSquare,
    characterPose: 'pointing_left',
    characterLayout: 'top-right',
    arrowPosition: { bottom: '28%', left: '25%', direction: 'left' },
  },
  {
    step: 20,
    idKey: 'emotes',
    title: 'Bottom-Right 32 Emote Actions',
    modalName: '32 Expressive Animated Sound Emotes',
    speechText:
      'Express yourself with 32 authentic character gestures! The first 10 are completely free, with 22 unlockable chip sound emotes for cheers, laughs, and toasts.',
    icon: Smile,
    characterPose: 'cheering',
    characterLayout: 'bottom-left',
    arrowPosition: { bottom: '26%', right: '25%', direction: 'right' },
  },
  {
    step: 21,
    idKey: 'slots',
    title: 'Bottom-Center Slots & Palace AI Assistant',
    modalName: 'Mini Slot Machine & AI Euchre Coach',
    speechText:
      'Right at the bottom center, spin the 3-reel frontier slot machine for instant jackpot multipliers, or open the Palace AI Assistant for instant strategy coaching!',
    icon: Zap,
    characterPose: 'cheering',
    characterLayout: 'bottom-left',
    arrowPosition: { bottom: '22%', left: '50%', direction: 'down' },
  },
];

export const SiteWalkthroughOverlay: React.FC<SiteWalkthroughOverlayProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onSelectModal,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showFinaleMatrix, setShowFinaleMatrix] = useState(false);
  const [activeShowcaseItem, setActiveShowcaseItem] = useState<number | null>(null);
  const [openedModalStep, setOpenedModalStep] = useState<WalkthroughStep | null>(null);

  const currentStep = ALL_SITE_WALKTHROUGH_STEPS[currentStepIndex] || ALL_SITE_WALKTHROUGH_STEPS[0];
  const isLastStep = currentStepIndex === ALL_SITE_WALKTHROUGH_STEPS.length - 1;

  const handleNext = () => {
    sounds.playCardDeal();
    if (isLastStep) {
      setShowFinaleMatrix(true);
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    sounds.playCardDeal();
    if (openedModalStep) {
      setOpenedModalStep(null);
    } else if (showFinaleMatrix) {
      setShowFinaleMatrix(false);
    } else {
      setCurrentStepIndex((prev) => Math.max(0, prev - 1));
    }
  };

  // Keyboard Navigation: ArrowLeft to go back, ArrowRight to go forward, Escape to exit
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        sounds.playClick();
        if (openedModalStep) {
          setOpenedModalStep(null);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, isLastStep, showFinaleMatrix, openedModalStep]);

  if (!isOpen) return null;

  const jumpToStep = (index: number) => {
    sounds.playClick();
    setCurrentStepIndex(index);
    setShowFinaleMatrix(false);
    setOpenedModalStep(null);
  };

  const handleSelectModalAction = (step: WalkthroughStep) => {
    sounds.playClick();
    setOpenedModalStep(step);
    if (onSelectModal) {
      onSelectModal(step.idKey);
    }
  };

  // Render the real live modal component for the active step
  const renderActiveStepModal = (stepNum?: number) => {
    const num = stepNum !== undefined ? stepNum : currentStep.step;
    const closeModal = () => setOpenedModalStep(null);
    switch (num) {
      case 1:
        return (
          <SinglePlayerModal
            isOpen={true}
            onClose={closeModal}
            onStartMatch={() => {
              sounds.playWin();
            }}
            playerProfile={playerProfile}
          />
        );
      case 2:
        return <MultiplayerModal isOpen={true} onClose={closeModal} playerProfile={playerProfile} />;
      case 3:
        return (
          <CampaignWorldMapModal
            isOpen={true}
            onClose={closeModal}
            playerProfile={playerProfile}
            currentTownId="el_paso"
            onTravelToTown={() => {}}
          />
        );
      case 4:
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/90 p-4 sm:p-8">
            <div className="w-full max-w-4xl h-[85vh] bg-[#1c1917] border-2 border-amber-600/70 rounded-3xl p-6 overflow-y-auto text-stone-100 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-amber-600/40 mb-4">
                <div className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  <h3 className="text-xl font-black font-serif text-amber-300">
                    Official Texas Euchre Rules & Documentation
                  </h3>
                </div>
                <button
                  onClick={closeModal}
                  className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
              <div className="space-y-4 text-sm text-stone-300 leading-relaxed font-sans">
                <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800">
                  <h4 className="font-bold text-amber-400 mb-1">🃏 Deck & Bowers Hierarchy</h4>
                  <p>
                    Played with 24 cards (9, 10, J, Q, K, A). The Jack of the trump suit is the{' '}
                    <strong className="text-amber-300">Right Bower</strong> (highest card). The
                    Jack of the same color is the{' '}
                    <strong className="text-amber-300">Left Bower</strong> (second highest).
                  </p>
                </div>
                <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800">
                  <h4 className="font-bold text-amber-400 mb-1">🎯 Bidding & Stick the Dealer</h4>
                  <p>
                    Players bid in clockwise rotation to order up or name trump. If everyone passes
                    in round 2, the dealer is forced to name trump under Texas saloon rules!
                  </p>
                </div>
                <div className="p-4 bg-stone-900/80 rounded-2xl border border-stone-800">
                  <h4 className="font-bold text-amber-400 mb-1">🏆 Scoring & Going Alone</h4>
                  <p>
                    Win 3-4 tricks for 1 pt; sweep 5 tricks for 2 pts. Call "Go Alone" and sweep all
                    5 tricks without partner help for 4 sovereign points! First team to 10 wins the match.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case 5:
        return (
          <ThemesModal
            isOpen={true}
            onClose={closeModal}
            coinsBalance={playerProfile.chips || 5000}
            activeMainMenuThemeId="main_menu_1"
            activeInGameThemeId="in_game_1"
            activeProfileThemeId="profile_1"
          />
        );
      case 6:
        return (
          <RoyalLeaderboardModal
            isOpen={true}
            onClose={closeModal}
            playerElo={playerProfile.elo || 1200}
            playerName={playerProfile.name}
          />
        );
      case 7:
        return <PropertiesModal isOpen={true} onClose={closeModal} playerProfile={playerProfile} />;
      case 8:
        return <ShopModal isOpen={true} onClose={closeModal} playerProfile={playerProfile} />;
      case 9:
        return <FAQModal isOpen={true} onClose={closeModal} playerProfile={playerProfile} />;
      case 10:
        return <SettingsModal isOpen={true} onClose={closeModal} />;
      case 11:
        return (
          <PlayerProfileModal
            isOpen={true}
            onClose={closeModal}
            playerProfile={playerProfile}
            onOpenEditProfile={() => {}}
            onOpenSettings={() => {}}
            onOpenDMs={() => {}}
            onUpdatePlayerProfile={() => {}}
          />
        );
      case 12:
        return (
          <DailyDiceModal
            isOpen={true}
            onClose={closeModal}
            playerProfile={playerProfile}
            onClaimReward={() => {}}
          />
        );
      case 13:
        return (
          <DailyCalendarModal
            isOpen={true}
            onClose={closeModal}
            playerProfile={playerProfile}
            onClaimReward={() => {}}
          />
        );
      case 14:
        return <MailboxModal isOpen={true} onClose={closeModal} onOpenDMs={() => {}} />;
      case 15:
        return <YouTubeLiveModal isOpen={true} onClose={closeModal} />;
      case 16:
        return <MusicModal isOpen={true} onClose={closeModal} />;
      case 17:
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#072412]/95 p-4 sm:p-8">
            <div className="w-full max-w-4xl h-[80vh] bg-[#0c381e] border-4 border-amber-600 rounded-3xl p-6 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              {/* Top Scoreboard HUD */}
              <div className="w-full bg-stone-950/90 border-2 border-amber-500 rounded-2xl p-4 flex items-center justify-between shadow-xl">
                <div className="flex items-center gap-4">
                  <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold text-sm">
                    Team 1 (You & Partner): <span className="text-white font-black text-lg">7 pts</span> (3 Tricks)
                  </div>
                  <div className="text-stone-400 font-black">VS</div>
                  <div className="px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/50 text-rose-300 font-bold text-sm">
                    Team 2 (Rivals): <span className="text-white font-black text-lg">4 pts</span> (1 Trick)
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1 rounded-xl bg-amber-500 text-stone-950 font-black text-xs flex items-center gap-1.5">
                    <span>Trump: ♠ Spades</span>
                  </div>
                  <div className="text-xs font-mono text-stone-300">Target: 10 Pts</div>
                </div>
              </div>

              {/* Card Table Visual Felt Preview */}
              <div className="flex-1 my-4 flex items-center justify-center relative">
                <div className="w-48 h-32 rounded-full border-2 border-dashed border-amber-500/30 flex items-center justify-center text-amber-300/60 font-serif font-bold text-sm">
                  Saloon Felt Arena
                </div>
              </div>
            </div>
          </div>
        );
      case 18:
        return (
          <HamburgerMenuModal
            isOpen={true}
            onClose={closeModal}
            playerProfile={playerProfile}
            onNavigateMap={() => {}}
            onOpenStats={() => {}}
            onOpenProperties={() => {}}
            onOpenShop={() => {}}
            onOpenCalendar={() => {}}
            onOpenRules={() => {}}
            onOpenMusic={() => {}}
            onOpenThemes={() => {}}
            onOpenSettings={() => {}}
            onOpenWatchAds={() => {}}
            onWatchAdReward={() => {}}
            onResetProgress={() => {}}
            cameraAngle="overhead"
            onSetCameraAngle={() => {}}
            paintedTheme="standard"
            onSetPaintedTheme={() => {}}
          />
        );
      case 19:
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/90 p-4">
            <div className="w-full max-w-lg h-[500px] bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-4 shadow-2xl flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-stone-100 text-sm">Live Saloon Chat & Play Logs</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono">
                  Press TAB to Toggle
                </span>
              </div>
              <div className="flex-1 my-3 overflow-y-auto space-y-2 text-xs">
                <div className="p-2 rounded-xl bg-stone-950 text-stone-300">
                  <span className="font-bold text-amber-400">Lonestar Slim:</span> What a bold Jack of Spades lead!
                </div>
                <div className="p-2 rounded-xl bg-stone-950 text-stone-300">
                  <span className="font-bold text-rose-400">Dealer Ace:</span> Nice trump order partner 🔥
                </div>
                <div className="p-2 rounded-xl bg-stone-950/80 text-amber-300 font-mono text-[11px]">
                  [LOG] You played Jack of Clubs (Left Bower) and won Trick 4!
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                <input
                  type="text"
                  placeholder="Type saloon message..."
                  className="flex-1 bg-stone-950 border border-stone-700 rounded-xl px-3 py-2 text-xs text-white"
                  readOnly
                  value="Great game, partner!"
                />
                <button className="p-2 rounded-xl bg-amber-500 text-stone-950 font-bold">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      case 20:
        return (
          <div className="fixed inset-0 z-40 flex items-center justify-center bg-stone-950/90 p-4">
            <div className="w-full max-w-2xl bg-stone-900 border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-4">
                <div className="flex items-center gap-2">
                  <Smile className="w-6 h-6 text-amber-400" />
                  <h3 className="font-black text-amber-300 text-base font-serif">
                    32 Expressive Saloon Character Actions
                  </h3>
                </div>
                <span className="text-xs bg-amber-500/20 text-amber-300 px-2.5 py-1 rounded-full font-bold">
                  10 Free + 22 Unlockables
                </span>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
                {[
                  { name: 'Toss Coins', icon: '💰', cost: 'FREE' },
                  { name: 'Victory Cheer', icon: '🎉', cost: 'FREE' },
                  { name: 'Saloon Laugh', icon: '😆', cost: 'FREE' },
                  { name: 'Poker Face', icon: '😐', cost: 'FREE' },
                  { name: 'Good Luck', icon: '🍀', cost: 'FREE' },
                  { name: 'Well Played', icon: '🤝', cost: 'FREE' },
                  { name: 'Fist Pump', icon: '✊', cost: 'FREE' },
                  { name: 'Sip Whiskey', icon: '🥃', cost: 'FREE' },
                  { name: 'Finger Guns', icon: '👉', cost: '50 🪙' },
                  { name: 'Slow Clap', icon: '👏', cost: '100 🪙' },
                  { name: 'Facepalm', icon: '🤦', cost: '150 🪙' },
                  { name: 'Table Slam', icon: '💥', cost: '250 🪙' },
                  { name: 'Blow Smoke', icon: '🚬', cost: '400 🪙' },
                  { name: 'Quickdraw', icon: '🔫', cost: '600 🪙' },
                  { name: 'Flash Royals', icon: '👑', cost: '850 🪙' },
                  { name: 'Frontier Twang', icon: '🎸', cost: '4,000 🪙' },
                  { name: 'Dynamite Spark', icon: '💣', cost: '5,500 🪙' },
                  { name: 'High Noon', icon: '⏰', cost: '40,000 🪙' },
                ].map((act, i) => (
                  <button
                    key={i}
                    onClick={() => sounds.playWin()}
                    className="p-2 rounded-xl bg-stone-950 hover:bg-amber-950/60 border border-stone-800 hover:border-amber-500/60 flex flex-col items-center gap-1 transition cursor-pointer"
                  >
                    <span className="text-xl">{act.icon}</span>
                    <span className="text-[10px] font-bold text-white leading-tight truncate w-full text-center">
                      {act.name}
                    </span>
                    <span className="text-[9px] font-mono text-amber-400/90">{act.cost}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );
      case 21:
        return <PalaceAssistantModal isOpen={true} onClose={closeModal} playerProfile={playerProfile} />;
      default:
        return null;
    }
  };

  // Character layout positioning: Keep stable in one place across all steps so cursor doesn't have to jump
  const getCharacterContainerClasses = () => {
    return 'bottom-4 left-4 md:left-8 flex-col md:flex-row items-center md:items-end';
  };

  return (
    <div className="fixed inset-0 z-50 pointer-events-auto select-none overflow-hidden animate-in fade-in duration-200">
      {/* If a modal was opened from the finale matrix, display it directly with a control bar */}
      {openedModalStep ? (
        <div className="absolute inset-0 z-50 pointer-events-auto">
          {/* Top Bar for Opened Modal */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-stone-950/95 border-2 border-amber-500/80 px-4 py-2.5 rounded-2xl shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-black">
              <span className="text-amber-400 uppercase tracking-wider">Live Feature:</span>
              <span className="text-white">{openedModalStep.title}</span>
            </div>
            <div className="h-4 w-px bg-slate-700" />
            <button
              onClick={() => {
                sounds.playClick();
                setOpenedModalStep(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to 21 Features</span>
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-stone-300 hover:text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              <span>Exit Walkthrough</span>
            </button>
          </div>

          {/* Real Modal Component Rendered Live */}
          <div className="w-full h-full">
            {renderActiveStepModal(openedModalStep.step)}
          </div>
        </div>
      ) : showFinaleMatrix ? (
        <div className="absolute inset-0 bg-[#060a14] p-4 sm:p-6 md:p-8 flex flex-col justify-between overflow-hidden z-50 animate-in zoom-in-95 duration-200 text-slate-100">
          {/* Top Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-2xl shadow-lg">
                🎉
              </div>
              <div>
                <h3 className="text-lg sm:text-2xl font-black text-amber-300 font-serif">
                  All 21 Saloon Modals & Features Interactive Matrix
                </h3>
                <p className="text-xs text-slate-300">
                  Every feature has an open section! Click any card to open and explore that live modal.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Exit Walkthrough</span>
            </button>
          </div>

          {/* 21 Buttons Full-Screen Interactive Grid */}
          <div className="flex-1 my-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_SITE_WALKTHROUGH_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeShowcaseItem === step.step;
                return (
                  <div
                    key={step.step}
                    onClick={() => handleSelectModalAction(step)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex flex-col justify-between gap-2.5 group ${
                      isSelected
                        ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/50 shadow-xl'
                        : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-amber-400/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-slate-950 transition shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="text-xs font-black text-white leading-tight group-hover:text-amber-300 transition">
                            {step.step}. {step.title}
                          </div>
                          <span className="text-[10px] font-mono text-amber-400/90">
                            {step.modalName}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                      {step.speechText}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          jumpToStep(idx);
                        }}
                        className="text-[10px] text-slate-400 hover:text-amber-300 font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Review Step</span>
                      </button>

                      <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 group-hover:bg-amber-500 text-amber-300 group-hover:text-slate-950 text-[10px] font-black transition border border-amber-500/40">
                        Open Modal →
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Showcase Bottom Controls */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={() => {
                sounds.playClick();
                setShowFinaleMatrix(false);
                setCurrentStepIndex(ALL_SITE_WALKTHROUGH_STEPS.length - 1);
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Step 21</span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <X className="w-4 h-4 stroke-[3]" />
              <span>Exit Walkthrough</span>
            </button>
          </div>
        </div>
      ) : (
        /* LIVE MODAL STEP-BY-STEP MODE: The actual modal is actively open and visible */
        <>
          {/* THE REAL MODAL COMPONENT OPEN LIVE */}
          <div className="absolute inset-0 z-30 pointer-events-auto">
            {renderActiveStepModal()}
          </div>

          {/* Animated 3D Pointing Arrow */}
          <div
            style={{
              top: currentStep.arrowPosition.top,
              bottom: currentStep.arrowPosition.bottom,
              left: currentStep.arrowPosition.left,
              right: currentStep.arrowPosition.right,
              transform: 'translate(-50%, -50%)',
            }}
            className="absolute z-50 pointer-events-none transition-all duration-500 ease-out"
          >
            <div className="flex flex-col items-center animate-bounce">
              {currentStep.arrowPosition.direction === 'down' && (
                <div className="flex flex-col items-center">
                  <div className="w-9 h-12 bg-gradient-to-b from-amber-400 to-orange-500 rounded-t-lg border-2 border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
                  <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-t-[34px] border-t-orange-500 filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]" />
                </div>
              )}
              {currentStep.arrowPosition.direction === 'up' && (
                <div className="flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[26px] border-l-transparent border-r-[26px] border-r-transparent border-b-[34px] border-b-amber-400 filter drop-shadow-[0_-4px_10px_rgba(245,158,11,0.8)]" />
                  <div className="w-9 h-12 bg-gradient-to-b from-amber-400 to-orange-500 rounded-b-lg border-2 border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
                </div>
              )}
              {currentStep.arrowPosition.direction === 'left' && (
                <div className="flex items-center">
                  <div className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-r-[34px] border-r-amber-400 filter drop-shadow-[-4px_0_10px_rgba(245,158,11,0.8)]" />
                  <div className="w-12 h-9 bg-gradient-to-r from-amber-400 to-orange-500 rounded-r-lg border-2 border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
                </div>
              )}
              {currentStep.arrowPosition.direction === 'right' && (
                <div className="flex items-center">
                  <div className="w-12 h-9 bg-gradient-to-r from-orange-500 to-amber-400 rounded-l-lg border-2 border-yellow-200 shadow-[0_0_20px_rgba(245,158,11,0.9)]" />
                  <div className="w-0 h-0 border-t-[26px] border-t-transparent border-b-[26px] border-b-transparent border-l-[34px] border-l-amber-400 filter drop-shadow-[4px_0_10px_rgba(245,158,11,0.8)]" />
                </div>
              )}
            </div>
          </div>

          {/* Character and Speech Bubble Container */}
          <div
            className={`absolute z-50 pointer-events-auto flex gap-4 transition-all duration-500 ease-out ${getCharacterContainerClasses()}`}
          >
            {/* Free-Standing 3D Character with dynamic pose */}
            <div className="relative w-44 h-60 sm:w-52 sm:h-68 md:w-60 md:h-76 shrink-0 flex items-end justify-center pointer-events-none transition-all duration-500">
              {/* Soft Ground Contact Shadow */}
              <div className="absolute bottom-2 w-36 h-7 bg-black/80 rounded-full blur-md" />

              {/* Articulated Canvas 3D Character with dynamic pose */}
              <div className="relative w-full h-full">
                <ThreeCharacterCanvas
                  eyeStyle={playerProfile.eyeStyle || 'Classic Dot'}
                  noseStyle={playerProfile.noseStyle || 'Pointed Nose'}
                  mouthStyle={playerProfile.mouthStyle || 'Smile'}
                  hairStyle={playerProfile.hairStyle || 'Cowboy Hat + Pigtails'}
                  colors={{
                    hair: playerProfile.hairColor || '#3b2314',
                    shirt: playerProfile.shirtColor || '#ec4899',
                    pants: '#1e293b',
                    shoes: '#000000',
                    eyes: '#1e293b',
                    skin: playerProfile.skinColor || '#fcd34d',
                  }}
                  autoRotate={false}
                  zoom={3.3}
                  rotationAngle={currentStep.characterLayout === 'bottom-right' ? -15 : 15}
                  pose={currentStep.characterPose}
                />
              </div>
            </div>

            {/* Authentic Comic Speech Bubble */}
            <div className="relative max-w-xl w-full bg-[#fdfbf7] text-stone-900 border-3 border-stone-800 rounded-3xl p-5 sm:p-6 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-sm">
              {/* Speech Bubble Header */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-base sm:text-lg font-black font-serif text-amber-900">
                    {playerProfile.username || 'Saloon Cowgirl'}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full border border-amber-400">
                    LIVE GUIDE
                  </span>
                </div>

                <div className="text-[11px] font-mono font-bold text-stone-500">
                  {currentStepIndex + 1} / {ALL_SITE_WALKTHROUGH_STEPS.length}
                </div>
              </div>

              {/* Dialogue Text */}
              <p className="text-sm sm:text-base font-bold text-stone-800 leading-relaxed font-sans mb-4">
                {currentStep.speechText}
              </p>

              {/* Stepper Navigation Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                <button
                  onClick={handlePrev}
                  disabled={currentStepIndex === 0}
                  className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-xs transition disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>

                {/* Scannable Step Indicator Pills */}
                <div className="hidden sm:flex items-center gap-1 overflow-x-auto max-w-[200px]">
                  {ALL_SITE_WALKTHROUGH_STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => jumpToStep(i)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        i === currentStepIndex
                          ? 'w-5 bg-amber-600'
                          : 'w-1.5 bg-stone-300 hover:bg-stone-400'
                      }`}
                      title={`Step ${i + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>{isLastStep ? 'Show All Matrix' : 'Next Step'}</span>
                  {isLastStep ? <Check className="w-4 h-4 stroke-[3]" /> : <ArrowRight className="w-4 h-4 stroke-[3]" />}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
