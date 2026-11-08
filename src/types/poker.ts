export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs' | '♠' | '♥' | '♦' | '♣';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

export interface Card {
  suit: Suit;
  rank?: Rank;
  value: number; // 9 to 14 for Euchre
  color?: 'red' | 'black';
  id?: string;
}

export type PersonalityType = 'rock' | 'maniac' | 'caller' | 'pro' | 'boss' | 'wild';

export interface BotPersonality {
  type: PersonalityType;
  aggression: number; // 0.0 to 1.0
  bluffRate: number; // 0.0 to 1.0
  looseness: number; // 0.0 to 1.0
  catchphrases: {
    fold: string[];
    call: string[];
    raise: string[];
    allIn: string[];
    win: string[];
  };
}

export interface Player {
  id: string;
  name: string;
  avatar: string;
  hatId?: string;
  chips: number;
  currentBet?: number;
  totalRoundBet?: number;
  holeCards?: Card[];
  isFolded?: boolean;
  isAllIn?: boolean;
  isSittingOut?: boolean;
  isHuman?: boolean;
  team: 1 | 2; // Team 1: P0 & P2, Team 2: P1 & P3
  personality?: BotPersonality;
  lastAction?: string;
  talkBubble?: string;
  isWinner?: boolean;
  winAmount?: number;
}

export type EuchreStage = 'deal' | 'bidding1' | 'bidding2' | 'discard' | 'trick' | 'handResult' | 'matchEnd';
export type GameStage = EuchreStage | 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export interface GameActionLog {
  id: string;
  text: string;
  timestamp: string;
}

export interface HandEvaluation {
  rank: any;
  score: number;
  description: string;
  name?: string;
  kickers?: any[];
  winningCards?: any[];
}

export const HandRank = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10,
};

export interface EuchreGameState {
  stage: EuchreStage;
  dealerIndex: number;
  activePlayerIndex: number;
  trumpSuit: Suit | null;
  upCard: Card | null;
  makerIndex: number | null; // Who called trump
  makerTeam: 1 | 2 | null;
  isLoner: boolean;
  lonerPlayerIndex: number | null;
  currentTrickCards: { playerIndex: number; card: Card }[];
  leadSuit: Suit | null;
  tricksWon: [number, number]; // [Team 1, Team 2]
  matchScore: [number, number]; // [Team 1, Team 2] - first to 10 wins
  targetPoints: number; // 10
  currentTrickNumber: number; // 1 to 5
  handHistoryLogs: string[];
}

export interface TownLocation {
  id: string;
  name: string;
  title: string;
  description: string;
  requiredLevel: number;
  buyIn: number;
  smallBlind: number;
  bigBlind: number;
  maxPlayers: number;
  bossName: string;
  bossAvatar: string;
  bossHat: string;
  bossQuote: string;
  accentColor: string;
  bannerImage: string;
  tournamentPrize: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master' | 'Legendary';
  unlocked: boolean;
  conquered: boolean;
  population: string;
  keyArchitecture: string[];
  mapCoords?: { x: number; y: number };
}

export interface TwitchChatMessage {
  id: string;
  username: string;
  userColor: string;
  badge?: 'sub' | 'vip' | 'mod' | 'broadcaster';
  message: string;
  time: string;
  isAction?: boolean;
  bits?: number;
}

export interface HatItem {
  id: string;
  name: string;
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  description: string;
  icon: string; // Icon type identifier
  costChips: number;
  costGold: number;
  costSovereigns?: number;
  luckBonus: number;
  unlocked: boolean;
}

export interface PropertyItem {
  id: string;
  townId: string;
  name: string;
  type: 'Saloon' | 'Bank' | 'Silver Mine' | 'Ranch' | 'Hotel' | 'Mansion' | 'Pub' | 'Store' | 'Foundry';
  cost: number;
  incomePerHour: number;
  icon: string;
  owned: boolean;
  level: number;
  upgradeCost: number;
}

export interface DailyClaimDay {
  day: number;
  chipsReward: number;
  sovereignsReward: number;
  isSpecial: boolean;
  title: string;
}

export interface CharacterConfig {
  eyesStyle: string;
  noseStyle: string;
  mouthStyle: string;
  faceStyle: string;
  hairStyle: string;
  bodyStyle: string;
  shirtsStyle: string;
  pantsStyle: string;
  shoesStyle: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  shoesColor: string;
  eyesColor: string;
  skinColor: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  tier: 'common' | 'rare' | 'legendary' | 'god';
  category: 'Hats' | 'Felts' | 'Decks' | 'Pawns' | 'Trophies' | 'Awards';
  icon: string;
  dropRate?: string; // e.g., "80%", "15%", "4%", "1%"
  description?: string;
  equipped?: boolean;
  acquiredAt?: string;
}

export interface PlayerProfile {
  name?: string;
  username?: string;
  bio?: string;
  mascot?: string;
  customAvatarUrl?: string;
  lastUsernameChangeTimestamp?: number;
  characterConfig?: CharacterConfig;
  inventory?: InventoryItem[];
  chips: number;
  gold: number;
  sovereigns: number; // Special Token Currency!
  xp: number;
  level: number;
  currentHatId: string;
  unlockedHats: string[];
  unlockedEmotes?: string[];
  conqueredTowns: string[];
  properties: { [propertyId: string]: { owned: boolean; level: number; lastCollected: number } };
  claimedDailyDays: number[];
  lastDailyClaim: number;
  followers?: string[];
  following?: string[];
  friends?: string[];
  friendRequests?: { id: string; fromUserId: string; name: string; avatar: string; timestamp: number }[];
  stats: {
    handsPlayed: number;
    handsWon: number;
    tournamentsPlayed: number;
    tournamentsWon: number;
    bossesDefeated: number;
    biggestPotWon: number;
    totalChipsWon: number;
    euchreSweeps: number;
    lonerWins: number;
    perfectRounds?: number;
    pawnCaptures?: number;
    diceRolled?: number;
    longestStreak?: number;
    currentStreak?: number;
    timePlayedSeconds?: number;
    fastestWinSeconds?: number;
    dailyRewardsClaimed?: number;
    medalsUnlocked?: number;
  };
}
