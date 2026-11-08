import React, { useState } from 'react';
import { PlayerProfile } from '../types/poker';
import { TOWNS_DATA, HATS_CATALOG } from '../data/gameData';
import { X, Trophy, Swords, Coins, Award, Sparkles, Flame, RotateCcw } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface StatsCareerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onResetProgress: () => void;
}

interface Achievement {
  id: string;
  category: 'Euchre Conquest' | 'Arcade Slots' | 'Real Estate Empire' | 'Daily & Social' | 'Sovereign Mastery';
  title: string;
  description: string;
  tier: 'Beginner' | 'Novice' | 'Semi-Pro' | 'Pro' | 'World Class';
  multiplier: number;
  reward: number;
  unlocked: boolean;
  icon: string;
}

const PRESTIGE_TIERS = [
  { name: 'Beginner', mult: 1.4, badge: '⭐' },
  { name: 'Novice', mult: 2.0, badge: '🌟' },
  { name: 'Semi-Pro', mult: 3.5, badge: '🔥' },
  { name: 'Pro', mult: 5.0, badge: '👑' },
  { name: 'World Class', mult: 7.0, badge: '⚡' },
];

const CATEGORIES = [
  'Euchre Conquest',
  'Arcade Slots',
  'Real Estate Empire',
  'Daily & Social',
  'Sovereign Mastery',
] as const;

const TIERS_CONFIG = [
  { tier: 'Beginner' as const, multiplier: 1.4, baseReward: 140 },
  { tier: 'Novice' as const, multiplier: 2.0, baseReward: 300 },
  { tier: 'Semi-Pro' as const, multiplier: 3.5, baseReward: 700 },
  { tier: 'Pro' as const, multiplier: 5.0, baseReward: 1500 },
  { tier: 'World Class' as const, multiplier: 7.0, baseReward: 3500 },
];

