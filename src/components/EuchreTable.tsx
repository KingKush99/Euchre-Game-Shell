import React, { useState, useEffect } from 'react';
import { Card, Suit, PlayerProfile, TownLocation } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { SaloonWalkInCutscene } from './SaloonWalkInCutscene';
import { ThreePokerTable3D } from './ThreePokerTable3D';
import { AnimatedEmotePerformer, ActiveEmoteDisplay } from './AnimatedEmotePerformer';
import { CustomAssetsModal } from './CustomAssetsModal';
import { EuchreFiveScorekeeper } from './EuchreFiveScorekeeper';
import { BicycleCard } from './BicycleCard';
import { EuchreBiddingModal } from './EuchreBiddingModal';
import {
  Menu,
  Settings,
  Music,
  Home,
  Award,
  MessageSquare,
  Smile,
  X,
  Send,
  Sparkles,
  Crown,
  Flame,
  Shield,
  ThumbsUp,
  Heart,
  HelpCircle,
  Minimize2,
  Maximize2,
  Lock,
  Coins,
  History,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface EuchreTableProps {
  playerProfile: PlayerProfile;
  currentTown: TownLocation;
  onExitTable: () => void;
  onReturnToMainMenu: () => void;
  onOpenSettings: () => void;
  onOpenMusic: () => void;
  onOpenAchievements: () => void;
  onUpdateProfile?: (updated: PlayerProfile) => void;
  cameraAngle?: 'table' | 'overhead' | 'cinematic' | 'first_person';
  inGameTheme?: string;
}

interface EuchrePlayer {
  id: string;
  name: string;
  avatar: string;
  team: 1 | 2; // Team 1: You (P0) & Partner Pete (P2). Team 2: West (P1) & East (P3)
  hand: Card[];
  isAI: boolean;
  tricksWon: number;
}

interface PlayedCard {
  playerId: string;
  card: Card;
}

export interface SaloonActionEmote {
  id: string;
  label: string;
  actionDesc: string;
  icon: string;
  cost: number; // 0 for first 10
  soundType: 'win' | 'coin' | 'chip' | 'click' | 'riffle';
}

// 32 REAL ACTIONS - First 10 FREE, next 22 progressively priced in chips
export const SALOON_32_EMOTES: SaloonActionEmote[] = [
  // 10 FREE ACTIONS
  { id: 'tip_hat', label: 'Tip Hat', actionDesc: 'tipped their Stetson hat to Partner Pete and the table', icon: '🤠', cost: 0, soundType: 'click' },
  { id: 'applause', label: 'Applause', actionDesc: 'clapped both hands in cordial frontier applause', icon: '👏', cost: 0, soundType: 'win' },
  { id: 'toss_coins', label: 'Toss Coins', actionDesc: 'tossed a handful of gleaming gold sovereigns onto the felt', icon: '💰', cost: 0, soundType: 'coin' },
  { id: 'victory_cheer', label: 'Victory Cheer', actionDesc: 'raised their arms and let out a triumphant saloon cheer', icon: '🎉', cost: 0, soundType: 'win' },
  { id: 'saloon_laugh', label: 'Saloon Laugh', actionDesc: 'burst into hearty, good-natured frontier laughter', icon: '😆', cost: 0, soundType: 'click' },
  { id: 'poker_face', label: 'Poker Face', actionDesc: 'fixed an unreadable, ice-cold sovereign poker face', icon: '😐', cost: 0, soundType: 'click' },
  { id: 'good_luck', label: 'Good Luck', actionDesc: 'flashed a four-leaf clover to wish everyone good fortune', icon: '🍀', cost: 0, soundType: 'win' },
  { id: 'well_played', label: 'Well Played', actionDesc: 'firmly shook their partner’s hand: "Well played, partner!"', icon: '🤝', cost: 0, soundType: 'win' },
  { id: 'fist_pump', label: 'Fist Pump', actionDesc: 'pumped their fist with sovereign determination', icon: '✊', cost: 0, soundType: 'win' },
  { id: 'sip_whiskey', label: 'Sip Whiskey', actionDesc: 'took a measured sip of aged amber saloon bourbon', icon: '🥃', cost: 0, soundType: 'chip' },

  // 22 PROGRESSIVELY PRICED ACTIONS (Cost increases steadily)
  { id: 'finger_guns', label: 'Finger Guns', actionDesc: 'drew double finger guns and aimed across the felt: *pew pew*', icon: '👉', cost: 50, soundType: 'click' },
  { id: 'slow_clap', label: 'Slow Clap', actionDesc: 'offered a slow, sarcastic, deliberate frontier cadence clap', icon: '👏', cost: 100, soundType: 'click' },
  { id: 'facepalm', label: 'Facepalm', actionDesc: 'shook their head and slapped their forehead in disbelief', icon: '🤦', cost: 150, soundType: 'click' },
  { id: 'table_slam', label: 'Table Slam', actionDesc: 'slammed both palms firmly on the felt table with authority!', icon: '💥', cost: 250, soundType: 'chip' },
  { id: 'blow_smoke', label: 'Blow Smoke', actionDesc: 'blew three smooth smoke rings drifting up to the chandelier', icon: '🚬', cost: 400, soundType: 'click' },
  { id: 'quickdraw', label: 'Quickdraw', actionDesc: 'spun their sidearm holster with lightning frontier speed', icon: '🔫', cost: 600, soundType: 'click' },
  { id: 'flash_royals', label: 'Flash Royals', actionDesc: 'shimmered a fan of gold royal court cards across the table', icon: '👑', cost: 850, soundType: 'win' },
  { id: 'whistle_wink', label: 'Whistle & Wink', actionDesc: 'whistled a high frontier tune and flashed a confident wink', icon: '😉', cost: 1200, soundType: 'win' },
  { id: 'table_flip', label: 'Flip Table', actionDesc: 'playfully rattled the saloon table in mock exasperation!', icon: '🪑', cost: 1600, soundType: 'chip' },
  { id: 'white_flag', label: 'White Flag', actionDesc: 'waved a tiny white surrender flag over their cards', icon: '🏳️', cost: 2200, soundType: 'click' },
  { id: 'rain_cash', label: 'Rain Cash', actionDesc: 'made it rain crisp banknotes fluttering across the green felt', icon: '💸', cost: 3000, soundType: 'coin' },
  { id: 'guitar_riff', label: 'Frontier Twang', actionDesc: 'strummed a blazing acoustic western country guitar riff', icon: '🎸', cost: 4000, soundType: 'win' },
  { id: 'dynamite', label: 'Dynamite Spark', actionDesc: 'lit a stick of trick dynamite with a sizzling spark!', icon: '💣', cost: 5500, soundType: 'chip' },
  { id: 'cheers_toast', label: 'Saloon Toast', actionDesc: 'raised a crystal goblet: "To fortune, courage, and cards!"', icon: '🥂', cost: 7000, soundType: 'coin' },
  { id: 'horseshoe', label: 'Lucky Horseshoe', actionDesc: 'polished a glimmering silver horseshoe for supreme luck', icon: '🧲', cost: 9000, soundType: 'win' },
  { id: 'eagle_cry', label: 'Desert Hawk', actionDesc: 'let out a piercing desert hawk cry echoing through the saloon', icon: '🦅', cost: 12000, soundType: 'win' },
  { id: 'train_whistle', label: 'Train Whistle', actionDesc: 'sounded the thunderous brass steam train whistle', icon: '🚂', cost: 16000, soundType: 'win' },
  { id: 'saloon_ghost', label: 'Saloon Spectre', actionDesc: 'summoned a ghostly frontier phantom drifting across the felt', icon: '👻', cost: 20000, soundType: 'riffle' },
  { id: 'diamond_prism', label: 'Diamond Prism', actionDesc: 'unleashed a dazzling prismatic diamond flash of light', icon: '💎', cost: 25000, soundType: 'win' },
  { id: 'golden_spurs', label: 'Golden Spurs', actionDesc: 'jingled solid 24-karat gold cowboy spurs in rhythmic swagger', icon: '✨', cost: 32000, soundType: 'coin' },
  { id: 'high_noon', label: 'High Noon Bell', actionDesc: 'rang the solemn frontier church bell tolling high noon', icon: '⏰', cost: 40000, soundType: 'win' },
  { id: 'sovereign_fanfare', label: 'Sovereign Fanfare', actionDesc: 'heralded an imperial royal golden trumpet fanfare of triumph!', icon: '🎺', cost: 50000, soundType: 'win' },
];

export const EuchreTable: React.FC<EuchreTableProps> = ({
  playerProfile,
  currentTown,
  onExitTable,
  onReturnToMainMenu,
  onOpenSettings,
  onOpenMusic,
  onOpenAchievements,
  onUpdateProfile,
  cameraAngle = 'overhead',
  inGameTheme = 'in_game_1',
}) => {
  // Saloon entrance 3D Cutscene state
  const [showCutscene, setShowCutscene] = useState(true);

  // 4 Players sitting around the Euchre table
  const [players, setPlayers] = useState<EuchrePlayer[]>([
    { id: 'p0', name: playerProfile.username || 'You', avatar: '🤠', team: 1, hand: [], isAI: false, tricksWon: 0 },
    { id: 'p1', name: currentTown.bossName || 'West Kid', avatar: '🕶️', team: 2, hand: [], isAI: true, tricksWon: 0 },
    { id: 'p2', name: 'Partner Pete', avatar: '🤠', team: 1, hand: [], isAI: true, tricksWon: 0 },
    { id: 'p3', name: 'East Maverick', avatar: '🎩', team: 2, hand: [], isAI: true, tricksWon: 0 },
  ]);

  // Match Scoring: First team to 10 points
  const [team1Score, setTeam1Score] = useState(0);
  const [team2Score, setTeam2Score] = useState(0);
  const [dealerIndex, setDealerIndex] = useState(0);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(1);
  const [topKittyCard, setTopKittyCard] = useState<Card | null>(null);
  const [kittyCards, setKittyCards] = useState<Card[]>([]);
  const [trumpSuit, setTrumpSuit] = useState<Suit | null>(null);
  const [makerTeam, setMakerTeam] = useState<1 | 2 | null>(null);
  const [isLoner, setIsLoner] = useState(false);
  const [lonerPlayerIndex, setLonerPlayerIndex] = useState<number | null>(null);

  // Game Stage
  const [stage, setStage] = useState<
    'shuffling' | 'dealing' | 'bidding_r1' | 'bidding_r2' | 'discard' | 'playing' | 'trick_result' | 'hand_result' | 'game_over'
  >('shuffling');

  const [currentTrick, setCurrentTrick] = useState<PlayedCard[]>([]);
  const [leadSuit, setLeadSuit] = useState<Suit | null>(null);
  const [tricksPlayedCount, setTricksPlayedCount] = useState(0);
  const [statusText, setStatusText] = useState('Shuffling 24-card Euchre deck...');
  const [throwingCardId, setThrowingCardId] = useState<string | null>(null);

  // Top-Right Hamburger Dropdown state
  const [showHamburger, setShowHamburger] = useState(false);

  // Bottom-Left Live Chat & Play-by-Play state (closed by default to start)
  const [activeChatTab, setActiveChatTab] = useState<'chat' | 'play_by_play'>('chat');
  const [isChatMinimized, setIsChatMinimized] = useState(true);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string; isSystem?: boolean; time?: string }[]>([
    { sender: 'Saloon Host', text: 'Welcome to the High Stakes Sovereigns Euchre Saloon!', isSystem: true },
    { sender: 'Partner Pete', text: 'Ready to take all 5 tricks, partner!' },
  ]);
  const [playByPlayLogs, setPlayByPlayLogs] = useState<{ id: string; time: string; text: string; type: 'deal' | 'bid' | 'play' | 'trick' | 'score' }>([
    { id: 'init', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), text: 'Saloon seated 4 players. Dealer preparing 24-card deck.', type: 'deal' },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Bottom-Right Emotes state
  const [showEmotesTray, setShowEmotesTray] = useState(false);
  const [activeEmoteDisplay, setActiveEmoteDisplay] = useState<ActiveEmoteDisplay | null>(null);
  const [unlockPromptEmote, setUnlockPromptEmote] = useState<SaloonActionEmote | null>(null);
  const [showCustomAssets, setShowCustomAssets] = useState(false);

  // 10-Second Move Timer State
  const [turnTimeLeft, setTurnTimeLeft] = useState<number>(10);

  // 10-Second Auto Advance to Next Hand Timer State
  const [handResultCountdown, setHandResultCountdown] = useState<number>(10);

  // Unlocked emotes list
  const unlockedEmoteIds = new Set<string>([
    // First 10 are always free
    'tip_hat', 'applause', 'toss_coins', 'victory_cheer', 'saloon_laugh',
    'poker_face', 'good_luck', 'well_played', 'fist_pump', 'sip_whiskey',
    ...(playerProfile.unlockedEmotes || []),
  ]);

  // Tab key listener for Live Chat toggle!
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        sounds.playClick();
        setIsChatMinimized((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addPlayByPlay = (text: string, type: 'deal' | 'bid' | 'play' | 'trick' | 'score') => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setPlayByPlayLogs((prev) => [...prev.slice(-60), { id: `${Date.now()}-${Math.random()}`, time, text, type }]);
  };

  const addChatMessage = (sender: string, text: string, isSystem = false) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev.slice(-40), { sender, text, isSystem, time }]);
  };

  // =========================================================================
  // EUCHRE RULES ENGINE
  // =========================================================================
  const createDeck = (): Card[] => {
    const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
    const values = [9, 10, 11, 12, 13, 14]; // 11=J, 12=Q, 13=K, 14=A
    const deck: Card[] = [];

    suits.forEach((suit) => {
      values.forEach((value) => {
        deck.push({
          suit,
          value,
          id: `${suit}-${value}`,
        });
      });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  };

  const isLeftBower = (card: Card, tSuit: Suit | null): boolean => {
    if (!tSuit || card.value !== 11) return false;
    if (tSuit === 'spades' && card.suit === 'clubs') return true;
    if (tSuit === 'clubs' && card.suit === 'spades') return true;
    if (tSuit === 'hearts' && card.suit === 'diamonds') return true;
    if (tSuit === 'diamonds' && card.suit === 'hearts') return true;
    return false;
  };

  const isRightBower = (card: Card, tSuit: Suit | null): boolean => {
    return !!tSuit && card.value === 11 && card.suit === tSuit;
  };

  const getEffectiveSuit = (card: Card, tSuit: Suit | null): Suit => {
    if (isLeftBower(card, tSuit)) return tSuit!;
    return card.suit;
  };

  const getCardPower = (card: Card, tSuit: Suit | null, lSuit: Suit | null): number => {
    if (isRightBower(card, tSuit)) return 1000;
    if (isLeftBower(card, tSuit)) return 900;

    const effSuit = getEffectiveSuit(card, tSuit);
    if (tSuit && effSuit === tSuit) return 100 + card.value;
    if (lSuit && effSuit === lSuit) return 50 + card.value;
    return card.value;
  };

  // Start a new Euchre hand
  const startNewHand = () => {
    setStage('shuffling');
    setStatusText('Shuffling 24-card Euchre deck...');
    sounds.playRiffle();
    addPlayByPlay(`Dealer ${players[dealerIndex].name} shuffled the 24-card Euchre deck.`, 'deal');

    setTimeout(() => {
      const deck = createDeck();
      setStage('dealing');
      setStatusText('Dealing 5 cards to each player...');
      sounds.playChip();

      // Deal 5 cards each (20 total) + 4 in kitty
      const p0Hand = deck.slice(0, 5);
      const p1Hand = deck.slice(5, 10);
      const p2Hand = deck.slice(10, 15);
      const p3Hand = deck.slice(15, 20);
      const kitty = deck.slice(20, 24);

      setPlayers((prev) => [
        { ...prev[0], hand: p0Hand, tricksWon: 0 },
        { ...prev[1], hand: p1Hand, tricksWon: 0 },
        { ...prev[2], hand: p2Hand, tricksWon: 0 },
        { ...prev[3], hand: p3Hand, tricksWon: 0 },
      ]);

      setKittyCards(kitty);
      setTopKittyCard(kitty[0]);
      setTrumpSuit(null);
      setMakerTeam(null);
      setIsLoner(false);
      setLonerPlayerIndex(null);
      setCurrentTrick([]);
      setTricksPlayedCount(0);
      setLeadSuit(null);

      addPlayByPlay(`Dealt 5 cards to each player. Top kitty card turned up: ${kitty[0].value === 14 ? 'Ace' : kitty[0].value === 11 ? 'Jack' : kitty[0].value} of ${kitty[0].suit}.`, 'deal');

      setTimeout(() => {
        setStage('bidding_r1');
        const firstBidder = (dealerIndex + 1) % 4;
        setCurrentTurnIndex(firstBidder);
        setStatusText(
          firstBidder === 0
            ? `Your turn: Order up ${kitty[0].suit.toUpperCase()} or Pass?`
            : `${players[firstBidder].name} is deciding to order up or pass...`
        );
      }, 1200);
    }, 1200);
  };

  // Initial hand launch
  useEffect(() => {
    if (!showCutscene) {
      startNewHand();
    }
  }, [showCutscene]);

  // AI Bidding round 1
  useEffect(() => {
    if (stage !== 'bidding_r1' || currentTurnIndex === 0) return;

    const timer = setTimeout(() => {
      handleAIBidRound1(currentTurnIndex);
    }, 1100);

    return () => clearTimeout(timer);
  }, [stage, currentTurnIndex]);

  const handleAIBidRound1 = (idx: number) => {
    if (!topKittyCard) return;
    const aiPlayer = players[idx];
    const candidateSuit = topKittyCard.suit;

    const trumpsInHand = aiPlayer.hand.filter(
      (c) => c.suit === candidateSuit || isLeftBower(c, candidateSuit)
    ).length;

    if (trumpsInHand >= 3) {
      const team = aiPlayer.team;
      setMakerTeam(team);
      setTrumpSuit(candidateSuit);
      sounds.playWin();

      addPlayByPlay(`${aiPlayer.name} ordered up ${candidateSuit.toUpperCase()}!`, 'bid');
      addChatMessage('Saloon Table', `${aiPlayer.name} ordered up ${candidateSuit.toUpperCase()}! Trump is now ${candidateSuit.toUpperCase()}.`, true);

      // Dealer picks up top kitty card
      const dealer = players[dealerIndex];
      setPlayers((prev) =>
        prev.map((p, pIdx) => {
          if (pIdx === dealerIndex) {
            return { ...p, hand: [...p.hand, topKittyCard] };
          }
          return p;
        })
      );

      if (dealerIndex === 0) {
        setStage('discard');
        setStatusText(`You received the ${topKittyCard.suit} card! Choose 1 card to discard.`);
        addPlayByPlay('You picked up the top card. Choose 1 card from hand to discard.', 'bid');
      } else {
        // AI Dealer discards lowest non-trump card
        const updatedHand = [...dealer.hand, topKittyCard];
        updatedHand.sort((a, b) => getCardPower(a, candidateSuit, null) - getCardPower(b, candidateSuit, null));
        const discarded = updatedHand.shift();
        setPlayers((prev) =>
          prev.map((p, pIdx) => (pIdx === dealerIndex ? { ...p, hand: updatedHand } : p))
        );
        addPlayByPlay(`${dealer.name} picked up ${topKittyCard.suit} and discarded a card.`, 'bid');

        // Begin play
        startTrickPlay((dealerIndex + 1) % 4);
      }
    } else {
      addPlayByPlay(`${aiPlayer.name} passed on ${candidateSuit}.`, 'bid');
      addChatMessage(aiPlayer.name, 'Pass.');
      advanceBiddingRound1(idx);
    }
  };

  const advanceBiddingRound1 = (currentIdx: number) => {
    const nextIdx = (currentIdx + 1) % 4;
    const firstBidder = (dealerIndex + 1) % 4;

    if (nextIdx === firstBidder) {
      // Everyone passed round 1! Turn down kitty card and move to round 2
      setStage('bidding_r2');
      setCurrentTurnIndex(firstBidder);
      setStatusText(
        firstBidder === 0
          ? 'Everyone passed! Choose any other suit for Trump, or Pass.'
          : `${players[firstBidder].name} is naming trump or passing...`
      );
      addPlayByPlay(`All players passed on ${topKittyCard?.suit}. Top card turned down. Round 2 bidding begins.`, 'bid');
      addChatMessage('Saloon Table', `The ${topKittyCard?.suit} card was turned down.`, true);
    } else {
      setCurrentTurnIndex(nextIdx);
      setStatusText(
        nextIdx === 0
          ? `Your turn: Order up ${topKittyCard?.suit.toUpperCase()} or Pass?`
          : `${players[nextIdx].name} is deciding to order up or pass...`
      );
    }
  };

  // AI Bidding round 2
  useEffect(() => {
    if (stage !== 'bidding_r2' || currentTurnIndex === 0) return;

    const timer = setTimeout(() => {
      handleAIBidRound2(currentTurnIndex);
    }, 1100);

    return () => clearTimeout(timer);
  }, [stage, currentTurnIndex]);

  const handleAIBidRound2 = (idx: number) => {
    if (!topKittyCard) return;
    const aiPlayer = players[idx];
    const forbiddenSuit = topKittyCard.suit;
    const otherSuits: Suit[] = (['spades', 'hearts', 'diamonds', 'clubs'] as Suit[]).filter(
      (s) => s !== forbiddenSuit
    );

    let bestSuit: Suit | null = null;
    let maxTrumps = 0;

    otherSuits.forEach((s) => {
      const count = aiPlayer.hand.filter((c) => c.suit === s || isLeftBower(c, s)).length;
      if (count > maxTrumps) {
        maxTrumps = count;
        bestSuit = s;
      }
    });

    const isStickTheDealer = idx === dealerIndex;

    if (maxTrumps >= 3 || isStickTheDealer) {
      const chosenSuit = bestSuit || otherSuits[0];
      setMakerTeam(aiPlayer.team);
      setTrumpSuit(chosenSuit);
      sounds.playWin();

      addPlayByPlay(`${aiPlayer.name} called ${chosenSuit.toUpperCase()} as Trump!`, 'bid');
      addChatMessage('Saloon Table', `${aiPlayer.name} called ${chosenSuit.toUpperCase()} as Trump!`, true);

      startTrickPlay((dealerIndex + 1) % 4);
    } else {
      addPlayByPlay(`${aiPlayer.name} passed on Round 2.`, 'bid');
      addChatMessage(aiPlayer.name, 'Pass.');
      const nextIdx = (idx + 1) % 4;
      setCurrentTurnIndex(nextIdx);
      setStatusText(
        nextIdx === 0
          ? 'Your turn: Pick any suit other than ' + forbiddenSuit + ' or Pass.'
          : `${players[nextIdx].name} is choosing trump...`
      );
    }
  };

  // Player actions in bidding
  const handlePlayerOrderUp = (goAlone = false) => {
    if (!topKittyCard) return;
    sounds.playWin();
    setMakerTeam(1);
    setTrumpSuit(topKittyCard.suit);
    setIsLoner(goAlone);
    if (goAlone) setLonerPlayerIndex(0);

    addPlayByPlay(`You ordered up ${topKittyCard.suit.toUpperCase()}${goAlone ? ' and are GOING ALONE!' : ''}!`, 'bid');
    addChatMessage('Saloon Table', `You called ${topKittyCard.suit.toUpperCase()} as Trump!`, true);

    const dealer = players[dealerIndex];
    setPlayers((prev) =>
      prev.map((p, pIdx) => (pIdx === dealerIndex ? { ...p, hand: [...p.hand, topKittyCard] } : p))
    );

    if (dealerIndex === 0) {
      setStage('discard');
      setStatusText('You picked up the card! Click 1 card in your hand to discard.');
    } else {
      const updatedHand = [...dealer.hand, topKittyCard];
      updatedHand.sort((a, b) => getCardPower(a, topKittyCard.suit, null) - getCardPower(b, topKittyCard.suit, null));
      updatedHand.shift();
      setPlayers((prev) =>
        prev.map((p, pIdx) => (pIdx === dealerIndex ? { ...p, hand: updatedHand } : p))
      );
      startTrickPlay((dealerIndex + 1) % 4);
    }
  };

  const handlePlayerPassRound1 = () => {
    sounds.playClick();
    addPlayByPlay('You passed on Round 1.', 'bid');
    addChatMessage('You', 'Pass.');
    advanceBiddingRound1(0);
  };

  const handlePlayerCallSuitRound2 = (suit: Suit, goAlone = false) => {
    sounds.playWin();
    setMakerTeam(1);
    setTrumpSuit(suit);
    setIsLoner(goAlone);
    if (goAlone) setLonerPlayerIndex(0);

    addPlayByPlay(`You called ${suit.toUpperCase()} as Trump${goAlone ? ' (ALONE)' : ''}!`, 'bid');
    addChatMessage('Saloon Table', `You called ${suit.toUpperCase()} as Trump!`, true);
    startTrickPlay((dealerIndex + 1) % 4);
  };

  const handlePlayerPassRound2 = () => {
    sounds.playClick();
    addPlayByPlay('You passed on Round 2.', 'bid');
    addChatMessage('You', 'Pass.');
    const nextIdx = (0 + 1) % 4;
    setCurrentTurnIndex(nextIdx);
    setStatusText(`${players[nextIdx].name} is choosing trump...`);
  };

  const handleDiscardCard = (cardToDiscard: Card) => {
    sounds.playChip();
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === 0) {
          return { ...p, hand: p.hand.filter((c) => c.id !== cardToDiscard.id) };
        }
        return p;
      })
    );
    addPlayByPlay(`You discarded the ${cardToDiscard.suit} card.`, 'bid');
    startTrickPlay((dealerIndex + 1) % 4);
  };

  const startTrickPlay = (leadPlayerIdx: number) => {
    setStage('playing');
    setCurrentTrick([]);
    setLeadSuit(null);
    setCurrentTurnIndex(leadPlayerIdx);
    setStatusText(
      leadPlayerIdx === 0
        ? 'Your turn to lead a card!'
        : `${players[leadPlayerIdx].name}'s turn to lead a card.`
    );
  };

  // AI Card Play execution
  useEffect(() => {
    if (stage !== 'playing') return;

    if (isLoner && lonerPlayerIndex !== null) {
      const partnerIdx = (lonerPlayerIndex + 2) % 4;
      if (currentTurnIndex === partnerIdx) {
        const nextIdx = (currentTurnIndex + 1) % 4;
        setCurrentTurnIndex(nextIdx);
        return;
      }
    }

    if (currentTurnIndex === 0) return;

    const timer = setTimeout(() => {
      handleAICardPlay(currentTurnIndex);
    }, 1100);

    return () => clearTimeout(timer);
  }, [stage, currentTurnIndex, currentTrick]);

  const handleAICardPlay = (playerIdx: number) => {
    const ai = players[playerIdx];
    if (ai.hand.length === 0) return;

    let legalCards: Card[] = [];
    if (leadSuit) {
      legalCards = ai.hand.filter((c) => getEffectiveSuit(c, trumpSuit) === leadSuit);
    }
    if (legalCards.length === 0) {
      legalCards = [...ai.hand];
    }

    legalCards.sort((a, b) => getCardPower(b, trumpSuit, leadSuit) - getCardPower(a, trumpSuit, leadSuit));
    const chosenCard = legalCards[0];

    executeCardPlay(playerIdx, chosenCard);
  };

  const handlePlayCard = (card: Card) => {
    if (stage !== 'playing' || currentTurnIndex !== 0 || throwingCardId) return;

    if (leadSuit) {
      const hasLeadSuit = players[0].hand.some(
        (c) => getEffectiveSuit(c, trumpSuit) === leadSuit
      );
      if (hasLeadSuit && getEffectiveSuit(card, trumpSuit) !== leadSuit) {
        sounds.playClick();
        setStatusText(`Must follow lead suit: ${leadSuit.toUpperCase()}!`);
        return;
      }
    }

    setThrowingCardId(card.id);
    sounds.playCardThrow();

    // Small launch delay so hand card visually flies up and into the 3D table
    setTimeout(() => {
      executeCardPlay(0, card);
      setThrowingCardId(null);
    }, 110);
  };

  // 10-Second Move Timer for Player Decisions
  const isPlayerTurn =
    (stage === 'bidding_r1' && currentTurnIndex === 0) ||
    (stage === 'bidding_r2' && currentTurnIndex === 0) ||
    (stage === 'discard' && dealerIndex === 0) ||
    (stage === 'playing' && currentTurnIndex === 0);

  useEffect(() => {
    if (!isPlayerTurn) {
      setTurnTimeLeft(10);
      return;
    }

    setTurnTimeLeft(10);

    const interval = setInterval(() => {
      setTurnTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-execute default action when 10 seconds expire
          handleTimerExpired();
          return 0;
        }
        if (prev <= 4) {
          sounds.playClick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlayerTurn, stage, currentTurnIndex, dealerIndex]);

  const handleTimerExpired = () => {
    if (stage === 'bidding_r1' && currentTurnIndex === 0) {
      addChatMessage('Saloon Table', "⏱️ 10s Timer expired: Automatic Pass (no suit mentioned).");
      handlePlayerPassRound1();
    } else if (stage === 'bidding_r2' && currentTurnIndex === 0) {
      addChatMessage('Saloon Table', "⏱️ 10s Timer expired: Automatic Pass (no suit mentioned).");
      handlePlayerPassRound2();
    } else if (stage === 'discard' && dealerIndex === 0) {
      if (players[0].hand.length > 0) {
        addChatMessage('Saloon Table', '⏱️ 10s Timer expired: Auto-discarded card.');
        handleDiscardCard(players[0].hand[0]);
      }
    } else if (stage === 'playing' && currentTurnIndex === 0) {
      if (players[0].hand.length > 0) {
        let legal = players[0].hand;
        if (leadSuit) {
          const matched = players[0].hand.filter((c) => getEffectiveSuit(c, trumpSuit) === leadSuit);
          if (matched.length > 0) legal = matched;
        }
        addChatMessage('Saloon Table', '⏱️ 10s Timer expired: Auto-played card.');
        executeCardPlay(0, legal[0]);
      }
    }
  };

  const executeCardPlay = (playerIdx: number, card: Card) => {
    if (playerIdx !== 0) {
      sounds.playCardThrow();
    } else {
      sounds.playChip();
    }

    let newLead = leadSuit;
    if (currentTrick.length === 0) {
      newLead = getEffectiveSuit(card, trumpSuit);
      setLeadSuit(newLead);
    }

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === playerIdx ? { ...p, hand: p.hand.filter((c) => c.id !== card.id) } : p))
    );

    const cardRank = card.value === 11 ? 'Jack' : card.value === 12 ? 'Queen' : card.value === 13 ? 'King' : card.value === 14 ? 'Ace' : card.value;
    const isRight = isRightBower(card, trumpSuit);
    const isLeft = isLeftBower(card, trumpSuit);
    const bowerTag = isRight ? ' (Right Bower!)' : isLeft ? ' (Left Bower!)' : '';

    addPlayByPlay(`${players[playerIdx].name} played ${cardRank} of ${card.suit}${bowerTag}`, 'play');

    const updatedTrick = [...currentTrick, { playerId: players[playerIdx].id, card }];
    setCurrentTrick(updatedTrick);

    const activePlayersCount = isLoner ? 3 : 4;

    if (updatedTrick.length >= activePlayersCount) {
      setStage('trick_result');
      setTimeout(() => {
        resolveTrickWinner(updatedTrick, newLead);
      }, 1500);
    } else {
      let nextTurn = (playerIdx + 1) % 4;
      if (isLoner && lonerPlayerIndex !== null) {
        const partnerIdx = (lonerPlayerIndex + 2) % 4;
        if (nextTurn === partnerIdx) {
          nextTurn = (nextTurn + 1) % 4;
        }
      }
      setCurrentTurnIndex(nextTurn);
      setStatusText(
        nextTurn === 0
          ? 'Your turn to play a card!'
          : `${players[nextTurn].name}'s turn to play...`
      );
    }
  };

  const resolveTrickWinner = (trick: PlayedCard[], effectiveLead: Suit | null) => {
    let highestPower = -1;
    let winningPlayerId = trick[0].playerId;

    trick.forEach((entry) => {
      const power = getCardPower(entry.card, trumpSuit, effectiveLead);
      if (power > highestPower) {
        highestPower = power;
        winningPlayerId = entry.playerId;
      }
    });

    const winningIdx = players.findIndex((p) => p.id === winningPlayerId);
    const winner = players[winningIdx];

    setPlayers((prev) =>
      prev.map((p, idx) => (idx === winningIdx ? { ...p, tricksWon: p.tricksWon + 1 } : p))
    );

    sounds.playWin();
    setStatusText(`${winner.name} won Trick ${tricksPlayedCount + 1}!`);
    addPlayByPlay(`Trick ${tricksPlayedCount + 1} won by ${winner.name}!`, 'trick');
    addChatMessage('Saloon Table', `${winner.name} won the trick!`, true);

    const newTricksCount = tricksPlayedCount + 1;
    setTricksPlayedCount(newTricksCount);

    setTimeout(() => {
      if (newTricksCount >= 5) {
        resolveHandScoring();
      } else {
        startTrickPlay(winningIdx);
      }
    }, 1400);
  };

  const resolveHandScoring = () => {
    setStage('hand_result');

    const team1Tricks = players[0].tricksWon + players[2].tricksWon;
    const team2Tricks = players[1].tricksWon + players[3].tricksWon;

    let pts1 = 0;
    let pts2 = 0;
    let message = '';

    if (makerTeam === 1) {
      if (team1Tricks >= 3) {
        if (team1Tricks === 5) {
          pts1 = isLoner ? 4 : 2;
          message = isLoner
            ? 'MARCH ALONE! Your team took all 5 tricks for 4 Points!'
            : 'MARCH! Your team took all 5 tricks for 2 Points!';
        } else {
          pts1 = 1;
          message = 'Contract Made! Your team took 3-4 tricks for 1 Point.';
        }
      } else {
        pts2 = 2;
        message = 'EUCHRED! Opponents defended and score 2 Points!';
      }
    } else {
      if (team2Tricks >= 3) {
        if (team2Tricks === 5) {
          pts2 = isLoner ? 4 : 2;
          message = isLoner
            ? 'Opponents marched alone and scored 4 Points!'
            : 'Opponents marched and scored 2 Points!';
        } else {
          pts2 = 1;
          message = 'Opponents made contract for 1 Point.';
        }
      } else {
        pts1 = 2;
        message = 'EUCHRED! Your team defended and scores 2 Points!';
      }
    }

    const newScore1 = team1Score + pts1;
    const newScore2 = team2Score + pts2;
    setTeam1Score(newScore1);
    setTeam2Score(newScore2);
    setStatusText(message);
    addPlayByPlay(`Hand finished: Your Team took ${team1Tricks} tricks (${pts1 > 0 ? `+${pts1} pts` : '0'}), Opponents took ${team2Tricks} tricks (${pts2 > 0 ? `+${pts2} pts` : '0'}). Score is ${newScore1} - ${newScore2}.`, 'score');
    addChatMessage('Saloon Table', message, true);

    // Update Real Player Stats in Profile & Firestore
    const isPlayerHandWon = team1Tricks >= 3;
    const isLonerWin = makerTeam === 1 && isLoner && team1Tricks === 5;
    const isSweep = team1Tricks === 5;
    const isPerfect = team1Tricks === 5 && team2Tricks === 0;

    const currentStats = playerProfile.stats || {
      handsPlayed: 0,
      handsWon: 0,
      tournamentsPlayed: 0,
      tournamentsWon: 0,
      bossesDefeated: 0,
      biggestPotWon: 0,
      totalChipsWon: 0,
      euchreSweeps: 0,
      lonerWins: 0,
    };

    const nextStreak = isPlayerHandWon ? (currentStats.currentStreak || 0) + 1 : 0;
    const nextLongestStreak = Math.max(currentStats.longestStreak || 0, nextStreak);

    let updatedStats = {
      ...currentStats,
      handsPlayed: (currentStats.handsPlayed || 0) + 1,
      handsWon: (currentStats.handsWon || 0) + (isPlayerHandWon ? 1 : 0),
      euchreSweeps: (currentStats.euchreSweeps || 0) + (isSweep ? 1 : 0),
      lonerWins: (currentStats.lonerWins || 0) + (isLonerWin ? 1 : 0),
      perfectRounds: (currentStats.perfectRounds || 0) + (isPerfect ? 1 : 0),
      currentStreak: nextStreak,
      longestStreak: nextLongestStreak,
    };

    if (newScore1 >= 10 || newScore2 >= 10) {
      setStage('game_over');
      sounds.playWin();
      confetti({ particleCount: 120, spread: 90 });
      const playerWonMatch = newScore1 >= 10;
      setStatusText(
        playerWonMatch
          ? 'MATCH VICTORY! Your team reached 10 points and won the Euchre match!'
          : 'Match Over: Opponents reached 10 points.'
      );
      addPlayByPlay(playerWonMatch ? 'VICTORY! Your team won the 10-point match!' : 'Match ended. Opponents won.', 'score');

      const matchChipsWon = playerWonMatch ? currentTown.tournamentPrize || 500 : 0;
      updatedStats = {
        ...updatedStats,
        tournamentsPlayed: (updatedStats.tournamentsPlayed || 0) + 1,
        tournamentsWon: (updatedStats.tournamentsWon || 0) + (playerWonMatch ? 1 : 0),
        totalChipsWon: (updatedStats.totalChipsWon || 0) + matchChipsWon,
        biggestPotWon: Math.max(updatedStats.biggestPotWon || 0, matchChipsWon),
      };

      if (onUpdateProfile) {
        onUpdateProfile({
          ...playerProfile,
          chips: playerProfile.chips + matchChipsWon,
          stats: updatedStats,
        });
      }
    } else {
      setDealerIndex((prev) => (prev + 1) % 4);
      if (onUpdateProfile) {
        onUpdateProfile({
          ...playerProfile,
          stats: updatedStats,
        });
      }
    }
  };

  // 10-Second Auto Advance to Next Hand countdown timer
  useEffect(() => {
    if (stage !== 'hand_result') {
      setHandResultCountdown(10);
      return;
    }

    setHandResultCountdown(10);

    const interval = setInterval(() => {
      setHandResultCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          startNewHand();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stage]);

  const handleSendChatMessage = () => {
    if (!chatInput.trim()) return;
    addChatMessage(playerProfile.username || 'You', chatInput);
    setChatInput('');
  };

  // Triggering one of the 32 real actions
  const handleSelectEmote = (e: SaloonActionEmote) => {
    // If not unlocked and costs > 0
    if (!unlockedEmoteIds.has(e.id)) {
      setUnlockPromptEmote(e);
      return;
    }

    // Trigger action!
    executeEmoteAction(e);
  };

  const executeEmoteAction = (e: SaloonActionEmote) => {
    // Play appropriate sound
    if (e.soundType === 'win') sounds.playWin();
    else if (e.soundType === 'coin') sounds.playCoin();
    else if (e.soundType === 'chip') sounds.playChip();
    else if (e.soundType === 'riffle') sounds.playRiffle();
    else sounds.playClick();

    // Visual FX
    if (e.cost >= 1000 || e.id === 'victory_cheer' || e.id === 'toss_coins') {
      confetti({ particleCount: 45, spread: 70 });
    }

    const playerName = playerProfile.username || 'You';

    // Trigger full animated character action performer
    setActiveEmoteDisplay({
      id: e.id,
      icon: e.icon,
      label: e.label,
      desc: e.actionDesc,
      senderName: playerName,
      isUser: true,
    });

    // Post to chat & play by play
    addChatMessage(playerName, `* ${playerName} ${e.actionDesc} * [${e.icon}]`);
    addPlayByPlay(`Action: ${playerName} ${e.actionDesc}`, 'bid');

    setShowEmotesTray(false);
  };

  const handleConfirmUnlockEmote = (e: SaloonActionEmote) => {
    if (playerProfile.chips < e.cost) {
      sounds.playClick();
      alert(`You need $${e.cost.toLocaleString()} chips to unlock this action! You currently have $${playerProfile.chips.toLocaleString()}.`);
      return;
    }

    // Deduct chips and unlock
    const newChips = playerProfile.chips - e.cost;
    const updatedUnlocked = [...(playerProfile.unlockedEmotes || []), e.id];
    const updatedProfile: PlayerProfile = {
      ...playerProfile,
      chips: newChips,
      unlockedEmotes: updatedUnlocked,
    };

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile);
    }

    sounds.playCoin();
    confetti({ particleCount: 60, spread: 80 });
    setUnlockPromptEmote(null);

    // Immediately trigger the newly unlocked action!
    executeEmoteAction(e);
  };

  if (showCutscene) {
    return (
      <SaloonWalkInCutscene
        playerProfile={playerProfile}
        currentTown={currentTown}
        onCompleteCutscene={() => setShowCutscene(false)}
      />
    );
  }

  return (
    <div className="relative w-full h-screen bg-[#070d14] flex flex-col justify-between overflow-hidden select-none font-sans text-stone-100">
      
      {/* ========================================================================= */}
      {/* 1. TOP LEFT: EUCHRE 5s SCOREKEEPER (TRADITIONAL TWO 5-CARDS PER TEAM) */}
      {/* ========================================================================= */}
      <div className="fixed top-4 left-4 z-40">
        <EuchreFiveScorekeeper
          team1Score={team1Score}
          team2Score={team2Score}
          team1Name="Your Team"
          team2Name="Opponents"
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. TOP RIGHT: ONLY ONE BUTTON (HAMBURGER BUTTON) */}
      {/* ========================================================================= */}
      <div className="fixed top-4 right-4 z-40">
        <button
          id="table-hamburger-btn"
          onClick={() => {
            sounds.playClick();
            setShowHamburger((prev) => !prev);
          }}
          className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shadow-xl transition active:scale-95 cursor-pointer backdrop-blur-md ${
            showHamburger
              ? 'bg-amber-400 text-stone-950 border-amber-300 ring-2 ring-amber-400'
              : 'bg-stone-950/90 text-amber-300 border-amber-500/60 hover:bg-stone-900'
          }`}
          title="Saloon Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* ======================================================================= */}
        {/* HAMBURGER DROPDOWN: Drops down directly underneath the button */}
        {/* Settings, Music, Achievements & Awards, with MAIN MENU AT THE BOTTOM */}
        {/* Clicking any item closes dropdown and opens that modal in the center of screen! */}
        {/* ======================================================================= */}
        {showHamburger && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowHamburger(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute top-16 right-4 z-50 w-72 bg-gradient-to-b from-[#241308] to-[#140a04] border-2 border-amber-500/70 rounded-2xl p-3 shadow-2xl text-amber-100 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-150"
            >
              <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" /> Saloon Menu
                </span>
                <button
                  onClick={() => setShowHamburger(false)}
                  className="text-stone-400 hover:text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHamburger(false);
                    onOpenSettings(); // opens in middle of screen
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#381a07] hover:bg-[#4d250b] border border-amber-500/40 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 text-amber-200 transition active:scale-95 text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Settings</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHamburger(false);
                    onOpenMusic(); // opens in middle of screen
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#381a07] hover:bg-[#4d250b] border border-amber-500/40 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 text-amber-200 transition active:scale-95 text-left cursor-pointer"
                >
                  <Music className="w-4 h-4 text-amber-400" />
                  <span>Music</span>
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHamburger(false);
                    onOpenAchievements(); // opens in middle of screen
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#381a07] hover:bg-[#4d250b] border border-amber-500/40 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 text-amber-200 transition active:scale-95 text-left cursor-pointer"
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Achievements & Awards</span>
                </button>

                {/* Main Menu AT THE BOTTOM of the list */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowHamburger(false);
                    onReturnToMainMenu();
                  }}
                  className="w-full px-3.5 py-2.5 bg-[#2b1204] hover:bg-[#3f1906] border border-amber-600/40 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-2.5 text-amber-300 transition active:scale-95 text-left mt-1 pt-2.5 border-t border-amber-500/30 cursor-pointer"
                >
                  <Home className="w-4 h-4 text-amber-400" />
                  <span>Main Menu</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN TABLE ARENA & OVERHEAD 3D ENVIRONMENT (Governor of Poker 2 Style) */}
      {/* "Needs to be an overhead view of the game... Need to see all four players. */}
      {/* Players need to be holding the cards in front of them." */}
      {/* ========================================================================= */}
      <div className="relative flex-1 w-full h-full flex flex-col justify-between overflow-hidden">
        {/* Three.js 3D Viewport: Central Table + 4 Seated Players with 5 Cards Each */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <ThreePokerTable3D
            playerProfile={playerProfile}
            playedCards={currentTrick}
            trumpSuit={trumpSuit}
            cameraAngle={cameraAngle}
            inGameTheme={inGameTheme}
            isShuffling={stage === 'shuffling'}
            isDealing={stage === 'dealing'}
            dealerIndex={dealerIndex}
            playerHand={players[0].hand}
            playerCardCounts={players.map((p) => p.hand.length)}
            team1Score={team1Score}
            team2Score={team2Score}
            activeEmote={activeEmoteDisplay}
            playerCount={players.length}
          />
        </div>

        {/* Dynamic Center Status Banner & 10-Second Move Timer */}
        <div className="relative z-20 mx-auto mt-16 max-w-xl flex flex-col items-center gap-2 pointer-events-none">
          <div className="bg-stone-950/85 border border-amber-500/40 py-1.5 px-5 rounded-full text-center shadow-2xl backdrop-blur-md">
            <span className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wide">
              {statusText}
            </span>
          </div>

          {/* 10-Second Turn Countdown Timer */}
          {isPlayerTurn && (
            <div
              className={`px-4 py-1.5 rounded-full border-2 shadow-[0_8px_25px_rgba(0,0,0,0.85)] backdrop-blur-md flex items-center gap-2.5 font-mono text-xs font-black transition-all animate-in fade-in duration-150 ${
                turnTimeLeft <= 3
                  ? 'bg-rose-950/95 border-rose-500 text-rose-300 animate-pulse ring-4 ring-rose-500/40 scale-105'
                  : turnTimeLeft <= 6
                  ? 'bg-amber-950/90 border-amber-400 text-amber-300'
                  : 'bg-emerald-950/90 border-emerald-400 text-emerald-300'
              }`}
            >
              <span className="flex items-center gap-1">
                ⏱️ <span className="uppercase tracking-wider">MOVE TIMER:</span>
              </span>
              <span className="text-sm font-black tracking-tight">{turnTimeLeft}s</span>
              <div className="w-20 h-2 bg-stone-900 rounded-full overflow-hidden border border-white/20">
                <div
                  className={`h-full transition-all duration-1000 ${
                    turnTimeLeft <= 3
                      ? 'bg-rose-500'
                      : turnTimeLeft <= 6
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                  style={{ width: `${(turnTimeLeft / 10) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* HUD: Trump & Trick Progress indicator */}
        <div className="relative z-10 w-full px-6 flex items-center justify-between pointer-events-none">
          {/* Trump Suit Info */}
          <div className="bg-stone-950/85 border border-amber-500/40 rounded-2xl px-3.5 py-1.5 flex items-center gap-2 shadow-xl backdrop-blur-md pointer-events-auto">
            <span className="text-[10px] font-black uppercase text-stone-400">TRUMP:</span>
            {trumpSuit ? (
              <span
                className={`text-xs sm:text-sm font-black flex items-center gap-1 ${
                  trumpSuit === 'hearts' || trumpSuit === 'diamonds' ? 'text-rose-400' : 'text-amber-300'
                }`}
              >
                {trumpSuit === 'spades'
                  ? '♠ SPADES'
                  : trumpSuit === 'hearts'
                  ? '♥ HEARTS'
                  : trumpSuit === 'diamonds'
                  ? '♦ DIAMONDS'
                  : '♣ CLUBS'}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-stone-400 italic">Bidding...</span>
            )}
            {makerTeam && (
              <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 px-1.5 py-0.5 rounded font-black">
                {makerTeam === 1 ? 'YOUR TEAM' : 'OPPONENTS'}
              </span>
            )}
          </div>

          {/* North Player (Partner Pete) Label */}
          <div className="flex flex-col items-center pointer-events-auto">
            <div className="bg-stone-950/90 border border-emerald-400/50 rounded-xl px-3 py-1 text-center shadow-xl backdrop-blur-md">
              <span className="text-xs font-black text-emerald-300 uppercase">
                PARTNER PETE {dealerIndex === 2 && '• (DEALER)'}
              </span>
              <div className="text-[10px] text-stone-300 font-bold">Tricks: {players[2].tricksWon}</div>
            </div>
          </div>

          {/* Tricks Progress */}
          <div className="bg-stone-950/85 border border-amber-500/40 rounded-2xl px-3.5 py-1.5 text-right shadow-xl backdrop-blur-md pointer-events-auto">
            <div className="text-[9px] font-black uppercase text-stone-400">TRICK PROGRESS</div>
            <div className="text-xs font-black text-amber-300">
              Trick {Math.min(5, tricksPlayedCount + 1)} of 5
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: West & East Player badges & Interactive Turn Controls */}
        <div className="relative z-10 w-full flex-1 flex items-center justify-between px-4 sm:px-8 my-auto pointer-events-none">
          {/* West Player (P1) */}
          <div className="flex flex-col items-center pointer-events-auto">
            <div className="bg-stone-950/90 border border-rose-400/50 rounded-xl px-3 py-1 text-center shadow-xl backdrop-blur-md">
              <span className="text-xs font-black text-rose-300 uppercase">
                {players[1].name} {dealerIndex === 1 && '• (DEALER)'}
              </span>
              <div className="text-[10px] text-stone-300 font-bold">Tricks: {players[1].tricksWon}</div>
            </div>
          </div>

          {/* Center Interactive Bidding Modal matching user uploaded screens */}
          {(stage === 'bidding_r1' || stage === 'bidding_r2') && currentTurnIndex === 0 && (
            <EuchreBiddingModal
              stage={stage}
              topKittyCard={topKittyCard}
              onPass={stage === 'bidding_r1' ? handlePlayerPassRound1 : handlePlayerPassRound2}
              onOrderUp={(alone) => handlePlayerOrderUp(alone)}
              onCallSuit={(suit, alone) => handlePlayerCallSuitRound2(suit, alone)}
            />
          )}

          {/* East Player (P3) */}
          <div className="flex flex-col items-center pointer-events-auto">
            <div className="bg-stone-950/90 border border-amber-400/50 rounded-xl px-3 py-1 text-center shadow-xl backdrop-blur-md">
              <span className="text-xs font-black text-amber-300 uppercase">
                {players[3].name} {dealerIndex === 3 && '• (DEALER)'}
              </span>
              <div className="text-[10px] text-stone-300 font-bold">Tricks: {players[3].tricksWon}</div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Player Hands & Turn Indicators */}
        <div className="relative z-20 w-full flex flex-col items-center pb-3 pointer-events-auto">
          {/* Action indicator message */}
          <div className="mb-2">
            {stage === 'discard' && (
              <span className="px-4 py-1.5 bg-amber-500 text-stone-950 rounded-full font-black text-xs uppercase tracking-wider animate-pulse shadow-lg">
                Click 1 card in your hand below to discard!
              </span>
            )}

            {/* Next Hand / Game Over Button */}
            {(stage === 'hand_result' || stage === 'game_over') && (
              <div className="flex flex-col items-center gap-1.5 animate-in zoom-in-95 duration-200">
                <button
                  onClick={() => {
                    sounds.playClick();
                    if (stage === 'game_over') onExitTable();
                    else startNewHand();
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-xs uppercase rounded-xl shadow-[0_8px_25px_rgba(245,158,11,0.5)] border-2 border-yellow-200 cursor-pointer transition active:scale-95 flex items-center gap-2.5"
                >
                  <span>{stage === 'game_over' ? 'Return to Frontier Map' : 'Next Euchre Hand'}</span>
                  {stage === 'hand_result' && (
                    <span className="px-2 py-0.5 rounded-full bg-stone-950/80 text-amber-300 text-[10px] font-mono font-black border border-amber-400/40">
                      Auto in {handResultCountdown}s
                    </span>
                  )}
                </button>
                {stage === 'hand_result' && (
                  <div className="w-48 h-1.5 bg-stone-900/90 rounded-full overflow-hidden border border-amber-500/40 shadow-inner">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000"
                      style={{ width: `${(handResultCountdown / 10) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Player Hand Cards (Fanned out) */}
          <div className="flex items-center justify-center -space-x-3 sm:-space-x-4 mb-1.5">
            {players[0].hand.map((card, idx) => {
              const isRight = isRightBower(card, trumpSuit);
              const isLeft = isLeftBower(card, trumpSuit);
              const isThrowing = throwingCardId === card.id;

              return (
                <div
                  key={`${card.id}-${idx}`}
                  className={`transition-all duration-300 ease-out ${
                    isThrowing
                      ? '-translate-y-36 scale-75 -rotate-12 opacity-0 pointer-events-none'
                      : 'hover:-translate-y-3 active:scale-95'
                  }`}
                >
                  <BicycleCard
                    card={card}
                    isRightBower={isRight}
                    isLeftBower={isLeft}
                    size="md"
                    onClick={() => {
                      if (stage === 'discard') handleDiscardCard(card);
                      else if (stage === 'playing') handlePlayCard(card);
                    }}
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
              YOU ({playerProfile.username || 'Gambler'}) • Tricks: {players[0].tricksWon}
            </span>
            {dealerIndex === 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-stone-950 text-[9px] font-black flex items-center justify-center shadow">
                D
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. BOTTOM LEFT: LIVE CHAT & PLAY-BY-PLAY (TOGGLE WITH TAB KEY) */}
      {/* Split into two distinct sections: Live Chat & Play-by-Play description */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 left-4 z-40 flex flex-col items-start select-text">
        {isChatMinimized ? (
          <button
            onClick={() => {
              sounds.playClick();
              setIsChatMinimized(false);
            }}
            className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shadow-xl transition active:scale-95 cursor-pointer backdrop-blur-md ${
              isChatMinimized
                ? 'bg-stone-950/90 text-purple-300 border-purple-500/60 hover:bg-stone-900'
                : 'bg-purple-600 text-white border-purple-300'
            }`}
            title="Saloon Chat & Logs (TAB)"
          >
            <MessageSquare className="w-5 h-5" />
          </button>
        ) : (
          <div className="w-80 sm:w-96 h-72 sm:h-80 bg-stone-950/95 border-2 border-purple-500/40 rounded-2xl p-2.5 shadow-2xl backdrop-blur-md flex flex-col justify-between">
            <div>
              {/* Header with Two Tabs: Live Chat vs Play-by-Play & Tab shortcut pill */}
              <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveChatTab('chat')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      activeChatTab === 'chat'
                        ? 'bg-purple-600 text-white shadow'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Live Chat</span>
                  </button>

                  <button
                    onClick={() => setActiveChatTab('play_by_play')}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      activeChatTab === 'play_by_play'
                        ? 'bg-amber-600 text-white shadow'
                        : 'bg-stone-900 text-stone-400 hover:text-white'
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Play-by-Play</span>
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-stone-900 text-stone-400 border border-stone-800">
                    TAB
                  </span>
                  <button
                    onClick={() => setIsChatMinimized(true)}
                    className="text-stone-500 hover:text-stone-300 cursor-pointer p-1"
                    title="Minimize (Tab)"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Section 1: LIVE CHAT */}
              {activeChatTab === 'chat' && (
                <div className="space-y-1.5 mt-2 h-44 sm:h-52 overflow-y-auto pr-1 text-[11px] leading-relaxed">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className="bg-stone-900/70 p-1.5 rounded-lg border border-stone-800/60">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`font-black ${msg.isSystem ? 'text-amber-400' : 'text-purple-300'}`}>
                          {msg.sender}
                        </span>
                        {msg.time && <span className="text-[9px] text-stone-500">{msg.time}</span>}
                      </div>
                      <span className="text-stone-200">{msg.text}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Section 2: PLAY-BY-PLAY DESCRIPTION */}
              {activeChatTab === 'play_by_play' && (
                <div className="space-y-1 mt-2 h-52 sm:h-60 overflow-y-auto pr-1 text-[11px] leading-relaxed">
                  {playByPlayLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-1.5 rounded-lg border text-[10px] sm:text-[11px] ${
                        log.type === 'deal'
                          ? 'bg-blue-950/40 border-blue-800/40 text-blue-200'
                          : log.type === 'bid'
                          ? 'bg-purple-950/40 border-purple-800/40 text-purple-200'
                          : log.type === 'trick'
                          ? 'bg-emerald-950/40 border-emerald-800/40 text-emerald-200 font-bold'
                          : log.type === 'score'
                          ? 'bg-amber-950/40 border-amber-800/40 text-amber-200 font-black'
                          : 'bg-stone-900/60 border-stone-800/50 text-stone-300'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] text-stone-400 font-semibold mb-0.5">
                        <span className="uppercase tracking-wider font-bold text-amber-400/80">
                          {log.type}
                        </span>
                        <span>{log.time}</span>
                      </div>
                      <div>{log.text}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input (Only on Chat tab) */}
            {activeChatTab === 'chat' && (
              <div className="flex items-center gap-1.5 pt-1.5 border-t border-stone-800">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendChatMessage()}
                  placeholder="Chat with saloon..."
                  className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-2.5 py-1 text-xs text-stone-200 focus:outline-none focus:border-purple-500"
                />
                <button
                  onClick={handleSendChatMessage}
                  className="p-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 5. BOTTOM RIGHT: 32 REAL EMOTE ACTIONS */}
      {/* First 10 are FREE, next 22 progressively priced in chips */}
      {/* ========================================================================= */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
        {showEmotesTray && (
          <div className="mb-2 w-80 sm:w-96 max-h-96 overflow-y-auto p-3 bg-stone-950/95 border-2 border-amber-500/70 rounded-3xl shadow-2xl backdrop-blur-md flex flex-col gap-2 animate-in slide-in-from-bottom duration-150">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-800">
              <div className="flex items-center gap-1.5 text-xs font-black uppercase text-amber-300">
                <Smile className="w-4 h-4 text-amber-400" />
                <span>32 Saloon Emote Actions</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-stone-400">
                <Coins className="w-3 h-3 text-amber-400" />
                <span>${playerProfile.chips.toLocaleString()}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1.5">
              {SALOON_32_EMOTES.map((e, idx) => {
                const isUnlocked = unlockedEmoteIds.has(e.id);
                return (
                  <button
                    key={e.id}
                    onClick={() => handleSelectEmote(e)}
                    className={`relative p-2 rounded-2xl flex flex-col items-center justify-center gap-1 transition active:scale-95 cursor-pointer border ${
                      isUnlocked
                        ? 'bg-stone-900/90 hover:bg-stone-800 border-amber-500/30 hover:border-amber-400'
                        : 'bg-stone-950/90 border-stone-800 opacity-80 hover:opacity-100 hover:border-amber-500/50'
                    }`}
                    title={isUnlocked ? e.label : `Locked: $${e.cost.toLocaleString()} chips`}
                  >
                    <span className="text-xl">{e.icon}</span>
                    <span className="text-[9px] font-black text-amber-100/90 truncate w-full text-center">
                      {e.label}
                    </span>

                    {/* Cost Badge / Lock Indicator */}
                    {isUnlocked ? (
                      <span className="text-[8px] font-black text-emerald-400">
                        {idx < 10 ? 'Free' : 'Unlocked'}
                      </span>
                    ) : (
                      <span className="text-[8px] font-black text-amber-400/90 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                        <span>${e.cost >= 1000 ? `${(e.cost / 1000).toFixed(0)}k` : e.cost}</span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <button
          id="show-all-emotes-btn"
          onClick={() => {
            sounds.playClick();
            setShowEmotesTray((prev) => !prev);
          }}
          className={`w-11 h-11 rounded-2xl border-2 flex items-center justify-center shadow-xl transition active:scale-95 cursor-pointer backdrop-blur-md ${
            showEmotesTray
              ? 'bg-amber-400 text-stone-950 border-yellow-200'
              : 'bg-stone-950/90 text-amber-300 border-amber-500/60 hover:bg-stone-900'
          }`}
          title="Saloon Emotes (32)"
        >
          <Smile className="w-5 h-5" />
        </button>
      </div>

      {/* Unlock Emote Confirmation Modal */}
      {unlockPromptEmote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-gradient-to-b from-[#251307] to-[#120803] border-2 border-amber-500/80 rounded-3xl p-5 shadow-2xl text-amber-100 flex flex-col items-center text-center gap-3">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center text-3xl shadow">
              {unlockPromptEmote.icon}
            </div>

            <div>
              <h3 className="text-base font-black text-amber-300 uppercase tracking-wide">
                Unlock "{unlockPromptEmote.label}" Action
              </h3>
              <p className="text-xs text-stone-300 mt-1">
                Perform real action: "{unlockPromptEmote.actionDesc}"
              </p>
            </div>

            <div className="w-full bg-stone-900/90 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-bold">Action Cost:</span>
              <span className="font-black text-amber-300 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                ${unlockPromptEmote.cost.toLocaleString()} Chips
              </span>
            </div>

            <div className="w-full bg-stone-900/90 border border-stone-800 rounded-2xl p-2.5 flex items-center justify-between text-xs">
              <span className="text-stone-400 font-bold">Your Balance:</span>
              <span className={`font-black ${playerProfile.chips >= unlockPromptEmote.cost ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${playerProfile.chips.toLocaleString()} Chips
              </span>
            </div>

            <div className="w-full flex items-center gap-2 mt-2">
              <button
                onClick={() => setUnlockPromptEmote(null)}
                className="flex-1 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs uppercase rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmUnlockEmote(unlockPromptEmote)}
                disabled={playerProfile.chips < unlockPromptEmote.cost}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition cursor-pointer shadow ${
                  playerProfile.chips >= unlockPromptEmote.cost
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                Unlock Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Character Action Emote Performer Animation Overlay */}
      <AnimatedEmotePerformer
        emote={activeEmoteDisplay}
        playerProfile={playerProfile}
        onFinish={() => setActiveEmoteDisplay(null)}
      />

      {/* Permanent Custom Cards & Themes Uploader Modal */}
      <CustomAssetsModal
        isOpen={showCustomAssets}
        onClose={() => setShowCustomAssets(false)}
      />

    </div>
  );
};
