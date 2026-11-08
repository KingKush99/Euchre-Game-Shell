import React, { useState } from 'react';
import { PlayerProfile, TownLocation } from '../types/poker';
import { TOWNS_DATA, PROPERTIES_DATA } from '../data/gameData';
import { ThreeTown3D } from './ThreeTown3D';
import { sounds } from '../utils/soundEffects';
import {
  Trophy,
  Lock,
  Swords,
  Coins,
  Building,
  CheckCircle2,
  Sparkles,
  MapPin,
  Filter,
  Eye,
  Compass,
} from 'lucide-react';

interface MapScreenProps {
  playerProfile: PlayerProfile;
  onSelectTown: (town: TownLocation, mode: 'cash' | 'tournament' | 'boss_duel') => void;
  onOpenProperties: () => void;
  onOpenShop: () => void;
  onOpenWheel: () => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({
  playerProfile,
  onSelectTown,
  onOpenProperties,
  onOpenShop,
  onOpenWheel,
}) => {
  const [viewMode, setViewMode] = useState<'3d_city' | 'overview_grid'>('3d_city');
  const [selectedTownId, setSelectedTownId] = useState<string>(
    playerProfile.currentTownId || TOWNS_DATA[0].id
  );
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'conquered'>('all');

  const currentTown =
    TOWNS_DATA.find((t) => t.id === selectedTownId) || TOWNS_DATA[0];

  const towns = TOWNS_DATA.map((t) => {
    const isUnlocked = playerProfile.level >= t.requiredLevel;
    const isConquered = playerProfile.conqueredTowns.includes(t.id);
    return {
      ...t,
      unlocked: isUnlocked,
      conquered: isConquered,
    };
  });

  const filteredTowns = towns.filter((t) => {
    if (filter === 'unlocked') return t.unlocked;
    if (filter === 'conquered') return t.conquered;
    return true;
  });

  const getTownPropertiesCount = (townId: string) => {
    const townProps = PROPERTIES_DATA.filter((p) => p.townId === townId);
    const owned = townProps.filter((p) => playerProfile.properties[p.id]?.owned);
    return `${owned.length}/${townProps.length}`;
  };

  const formatMoney = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(1)}k`;
    return `$${val.toLocaleString()}`;
  };

  const conqueredCount = playerProfile.conqueredTowns.length;

  if (viewMode === '3d_city') {
    return (
      <div className="relative w-full h-full">
        {/* Floating View Toggle Button */}
        <div className="absolute top-3 right-40 z-20">
          <button
            onClick={() => {
              sounds.playClick();
              setViewMode('overview_grid');
            }}
            className="flex items-center gap-1.5 bg-stone-900/90 hover:bg-stone-800 text-amber-200 border border-amber-600/50 text-xs font-bold px-3 py-2 rounded-2xl shadow-xl backdrop-blur-md transition active:scale-95"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>Territory Map (10 Cities)</span>
          </button>
        </div>

        {/* 3D Interactive Campaign City */}
        <ThreeTown3D
          playerProfile={playerProfile}
          currentTown={currentTown}
          onSelectTownId={(id) => setSelectedTownId(id)}
          onEnterSaloon={(mode) => onSelectTown(currentTown, mode)}
          onOpenProperties={onOpenProperties}
          onOpenShop={onOpenShop}
          onOpenWheel={onOpenWheel}
        />
      </div>
    );
  }

  return (
    <div
      id="map-screen"
      className="relative w-full min-h-screen bg-stone-950 text-stone-100 p-3 sm:p-6 pb-28 overflow-y-auto"
    >
      {/* Background Vintage Painted Texture Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/40 via-stone-950 to-stone-950 pointer-events-none" />

      {/* Painted Header Banner */}
      <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 mb-5 bg-gradient-to-r from-amber-950/90 via-stone-900/95 to-amber-950/90 p-4 sm:p-5 rounded-3xl border-2 border-amber-600/40 shadow-2xl backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-3xl shadow-lg border-2 border-yellow-300">
            🤠
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-serif text-amber-200 tracking-wide">
                TEXAS POKER TRAIL
              </h1>
              <span className="bg-amber-500/20 text-yellow-300 text-xs font-black px-2 py-0.5 rounded-full border border-amber-400/40">
                {conqueredCount} / 10 CITIES CONQUERED
              </span>
            </div>
            <p className="text-xs text-amber-400/90 font-medium mt-0.5">
              Explore 10 legendary Texas saloons in 3D, conquer regional bosses, and become Governor of Poker!
            </p>
          </div>
        </div>

        {/* Quick Hub Navigation & Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* 3D City Switch Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setViewMode('3d_city');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-black text-xs rounded-xl shadow-lg border border-yellow-300 transition active:scale-95"
          >
            <span>🤠 Return to 3D City Walk</span>
          </button>

          {/* Filter Pills */}
          <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'all' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              All 10
            </button>
            <button
              onClick={() => setFilter('unlocked')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'unlocked' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Unlocked
            </button>
            <button
              onClick={() => setFilter('conquered')}
              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                filter === 'conquered' ? 'bg-amber-600 text-white' : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Conquered
            </button>
          </div>

          <button
            id="map-lucky-spin-btn"
            onClick={() => {
              sounds.playClick();
              onOpenWheel();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-bold text-xs rounded-xl shadow-lg border border-amber-400/50 transition active:scale-95 animate-pulse"
          >
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            <span>Lucky Wheel</span>
          </button>
        </div>
      </div>

      {/* 10 Towns Grid / Territory Cards */}
      <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {filteredTowns.map((town, idx) => {
          const canAfford = playerProfile.chips >= town.buyIn;

          return (
            <div
              key={town.id}
              id={`town-card-${town.id}`}
              className={`relative flex flex-col justify-between rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-2xl ${
                town.unlocked
                  ? 'bg-stone-900/90 border-amber-600/40 hover:border-amber-400 hover:shadow-amber-500/10'
                  : 'bg-stone-950/70 border-stone-800 opacity-60'
              }`}
            >
              {/* Town Header Card Banner */}
              <div
                className={`p-4 bg-gradient-to-r ${town.accentColor} text-white relative overflow-hidden flex items-center justify-between`}
              >
                <div className="relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl drop-shadow">{town.bannerImage}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black bg-black/40 text-amber-300 px-1.5 py-0.2 rounded">
                          #{idx + 1}
                        </span>
                        <h3 className="font-serif font-black text-lg text-white drop-shadow">
                          {town.name}
                        </h3>
                      </div>
                      <p className="text-[11px] text-amber-200/90 font-medium">
                        {town.title}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="relative z-10 flex flex-col items-end gap-1">
                  {town.conquered ? (
                    <span className="bg-yellow-400 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow">
                      <CheckCircle2 className="w-3 h-3" /> Conquered
                    </span>
                  ) : !town.unlocked ? (
                    <span className="bg-stone-900 text-stone-300 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-stone-700">
                      <Lock className="w-3 h-3 text-stone-400" /> Lvl {town.requiredLevel}
                    </span>
                  ) : (
                    <span className="bg-emerald-500/90 text-stone-950 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Open Saloon
                    </span>
                  )}
                </div>
              </div>

              {/* Town Card Body Details */}
              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <p className="text-xs text-stone-300 line-clamp-2 leading-relaxed">
                  {town.description}
                </p>

                {/* Stakes and Boss Information */}
                <div className="bg-stone-950/80 rounded-2xl p-2.5 border border-stone-800 flex flex-col gap-1.5 text-xs">
                  <div className="flex items-center justify-between text-stone-400">
                    <span className="flex items-center gap-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" /> Stakes:
                    </span>
                    <span className="font-bold text-amber-300">
                      ${town.smallBlind}/${town.bigBlind} (Buy-in {formatMoney(town.buyIn)})
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-400">
                    <span className="flex items-center gap-1">
                      <Swords className="w-3.5 h-3.5 text-rose-400" /> Town Boss:
                    </span>
                    <span className="font-bold text-stone-200 flex items-center gap-1">
                      <span>{town.bossAvatar}</span>
                      <span>{town.bossName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-stone-400">
                    <span className="flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-blue-400" /> Properties:
                    </span>
                    <span className="font-bold text-blue-300">
                      {getTownPropertiesCount(town.id)} Owned
                    </span>
                  </div>
                </div>

                {/* Play Buttons for Cash, Tournament, & Boss Duel */}
                {town.unlocked ? (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Cash Game Button */}
                      <button
                        id={`play-cash-${town.id}`}
                        onClick={() => {
                          sounds.playClick();
                          onSelectTown(town, 'cash');
                        }}
                        disabled={!canAfford}
                        className="flex items-center justify-center gap-1 py-2 px-2 bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-stone-950 font-bold text-xs rounded-xl shadow-md border border-yellow-300 transition active:scale-95 disabled:opacity-40"
                      >
                        <span>Cash Game</span>
                      </button>

                      {/* Tournament Cup Button */}
                      <button
                        id={`play-tourney-${town.id}`}
                        onClick={() => {
                          sounds.playClick();
                          onSelectTown(town, 'tournament');
                        }}
                        disabled={!canAfford}
                        className="flex items-center justify-center gap-1 py-2 px-2 bg-stone-800 hover:bg-stone-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/40 shadow transition active:scale-95 disabled:opacity-40"
                      >
                        <Trophy className="w-3.5 h-3.5 text-yellow-400" />
                        <span>Cup Tourney</span>
                      </button>
                    </div>

                    {/* Boss Duel Challenge Button */}
                    <button
                      id={`boss-duel-${town.id}`}
                      onClick={() => {
                        sounds.playAllIn();
                        onSelectTown(town, 'boss_duel');
                      }}
                      disabled={!canAfford}
                      className="w-full py-2 px-2 bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 hover:from-rose-800 hover:to-amber-800 text-amber-200 font-black text-xs rounded-xl border border-rose-600/50 shadow-lg flex items-center justify-center gap-1.5 transition active:scale-95 disabled:opacity-40"
                    >
                      <Swords className="w-3.5 h-3.5 text-rose-400" />
                      <span>Heads-Up Duel with {town.bossName}</span>
                    </button>
                  </div>
                ) : (
                  <div className="bg-stone-950/90 py-2.5 px-3 rounded-xl border border-stone-800 text-center text-xs text-stone-400 flex items-center justify-center gap-1.5">
                    <Lock className="w-4 h-4 text-stone-500" />
                    <span>Reach Level {town.requiredLevel} to unlock this saloon</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