const OBJECTIVES_PER_CATEGORY: Record<string, { title: string; description: string; icon: string }[]> = {
  'Euchre Conquest': [
    // Beginner (1-5, mult 1.4)
    { title: 'Tenderfoot Gambler', description: 'Win your first Euchre hand at Texas Saloon', icon: '♠️' },
    { title: 'First Trick Won', description: 'Take 1 trick in any official Euchre match', icon: '🃏' },
    { title: 'Trump Apprentice', description: 'Order up trump for the first time', icon: '♣️' },
    { title: 'Partnership Pioneer', description: 'Play a match with an AI partner', icon: '👥' },
    { title: 'Table Victory', description: 'Win your first full Euchre match', icon: '🏆' },
    // Novice (6-10, mult 2.0)
    { title: 'Trump Specialist', description: 'Score 10 Loner tricks in single-player matches', icon: '♥️' },
    { title: 'Bower Collector', description: 'Play 20 Right Bowers in tricks', icon: '♦️' },
    { title: 'Austin Showdown', description: 'Defeat the Austin city opponent', icon: '🤠' },
    { title: 'Sweep Victory', description: 'Win all 5 tricks in a non-loner hand', icon: '✨' },
    { title: 'Loner Courage', description: 'Call Loner 5 times in competitive play', icon: '👑' },
    // Semi-Pro (11-15, mult 3.5)
    { title: 'Right Bower Maestro', description: 'Win 50 tricks using the Right Bower', icon: '♠️' },
    { title: 'Euchre Defense', description: 'Euchre the calling opponents 10 times', icon: '🛡️' },
    { title: 'San Antonio Conqueror', description: 'Defeat San Antonio and Houston bosses', icon: '🏰' },
    { title: 'Streak Gambler', description: 'Win 3 consecutive Euchre matches', icon: '🔥' },
    { title: 'Trump Mastermind', description: 'Call trump in 3 different suits in 1 match', icon: '🎯' },
    // Pro (16-20, mult 5.0)
    { title: 'City Boss Slayer', description: 'Defeat 5 reigning town bosses across Texas', icon: '⚔️' },
    { title: 'Loner Sovereign', description: 'Complete 25 successful Loner sweeps', icon: '🌟' },
    { title: 'Dallas High Roller', description: 'Win a match with 10+ point lead', icon: '💰' },
    { title: 'Master Defender', description: 'Euchre the callers 25 times', icon: '🔰' },
    { title: '50 Match Legend', description: 'Complete 50 full Euchre matches', icon: '📜' },
    // World Class (21-25, mult 7.0)
    { title: 'Grand Governor Champion', description: 'Conquer all 10 Texas cities with 3-star ratings', icon: '👑' },
    { title: 'Undefeated Sovereign', description: 'Maintain a 10 match winning streak', icon: '⚡' },
    { title: '100 Loner Sweeps', description: 'Achieve 100 successful Loner sweeps', icon: '💎' },
    { title: 'Euchre Dynasty', description: 'Accumulate 1,000 total trick wins', icon: '🔮' },
    { title: 'Texas Monarch Legend', description: 'Reach Rank #1 on the Sovereign Leaderboard', icon: '🏆' },
  ],
  'Arcade Slots': [
    // Beginner (1-5, mult 1.4)
    { title: 'First Reel Spin', description: 'Spin the 3D Mini-Slots machine for the first time', icon: '🎰' },
    { title: 'Small Stake Spinner', description: 'Bet 10 coins on any reel spin', icon: '🪙' },
    { title: 'Lever Puller', description: 'Pull the 3D lever bar 5 times', icon: '🕹️' },
    { title: 'Lucky Diamond', description: 'Land a diamond symbol on reel 1', icon: '💎' },
    { title: 'Arcade Novice', description: 'Complete 10 slot spins in total', icon: '🎲' },
    // Novice (6-10, mult 2.0)
    { title: 'Double Match Gambler', description: 'Hit 2 matching symbols on a 50 coin bet', icon: '✨' },
    { title: 'Auto-Spin Enthusiast', description: 'Use auto-spin mode for 10 continuous spins', icon: '🔄' },
    { title: 'Container Bettor', description: 'Select the 100 bet coin container', icon: '💰' },
    { title: 'Crown Hunter', description: 'Land a Crown symbol on any reel', icon: '👑' },
    { title: '5,000 Coin Collector', description: 'Win 5,000 total coins in slot payouts', icon: '🥇' },
    // Semi-Pro (11-15, mult 3.5)
    { title: '3D Jackpot Pioneer', description: 'Hit a 3-symbol Jackpot in mini-slots', icon: '🎉' },
    { title: 'High Roller Container', description: 'Bet 250 coins on 10 consecutive spins', icon: '💵' },
    { title: 'Lucky 7 Streak', description: 'Hit two 7 symbols on 1 spin', icon: '7️⃣' },
    { title: '50 Reel Spins', description: 'Complete 50 total reel spins', icon: '🎰' },
    { title: 'Bar Master', description: 'Land 3 BAR symbols on a single spin', icon: '🍫' },
    // Pro (16-20, mult 5.0)
    { title: 'Jackpot Titan', description: 'Hit 5 separate 3D Jackpots', icon: '💥' },
    { title: '25,000 Coin Winner', description: 'Accumulate 25,000 total slot coins', icon: '🏆' },
    { title: '250 Coin Master', description: 'Bet 250 coins 50 times in arcade mode', icon: '⚜️' },
    { title: 'Auto-Spin Legend', description: 'Complete 100 auto-spins seamlessly', icon: '🔁' },
    { title: 'Arcade VIP', description: 'Spend 10,000 bet coins in slot bets', icon: '🎫' },
    // World Class (21-25, mult 7.0)
    { title: 'Arcade Sovereign Legend', description: 'Accumulate 100,000 total slot winnings', icon: '⚡' },
    { title: 'Triple Crown Sovereign', description: 'Hit 3 Crown symbols on a 250 bet', icon: '👑' },
    { title: '500 Spin Marathon', description: 'Complete 500 total slot spins', icon: '🚀' },
    { title: 'Ultimate Slot Millionaire', description: 'Reach 1,000,000 total slot coin balance', icon: '🌟' },
    { title: 'Arcade God Monarch', description: 'Unlock all slot achievements & awards', icon: '🔮' },
  ],
  'Real Estate Empire': [
    // Beginner (1-5, mult 1.4)
    { title: 'Saloon Landlord', description: 'Buy your first Texas real estate property', icon: '🏠' },
    { title: 'First Rent Collector', description: 'Collect passive rent for the first time', icon: '💵' },
    { title: 'Mill Creek Pub', description: 'Acquire The Miller\'s Rest Pub property', icon: '🍻' },
    { title: 'Property Renovator', description: 'Upgrade 1 property to Level 2', icon: '🔨' },
    { title: 'Estate Beginner', description: 'Own 2 properties simultaneously', icon: '🏢' },
    // Novice (6-10, mult 2.0)
    { title: 'Foundry Renovator', description: 'Upgrade 3 real estate properties to Level 2', icon: '⚒️' },
    { title: 'Pine Hollow Inn', description: 'Acquire Lumberjack\'s Hearth Inn', icon: '🏨' },
    { title: 'Rent Accumulator', description: 'Collect $2,500 passive rent in 1 payout', icon: '💰' },
    { title: 'Silver Lake Store', description: 'Acquire Fishmonger Exchange', icon: '🏪' },
    { title: '4 Property Portfolio', description: 'Own 4 properties across Texas', icon: '🏛️' },
    // Semi-Pro (11-15, mult 3.5)
    { title: 'Passive Rent Tycoon', description: 'Collect $10,000 passive chips rent in 1 click', icon: '🏦' },
    { title: 'Mountain View Resort', description: 'Acquire Mountain View Resort property', icon: '🏰' },
    { title: 'Sovereign Auctioneer', description: 'Place a winning bid on an NFT or Character Card', icon: '🔨' },
    { title: 'Level 5 Property', description: 'Upgrade any single property to Level 5', icon: '⭐' },
    { title: 'Harvest Hall Owner', description: 'Acquire Maple Valley Harvest Hall', icon: '🌾' },
    // Pro (16-20, mult 5.0)
    { title: 'Customs House Baron', description: 'Acquire Grand Portage Customs House', icon: '📜' },
    { title: 'Auction Tycoon', description: 'Win 5 live sovereign auction bids', icon: '🏷️' },
    { title: 'High-Stakes Parlor', description: 'Acquire High-Stakes Mountain Parlor', icon: '♠️' },
    { title: '50,000 Hourly Rent', description: 'Reach $50,000/hr in total passive income', icon: '💎' },
    { title: 'Grand Crown Hotel', description: 'Acquire The Grand Crown Hotel', icon: '👑' },
    // World Class (21-25, mult 7.0)
    { title: 'Texas Estate Baron', description: 'Own all 8 saloons, hotels & foundries simultaneously', icon: '🏰' },
    { title: 'Winterhaven Casino', description: 'Acquire Winterhaven Grand Casino ($1.5M)', icon: '🎰' },
    { title: 'Max Level Tycoon', description: 'Upgrade all properties to Max Level', icon: '⚡' },
    { title: '1,000,000 Passive Rent', description: 'Collect $1,000,000 total passive rent', icon: '🌟' },
    { title: 'Real Estate Emperor', description: 'Own all properties + 5 live auction NFTs', icon: '🔱' },
  ],
  'Daily & Social': [
    // Beginner (1-5, mult 1.4)
    { title: 'Daily Dice Roller', description: 'Complete your first Daily Dice Yahtzee spin', icon: '🎲' },
    { title: 'Social Pioneer', description: 'Send a Direct Message and add a friend', icon: '💬' },
    { title: 'Profile Visitor', description: 'Inspect another player\'s 3D profile', icon: '👤' },
    { title: 'First Note to Self', description: 'Write a note to self on your profile card', icon: '📝' },
    { title: 'Day 1 Streak', description: 'Log in for 1 day', icon: '🗓️' },
    // Novice (6-10, mult 2.0)
    { title: 'Yahtzee Full House', description: 'Roll a Full House in Daily Dice', icon: '🎲' },
    { title: 'Twitch Viewer', description: 'Tune into live streams via the Twitch drawer', icon: '📺' },
    { title: 'Friend Circle', description: 'Add 3 friends to your network', icon: '👥' },
    { title: '3-Day Streak', description: 'Maintain a 3-day consecutive login streak', icon: '🔥' },
    { title: 'Mascot Customizer', description: 'Change your profile mascot avatar', icon: '🎭' },
    // Semi-Pro (11-15, mult 3.5)
    { title: 'Large Straight Roller', description: 'Roll a Large Straight in Daily Dice', icon: '🎲' },
    { title: 'Group Chat Leader', description: 'Join or create a group DM conversation', icon: '🗣️' },
    { title: 'Palace Polyglot', description: 'Switch Palace Assistant AI to 3 world languages', icon: '🌐' },
    { title: '5-Day Streak', description: 'Maintain a 5-day consecutive login streak', icon: '⚡' },
    { title: 'Twitch Chat Chatter', description: 'Send 5 messages in Twitch Live Chat', icon: '💬' },
    // Pro (16-20, mult 5.0)
    { title: 'Daily Dice Yahtzee', description: 'Roll 5 of a kind Yahtzee in Daily Dice', icon: '🎯' },
    { title: '7-Day Streak Vanguard', description: 'Maintain a 7-day login streak without breaking', icon: '🔥' },
    { title: 'World Language Explorer', description: 'Test AI Assistant in all 10 world languages', icon: '🌍' },
    { title: 'Community Pillar', description: 'Have 10 active friends & group DMs', icon: '🌟' },
    { title: '14-Day Streak Legend', description: 'Maintain a 14-day consecutive login streak', icon: '🏆' },
    // World Class (21-25, mult 7.0)
    { title: '30-Day Streak Sovereign', description: 'Maintain a 30-day unbroken login streak', icon: '👑' },
    { title: 'Double Yahtzee Legend', description: 'Roll Yahtzee twice in 1 week', icon: '✨' },
    { title: 'Social Monarch', description: 'Connect with 25 friends in multiplayer', icon: '🚀' },
    { title: 'Community Governor', description: 'Send 100 direct messages across Texas', icon: '🔮' },
    { title: 'Daily & Social God', description: 'Unlock all 25 Daily & Social achievements', icon: '🔱' },
  ],
  'Sovereign Mastery': [
    // Beginner (1-5, mult 1.4)
    { title: 'Custom 3D Stylist', description: 'Customize hair, eyes, and clothing in 3D studio', icon: '🎨' },
    { title: 'Hat Wearer', description: 'Equip your first hat from the catalog', icon: '🤠' },
    { title: 'Theme Collector', description: 'Unlock 3 Main Menu, In-Game, or Profile themes', icon: '🖼️' },
    { title: 'XP Rank Up', description: 'Reach Level 2 XP rank', icon: '⭐' },
    { title: 'Settings Explorer', description: 'Customize audio or visual preferences', icon: '⚙️' },
    // Novice (6-10, mult 2.0)
    { title: 'Marketplace Trader', description: 'Trade items or cash out Sovereigns tokens', icon: '💹' },
    { title: 'Level 5 Master', description: 'Reach Level 5 player rank', icon: '🎖️' },
    { title: 'Hat Collection', description: 'Own 3 different hats in inventory', icon: '🎩' },
    { title: 'Palette Master', description: 'Change 3D character color swatches', icon: '🎨' },
    { title: 'Custom Deck Owner', description: 'Equip a custom card deck design', icon: '🎴' },
    // Semi-Pro (11-15, mult 3.5)
    { title: 'Prestige High Roller', description: 'Reach Level 10 and unlock Governor rank', icon: '👑' },
    { title: 'Rare Item Drop', description: 'Acquire a Rare or Legendary item drop', icon: '🔮' },
    { title: 'Catalog Collector', description: 'Own 5 hats and 2 custom decks', icon: '📜' },
    { title: 'Theme Master', description: 'Unlock 5 visual themes across the app', icon: '🌌' },
    { title: 'Level 15 Monarch', description: 'Reach Level 15 player rank', icon: '🌟' },
    // Pro (16-20, mult 5.0)
    { title: 'God Tier Monarch', description: 'Acquire a God Tier item (1% drop rate)', icon: '🔥' },
    { title: 'Sovereign Millionaire', description: 'Accumulate 10,000 Sovereigns tokens', icon: '💰' },
    { title: 'Level 25 Grandmaster', description: 'Reach Level 25 player rank', icon: '⚜️' },
    { title: 'Full Catalog Owner', description: 'Own all hats & custom decks', icon: '👑' },
    { title: '3D Studio Sculptor', description: 'Create 5 unique 3D character presets', icon: '🗿' },
    // World Class (21-25, mult 7.0)
    { title: 'Level 50 Sovereign God', description: 'Reach Level 50 player rank', icon: '⚡' },
    { title: '100,000 Sovereigns Vault', description: 'Accumulate 100,000 Sovereigns tokens', icon: '🏛️' },
    { title: 'God Tier Collector', description: 'Acquire 3 God Tier items', icon: '🔮' },
    { title: 'Prestige Perfectionist', description: 'Achieve 100% completion in all categories', icon: '🌟' },
    { title: 'Sovereign Sovereign', description: 'The ultimate master of Texas Euchre Palace', icon: '🔱' },
  ],
};

