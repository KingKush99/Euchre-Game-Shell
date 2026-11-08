import React, { useState } from 'react';
import { X, Trophy, Shield, Crown, Medal, Flame, Users, Layers, Sparkles, ChevronRight, Info, Award, Star } from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { EUCHRE_TIERS, EuchreTier, getTierForElo } from '../data/euchreTiers';

interface RoyalLeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerElo?: number;
  playerName?: string;
}

interface LeaderboardEntry {
  place: number;
  player: string;
  avatar: string;
  country: string;
  tierId: number;
  elo: number;
  winRate: string;
  wins: number;
  streak: number;
  isCurrentUser?: boolean;
}

const LEADERBOARD_PLAYERS: LeaderboardEntry[] = [
  { place: 1, player: 'Sovereign Jack', avatar: '👑', country: '🇺🇸', tierId: 10, elo: 4940, winRate: '78%', wins: 412, streak: 14 },
  { place: 2, player: 'QueenOfBowers', avatar: '💎', country: '🇨🇦', tierId: 10, elo: 4780, winRate: '75%', wins: 388, streak: 9 },
  { place: 3, player: 'Lonestar Slim', avatar: '🤠', country: '🇺🇸', tierId: 9, elo: 4420, winRate: '72%', wins: 340, streak: 6 },
  { place: 4, player: 'Bower Dynamo', avatar: '⚡', country: '🇬🇧', tierId: 9, elo: 4210, winRate: '71%', wins: 315, streak: 4 },
  { place: 5, player: 'Master Maverick', avatar: '🎯', country: '🇦🇺', tierId: 8, elo: 3890, winRate: '68%', wins: 280, streak: 5 },
  { place: 6, player: 'Deadeye Dan', avatar: '🎲', country: '🇺🇸', tierId: 8, elo: 3670, winRate: '66%', wins: 254, streak: 3 },
  { place: 7, player: 'TrickArtist Maya', avatar: '🎭', country: '🇫🇷', tierId: 7, elo: 3410, winRate: '64%', wins: 232, streak: 7 },
  { place: 8, player: 'Lone Ace Riley', avatar: '♠️', country: '🇩🇪', tierId: 7, elo: 3260, winRate: '63%', wins: 218, streak: 2 },
  { place: 9, player: 'Crimson Maker', avatar: '🍷', country: '🇮🇹', tierId: 6, elo: 2880, winRate: '61%', wins: 194, streak: 4 },
  { place: 10, player: 'Saloon Shuffler', avatar: '🃏', country: '🇺🇸', tierId: 6, elo: 2650, winRate: '59%', wins: 178, streak: 1 },
  { place: 11, player: 'Grizzly Guard', avatar: '🐻', country: '🇨🇦', tierId: 5, elo: 2390, winRate: '58%', wins: 160, streak: 3 },
  { place: 12, player: 'Iron Defender', avatar: '🛡️', country: '🇬🇧', tierId: 4, elo: 1870, winRate: '56%', wins: 135, streak: 2 },
  { place: 13, player: 'Texas Taker', avatar: '⭐', country: '🇺🇸', tierId: 3, elo: 1420, winRate: '54%', wins: 110, streak: 1 },
  { place: 14, player: 'You (Player)', avatar: '🤠', country: '🇺🇸', tierId: 7, elo: 3240, winRate: '69%', wins: 98, streak: 4, isCurrentUser: true },
  { place: 15, player: 'Swift Caller', avatar: '📣', country: '🇲🇽', tierId: 2, elo: 890, winRate: '51%', wins: 75, streak: 2 },
  { place: 16, player: 'Novice Dealer', avatar: '🌱', country: '🇯🇵', tierId: 1, elo: 420, winRate: '48%', wins: 38, streak: 0 },
];

const LEADERBOARD_CLANS = [
  { place: 1, name: 'Texas Bowers Syndicate', tag: '[BOWER]', banner: '🏰', leaderTierId: 10, leader: 'Sovereign Jack', members: 48, totalElo: 184500, winRate: '76%' },
  { place: 2, name: 'Grand Euchre Monarchs', tag: '[ROYAL]', banner: '👑', leaderTierId: 10, leader: 'QueenOfBowers', members: 45, totalElo: 172300, winRate: '74%' },
  { place: 3, name: 'Lone Star Outlaws', tag: '[LONE]', banner: '⭐', leaderTierId: 9, leader: 'Lonestar Slim', members: 50, totalElo: 158900, winRate: '70%' },
  { place: 4, name: 'Saloon Card Masters', tag: '[DECK]', banner: '♠️', leaderTierId: 8, leader: 'Master Maverick', members: 42, totalElo: 142100, winRate: '67%' },
  { place: 5, name: 'Deadwood Tricksters', tag: '[TRICK]', banner: '🎭', leaderTierId: 7, leader: 'TrickArtist Maya', members: 39, totalElo: 128400, winRate: '63%' },
];