const GENERATED_ACHIEVEMENTS: Achievement[] = CATEGORIES.flatMap((category) => {
  const objectives = OBJECTIVES_PER_CATEGORY[category] || [];
  return objectives.map((obj, index) => {
    const tierIdx = Math.floor(index / 5); // 0..4
    const config = TIERS_CONFIG[tierIdx] || TIERS_CONFIG[0];
    return {
      id: `${category.toLowerCase().replace(/[^a-z]/g, '')}_${index + 1}`,
      category,
      title: obj.title,
      description: obj.description,
      tier: config.tier,
      multiplier: config.multiplier,
      reward: Math.floor(config.baseReward * (1 + (index % 5) * 0.1)),
      unlocked: index < 2, // First 2 unlocked by default for instant feedback
      icon: obj.icon,
    };
  });
});

export const StatsCareerModal: React.FC<StatsCareerModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onResetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'achievements'>('stats');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');

  if (!isOpen) return null;

  const winRate =
    playerProfile.stats.handsPlayed > 0
      ? ((playerProfile.stats.handsWon / playerProfile.stats.handsPlayed) * 100).toFixed(1)
      : '0.0';

  const equippedHat = HATS_CATALOG.find((h) => h.id === playerProfile.currentHatId);

  const filteredAchievements = GENERATED_ACHIEVEMENTS.filter((ach) =>
    selectedCategoryFilter === 'All' ? true : ach.category === selectedCategoryFilter
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="stats-career-modal"
        className="relative w-full max-w-3xl bg-stone-950 border-2 border-amber-500/50 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden text-white"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-900/40">
          <div className="flex items-center gap-3">
            <div className="text-3xl">⭐</div>
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-black text-amber-200">
                GUNSLINGER CAREER & PRESTIGE ACHIEVEMENTS
              </h2>
              <p className="text-xs text-amber-400/80">
                Track stats & unlock 25 achievements per category with prestige multipliers up to 7x.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-stone-900 border border-amber-600/40 rounded-xl p-1">
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('stats');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                  activeTab === 'stats' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                Career Stats
              </button>
              <button
                onClick={() => {
                  sounds.playClick();
                  setActiveTab('achievements');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-black transition ${
                  activeTab === 'achievements' ? 'bg-amber-500 text-stone-950 shadow' : 'text-stone-400 hover:text-white'
                }`}
              >
                25 Achievements
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-100 border border-stone-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {activeTab === 'stats' ? (
          <>
            {/* Profile Snapshot */}
            <div className="my-3 p-4 bg-gradient-to-r from-amber-950/90 via-stone-900 to-amber-950/90 border border-amber-500/40 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 border-2 border-yellow-300 flex items-center justify-center text-3xl shadow-lg">
                  <span>🤠</span>
                  {equippedHat && (
                    <div className="absolute -top-3 -right-2 text-xl" title={equippedHat.name}>
                      {equippedHat.icon}
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="font-serif font-extrabold text-base sm:text-lg text-amber-100">
                    {playerProfile.name}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                    <span className="bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
                      Level {playerProfile.level}
                    </span>
                    <span className="text-stone-300">
                      Rank: {playerProfile.level >= 10 ? 'Governor of Poker' : playerProfile.level >= 6 ? 'High Roller' : playerProfile.level >= 3 ? 'Bounty Hunter' : 'Tenderfoot'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-stone-400">Conquered Towns</div>
                <div className="text-lg font-black text-yellow-300">
                  {playerProfile.conqueredTowns.length} / {TOWNS_DATA.length}
                </div>
              </div>
            </div>

            {/* Stats 2x3 Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-2 overflow-y-auto pr-1">
              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Biggest Pot Won</span>
                </div>
                <div className="text-base font-black text-amber-300">
                  ${playerProfile.stats.biggestPotWon.toLocaleString()}
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Showdown Win Rate</span>
                </div>
                <div className="text-base font-black text-emerald-300">{winRate}%</div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                  <span>Tourneys Won</span>
                </div>
                <div className="text-base font-black text-yellow-300">
                  {playerProfile.stats.tournamentsWon}
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Swords className="w-3.5 h-3.5 text-rose-400" />
                  <span>Bosses Defeated</span>
                </div>
                <div className="text-base font-black text-rose-300">
                  {playerProfile.stats.bossesDefeated}
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  <span>Total Hands Won</span>
                </div>
                <div className="text-base font-black text-blue-300">
                  {playerProfile.stats.handsWon} / {playerProfile.stats.handsPlayed}
                </div>
              </div>

              <div className="bg-stone-900/90 border border-stone-800 p-3 rounded-2xl flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-xs text-stone-400">
                  <Flame className="w-3.5 h-3.5 text-purple-400" />
                  <span>Royal Flushes</span>
                </div>
                <div className="text-base font-black text-purple-300">
                  {playerProfile.stats.royalFlushes}
                </div>
              </div>
            </div>
          </>
        ) : (
          /* PRESTIGE ACHIEVEMENTS WORKSPACE (5 Prestige Multipliers: 1.4x, 2x, 3.5x, 5x, 7x) */
          <div className="flex-1 flex flex-col overflow-hidden py-3 space-y-3">
            {/* Prestige Tier Banner */}
            <div className="bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 border border-amber-500/40 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-black text-amber-300">
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>PRESTIGE MULTIPLIER SCALING:</span>
              </div>
              <div className="flex items-center gap-2">
                {PRESTIGE_TIERS.map((t) => (
                  <span
                    key={t.name}
                    className="bg-stone-950 border border-stone-800 px-2 py-0.5 rounded-lg text-[10px] font-mono text-amber-400 font-bold"
                  >
                    {t.badge} {t.name} ({t.mult}x)
                  </span>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center justify-between text-xs font-bold text-stone-300 bg-stone-900/90 border border-stone-800 p-2.5 rounded-xl">
              <span>Category Filter:</span>
              <select
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="bg-stone-950 border border-stone-700 rounded-lg px-3 py-1 text-xs text-amber-300 font-bold outline-none"
              >
                <option value="All">All Categories (25 Achievements)</option>
                <option value="Euchre Conquest">Euchre Conquest</option>
                <option value="Arcade Slots">Arcade Slots</option>
                <option value="Real Estate Empire">Real Estate Empire</option>
                <option value="Daily & Social">Daily & Social</option>
                <option value="Sovereign Mastery">Sovereign Mastery</option>
              </select>
            </div>

            {/* Achievements List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {filteredAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition-all ${
                    ach.unlocked
                      ? 'bg-stone-900/90 border-amber-500/40 shadow'
                      : 'bg-stone-950/60 border-stone-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-stone-950 border border-amber-500/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      {ach.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-100">{ach.title}</h4>
                        <span className="text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-md">
                          {ach.tier} ({ach.multiplier}x)
                        </span>
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">{ach.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 ml-3">
                    <span className="text-xs font-black text-yellow-300 block">
                      +${ach.reward.toLocaleString()} Sovereigns
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        ach.unlocked ? 'bg-emerald-500/20 text-emerald-400' : 'bg-stone-800 text-stone-500'
                      }`}
                    >
                      {ach.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Actions */}
        <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between">
          <button
            onClick={() => {
              if (window.confirm('Reset all poker progress, hats, and properties back to Level 1?')) {
                sounds.playClick();
                onResetProgress();
                onClose();
              }
            }}
            className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/50 px-3 py-1.5 rounded-xl transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Career</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl border border-stone-600 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