export const RoyalLeaderboardModal: React.FC<RoyalLeaderboardModalProps> = ({
  isOpen,
  onClose,
  playerElo = 3240,
  playerName = 'Texas Sovereign',
}) => {
  const [activeTab, setActiveTab] = useState<'players' | 'clans' | 'tiers'>('players');
  const [selectedTier, setSelectedTier] = useState<EuchreTier>(getTierForElo(playerElo));
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');
  const [inspectedTier, setInspectedTier] = useState<EuchreTier | null>(null);

  if (!isOpen) return null;

  const currentTier = getTierForElo(playerElo);
  const nextTier = EUCHRE_TIERS.find((t) => t.id === currentTier.id + 1);
  const eloToNext = nextTier ? Math.max(0, nextTier.minElo - playerElo) : 0;
  const currentTierProgress = nextTier
    ? Math.min(100, Math.max(0, ((playerElo - currentTier.minElo) / (nextTier.minElo - currentTier.minElo)) * 100))
    : 100;

  const filteredPlayers = tierFilter === 'all'
    ? LEADERBOARD_PLAYERS
    : LEADERBOARD_PLAYERS.filter((p) => p.tierId === tierFilter);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div
        style={{
          width: 'min(1120px, calc(100vw - 32px))',
          height: 'min(820px, calc(100vh - 32px))',
        }}
        className="relative bg-[#0b101d] border-2 border-amber-500/30 rounded-3xl p-4 sm:p-6 shadow-[0_30px_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden text-white shrink-0"
      >
        {/* Header with Title & Close Button */}
        <div className="flex items-start justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 bg-stone-900">
              <img
                src={currentTier.image}
                alt={currentTier.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">
                  EUCHRE EVERYTHING CHAMPIONSHIP
                </span>
                <span className="text-[10px] text-slate-400 hidden sm:inline font-mono">
                  SEASON 4 RANKED LADDER
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Euchre Sovereign Leaderboard</span>
              </h2>
            </div>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-10 h-10 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition active:scale-95 border border-rose-400/40"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 10-Tier Carousel Row with Pasted Images as Tier Icons */}
        <div className="my-3 bg-[#070b16] border border-amber-500/20 rounded-2xl p-2.5 sm:p-3 shadow-inner shrink-0">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              10 Euchre Competitive Tiers & Badges
            </span>
            <span className="text-[10px] text-slate-400">
              Click any tier icon to inspect emblem & filter table
            </span>
          </div>

          {/* Horizontal Tier Badges Grid */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 sm:gap-2">
            {EUCHRE_TIERS.map((tier) => {
              const isSelected = tierFilter === tier.id || selectedTier.id === tier.id;
              const isUserTier = currentTier.id === tier.id;

              return (
                <button
                  key={tier.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedTier(tier);
                    setTierFilter(tierFilter === tier.id ? 'all' : tier.id);
                  }}
                  className={`relative group rounded-xl p-1.5 flex flex-col items-center justify-center transition-all duration-200 border text-center ${
                    isSelected
                      ? 'bg-gradient-to-b from-amber-950/90 to-slate-900 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-[1.03]'
                      : 'bg-[#0f172a]/70 border-slate-800 hover:border-slate-600 hover:bg-slate-800/60'
                  }`}
                >
                  {/* Active Player Current Marker */}
                  {isUserTier && (
                    <div className="absolute -top-1.5 -right-1 bg-amber-500 text-black text-[8px] font-black px-1 rounded-full shadow z-10 animate-pulse">
                      YOU
                    </div>
                  )}

                  {/* Tier Icon Image */}
                  <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full overflow-hidden border-2 mb-1 shadow-md transition group-hover:scale-105 shrink-0 bg-stone-900 ${
                    isSelected ? 'border-amber-300 ring-2 ring-amber-500/50' : 'border-amber-600/40'
                  }`}>
                    <img
                      src={tier.image}
                      alt={tier.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <span className="text-[10px] font-extrabold text-white truncate w-full leading-tight">
                    {tier.name}
                  </span>
                  <span className="text-[8px] font-mono text-slate-400">
                    {tier.minElo}+
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Tabs & Active Filter Pill */}
        <div className="flex items-center justify-between gap-2 mb-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('players');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'players'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Trophy className="w-3.5 h-3.5" />
              Top Players
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('clans');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'clans'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Top Clans
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('tiers');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                activeTab === 'tiers'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              All 10 Tier Emblems
            </button>
          </div>

          {/* Tier Filter Reset if active */}
          {tierFilter !== 'all' && (
            <button
              onClick={() => {
                sounds.playClick();
                setTierFilter('all');
              }}
              className="text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 px-2.5 py-1 rounded-lg hover:bg-amber-900/60 transition flex items-center gap-1"
            >
              Filtered by: {EUCHRE_TIERS.find((t) => t.id === tierFilter)?.name} (Clear)
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1">
          {/* TAB 1: TOP PLAYERS TABLE */}
          {activeTab === 'players' && (
            <div className="space-y-1.5">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-[#0b101d] z-10">
                  <tr className="border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <th className="py-2 pl-3 w-16">PLACE</th>
                    <th className="py-2">PLAYER</th>
                    <th className="py-2">TIER & EMBLEM</th>
                    <th className="py-2 text-center hidden sm:table-cell">WIN RATE</th>
                    <th className="py-2 text-center hidden md:table-cell">STREAK</th>
                    <th className="py-2 pr-3 text-right">ELO RATING</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-medium">
                  {filteredPlayers.map((row) => {
                    const rowTier = EUCHRE_TIERS.find((t) => t.id === row.tierId) || EUCHRE_TIERS[0];
                    return (
                      <tr
                        key={row.place}
                        onClick={() => {
                          sounds.playClick();
                          setInspectedTier(rowTier);
                        }}
                        className={`transition group cursor-pointer ${
                          row.isCurrentUser
                            ? 'bg-amber-950/40 border-l-4 border-amber-400 hover:bg-amber-950/60'
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Place Badge */}
                        <td className="py-2.5 pl-3 font-black text-sm">
                          {row.place === 1 ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-extrabold">
                              <Trophy className="w-4 h-4 fill-amber-400" /> #1
                            </span>
                          ) : row.place === 2 ? (
                            <span className="inline-flex items-center gap-1 text-slate-300 font-extrabold">
                              <Medal className="w-4 h-4 fill-slate-300" /> #2
                            </span>
                          ) : row.place === 3 ? (
                            <span className="inline-flex items-center gap-1 text-amber-600 font-extrabold">
                              <Medal className="w-4 h-4 fill-amber-600" /> #3
                            </span>
                          ) : (
                            <span className="text-slate-500 font-mono">#{row.place}</span>
                          )}
                        </td>

                        {/* Player Name & Country */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{row.avatar}</span>
                            <div>
                              <div className="font-bold text-white text-sm group-hover:text-amber-300 transition flex items-center gap-1.5">
                                {row.player}
                                <span className="text-xs">{row.country}</span>
                                {row.isCurrentUser && (
                                  <span className="text-[9px] font-black bg-amber-500 text-black px-1.5 py-0.2 rounded-full uppercase">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400">
                                {row.wins} victories
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Tier Icon & Badge using pasted images */}
                        <td className="py-2.5">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm group-hover:border-amber-400/60 transition">
                            <div className="w-7 h-7 rounded-full overflow-hidden border border-amber-400/80 shrink-0 bg-stone-900 shadow">
                              <img
                                src={rowTier.image}
                                alt={rowTier.name}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black text-white group-hover:text-amber-200">
                                {rowTier.name}
                              </span>
                              <span className="text-[8px] font-mono text-amber-400">
                                Tier {rowTier.tierNumber}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Win Rate */}
                        <td className="py-2.5 text-center hidden sm:table-cell font-mono font-bold text-emerald-400">
                          {row.winRate}
                        </td>

                        {/* Streak */}
                        <td className="py-2.5 text-center hidden md:table-cell">
                          {row.streak > 0 ? (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-orange-400 bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-500/30">
                              <Flame className="w-3 h-3 fill-orange-400" /> {row.streak}W
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">-</span>
                          )}
                        </td>

                        {/* ELO Rating */}
                        <td className="py-2.5 pr-3 text-right">
                          <span className="font-mono font-black text-sm text-amber-300">
                            {row.elo.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400 ml-1 font-mono">ELO</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB 2: TOP CLANS */}
          {activeTab === 'clans' && (
            <div className="space-y-2.5">
              {LEADERBOARD_CLANS.map((clan) => {
                const leaderTier = EUCHRE_TIERS.find((t) => t.id === clan.leaderTierId) || EUCHRE_TIERS[9];
                return (
                  <div
                    key={clan.place}
                    className="flex items-center justify-between p-3.5 bg-[#0f172a]/70 rounded-2xl border border-slate-800 hover:border-amber-500/40 hover:bg-[#131d35] transition cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center font-black text-sm">
                        {clan.place === 1 ? (
                          <span className="text-amber-400 font-extrabold">#1</span>
                        ) : clan.place === 2 ? (
                          <span className="text-slate-300 font-extrabold">#2</span>
                        ) : (
                          <span className="text-amber-600 font-extrabold">#{clan.place}</span>
                        )}
                      </div>

                      <div className="text-2xl">{clan.banner}</div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-sm">{clan.name}</span>
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/30">
                            {clan.tag}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>Leader: <strong className="text-slate-200">{clan.leader}</strong></span>
                          <span>•</span>
                          <span>{clan.members} members</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono font-bold">{clan.winRate} Win Rate</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Leader Tier Icon */}
                      <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400/80 shrink-0">
                          <img
                            src={leaderTier.image}
                            alt={leaderTier.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-amber-200 hidden sm:inline">
                          {leaderTier.name}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-black text-sm text-amber-300">
                          {clan.totalElo.toLocaleString()}
                        </div>
                        <div className="text-[9px] font-mono text-slate-400">TOTAL ELO</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: ALL 10 TIERS SHOWCASE */}
          {activeTab === 'tiers' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {EUCHRE_TIERS.map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => {
                    sounds.playClick();
                    setInspectedTier(tier);
                  }}
                  className={`rounded-2xl p-3 border transition-all cursor-pointer flex flex-col items-center text-center group bg-gradient-to-b ${tier.badgeGradient} ${tier.badgeBorder} hover:scale-[1.02] shadow-lg`}
                >
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] my-2 bg-stone-950 group-hover:border-amber-300 transition shrink-0">
                    <img
                      src={tier.image}
                      alt={tier.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                    />
                  </div>

                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                    Tier {tier.tierNumber}
                  </span>
                  <h4 className="text-base font-black text-white mt-0.5">
                    {tier.name}
                  </h4>
                  <span className="text-xs font-mono font-bold text-amber-200 mt-1 bg-black/40 px-2 py-0.5 rounded-full border border-amber-400/30">
                    {tier.minElo} - {tier.maxElo} ELO
                  </span>
                  <p className="text-[11px] text-slate-300 mt-2 leading-tight line-clamp-2">
                    {tier.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* User Active Standing Footer Bar */}
        <div className="mt-3 pt-3 border-t border-slate-800/80 bg-[#070b16] rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-11 h-11 rounded-full overflow-hidden border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)] shrink-0 bg-stone-900">
              <img
                src={currentTier.image}
                alt={currentTier.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400">YOUR STANDING:</span>
                <span className="text-sm font-black text-white">#14 on Sovereign Ladder</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs font-extrabold text-amber-300">
                  {currentTier.name} (Tier {currentTier.tierNumber})
                </span>
                <span className="text-xs font-mono text-slate-400">• {playerElo.toLocaleString()} ELO</span>
              </div>
            </div>
          </div>

          {/* Progress Bar to Next Tier */}
          <div className="w-full sm:w-64 flex flex-col gap-1">
            <div className="flex justify-between text-[10px] font-mono text-slate-300">
              <span>Next: <strong className="text-amber-300">{nextTier ? nextTier.name : 'Max Tier'}</strong></span>
              <span>{nextTier ? `${eloToNext} ELO needed` : 'Pinnacle Master'}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-700">
              <div
                style={{ width: `${currentTierProgress}%` }}
                className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full shadow-[0_0_8px_rgba(245,158,11,0.8)]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tier Detail Inspector Modal */}
      {inspectedTier && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative bg-[#0c1326] border-2 border-amber-400/80 rounded-3xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.9)] max-w-md w-full flex flex-col items-center text-center">
            <button
              onClick={() => {
                sounds.playClick();
                setInspectedTier(null);
              }}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              OFFICIAL EUCHRE TIER {inspectedTier.tierNumber}
            </span>

            <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.6)] my-4 bg-stone-950">
              <img
                src={inspectedTier.image}
                alt={inspectedTier.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <h3 className="text-2xl font-black text-white">
              {inspectedTier.name}
            </h3>

            <div className="my-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-200 font-mono font-bold text-xs">
              {inspectedTier.minElo} - {inspectedTier.maxElo} ELO
            </div>

            <p className="text-xs text-slate-300 mt-2 leading-relaxed px-4">
              {inspectedTier.description}
            </p>

            <button
              onClick={() => {
                sounds.playClick();
                setTierFilter(inspectedTier.id);
                setInspectedTier(null);
                setActiveTab('players');
              }}
              className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-black text-xs hover:from-amber-400 hover:to-yellow-400 shadow-lg transition"
            >
              View Players in {inspectedTier.name} Tier
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

