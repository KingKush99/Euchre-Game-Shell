import React, { useState } from 'react';
import { X, Swords, Trophy, Users, Eye, Plus, Search, Play, CheckCircle2, Shield, Calendar, Globe, Clock, Lock, Sparkles } from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';

interface MultiplayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
}

export const MultiplayerModal: React.FC<MultiplayerModalProps> = ({ isOpen, onClose, playerProfile }) => {
  // Exactly three top-level sections: 'tournaments' | 'traditional' | 'spectator'
  const [activeTab, setActiveTab] = useState<'tournaments' | 'traditional' | 'spectator'>('tournaments');

  // Tournaments Subcategory ('official' | 'unofficial')
  const [tournamentSubTab, setTournamentSubTab] = useState<'official' | 'unofficial'>('official');

  // Traditional Subcategory ('quick' | 'create' | 'browse' | 'lobby')
  const [traditionalMode, setTraditionalMode] = useState<'quick' | 'create' | 'browse' | 'lobby'>('browse');

  // Quick Play / Create Table States
  const [isSearchingQuickPlay, setIsSearchingQuickPlay] = useState<boolean>(false);
  const [selectedRulesPreset, setSelectedRulesPreset] = useState<string>('Standard 4 Player');
  const [targetScore, setTargetScore] = useState<number>(10);
  const [tableNameInput, setTableNameInput] = useState<string>("The Red Saloon");
  const [isPrivateTable, setIsPrivateTable] = useState<boolean>(false);
  const [tablePassword, setTablePassword] = useState<string>('');

  // Spectator States
  const [watchingMatchId, setWatchingMatchId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => {
      setToastMsg((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      {/* Outer Shell - Standardized Dimensions */}
      <div
        style={{
          width: 'min(1100px, calc(100vw - 48px))',
          height: 'min(780px, calc(100vh - 48px))',
        }}
        className="relative bg-[#0b101e] border-2 border-indigo-600/60 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-amber-50 flex flex-col overflow-hidden shrink-0"
      >
        {/* Felt Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

        {/* TOP HEADER */}
        <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-indigo-900/60 bg-gradient-to-r from-stone-950 via-[#0e1328] to-stone-950 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 border-2 border-indigo-300 flex items-center justify-center text-2xl shadow-lg">
              ⚔️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif tracking-wide text-indigo-200 drop-shadow">
                MULTIPLAYER SALOON
              </h2>
              <p className="text-xs text-indigo-300/80 font-medium">
                Compete in official tournaments, join traditional online tables, or spectate live matches.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition active:scale-90 cursor-pointer"
            title="Close Multiplayer"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* THREE TOP-LEVEL TABS: TOURNAMENTS | TRADITIONAL | SPECTATOR */}
        <div className="relative z-10 grid grid-cols-3 gap-3 px-6 py-3 bg-stone-950/90 border-b border-indigo-900/40">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tournaments');
            }}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                : 'bg-stone-900/90 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>Tournaments</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('traditional');
            }}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
              activeTab === 'traditional'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                : 'bg-stone-900/90 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Users className="w-4 h-4 text-cyan-400" />
            <span>Traditional</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('spectator');
            }}
            className={`py-2.5 px-4 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-lg cursor-pointer ${
              activeTab === 'spectator'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-2 border-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                : 'bg-stone-900/90 text-stone-400 hover:text-white border border-stone-800'
            }`}
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span>Spectator</span>
          </button>
        </div>

        {/* MAIN BODY CONTENT AREA */}
        <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          
          {/* ========================================================== */}
          {/* SECTION 1: TOURNAMENTS (Official & Unofficial)             */}
          {/* ========================================================== */}
          {activeTab === 'tournaments' && (
            <div className="space-y-5">
              {/* Official / Unofficial Subcategory Switcher */}
              <div className="flex items-center justify-between bg-stone-900/90 border border-indigo-500/30 p-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTournamentSubTab('official');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                      tournamentSubTab === 'official'
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Official Tournaments
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTournamentSubTab('unofficial');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                      tournamentSubTab === 'unofficial'
                        ? 'bg-amber-500 text-stone-950 shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Unofficial Community
                  </button>
                </div>

                <div className="text-xs text-indigo-300 font-medium px-3">
                  {tournamentSubTab === 'official' ? 'Sanctioned Championship Series' : 'Community Hosted Saloon Events'}
                </div>
              </div>

              {tournamentSubTab === 'official' ? (
                /* OFFICIAL TOURNAMENTS LIST */
                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-stone-900 via-[#10172e] to-stone-950 border-2 border-amber-500/50 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-400/40">
                          OFFICIAL • SINGLE ELIMINATION
                        </span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" /> Starts in 01:42:18
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-serif text-white">EUCHRE WEEKLY OPEN CHAMPIONSHIP</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-300 pt-1">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Players:</span>
                          <strong className="text-amber-200">128 / 128 (Full)</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Entry:</span>
                          <strong className="text-emerald-400">Free</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Prize Pool:</span>
                          <strong className="text-amber-300">25,000 Coins + Card Back</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Skill Req:</span>
                          <strong className="text-indigo-300">Novice+</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => sounds.playClick()}
                        className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer"
                      >
                        View Bracket
                      </button>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          showToast("Registered successfully for Euchre Weekly Open!", 'success');
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-900/90 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-400/40">
                          OFFICIAL • ROUND ROBIN
                        </span>
                        <span className="text-xs text-stone-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-400" /> Starts in 06:15:00
                        </span>
                      </div>
                      <h3 className="text-lg font-black font-serif text-white">GRAND SALONIER MASTERS CUP</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-stone-300 pt-1">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Players:</span>
                          <strong className="text-indigo-200">32 / 64 Players</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Entry:</span>
                          <strong className="text-amber-400">500 Coins</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Prize Pool:</span>
                          <strong className="text-amber-300">50,000 Sovereigns</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Skill Req:</span>
                          <strong className="text-purple-300">Pro+</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => sounds.playClick()}
                        className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl border border-stone-700 transition cursor-pointer"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          showToast("Registered for Grand Salonier Masters Cup!", 'success');
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow cursor-pointer"
                      >
                        Register
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* UNOFFICIAL COMMUNITY TOURNAMENTS */
                <div className="space-y-4">
                  <div className="bg-stone-900/90 border border-stone-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-purple-500/20 text-purple-300 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-purple-400/40">
                          PRIVATE • STICK THE DEALER
                        </span>
                        <span className="text-xs text-stone-400">Hosted by CardKing92</span>
                      </div>
                      <h3 className="text-lg font-black font-serif text-white">FRIDAY NIGHT SALOON DUELS</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-stone-300 pt-1">
                        <div>
                          <span className="text-stone-400 block text-[10px]">Players:</span>
                          <strong className="text-purple-200">12 / 16</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Target Score:</span>
                          <strong className="text-amber-300">First to 10</strong>
                        </div>
                        <div>
                          <span className="text-stone-400 block text-[10px]">Password:</span>
                          <strong className="text-rose-400 flex items-center gap-1"><Lock className="w-3 h-3" /> Required</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          showToast("Joined Friday Night Saloon Duels lobby!", 'success');
                        }}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-xs uppercase rounded-xl shadow cursor-pointer"
                      >
                        Join Table
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* SECTION 2: TRADITIONAL (Quick Play, Create Table, Browse)  */}
          {/* ========================================================== */}
          {activeTab === 'traditional' && (
            <div className="space-y-5">
              {/* Sub-navigation for Traditional */}
              <div className="flex items-center justify-between bg-stone-900/90 border border-indigo-500/30 p-2 rounded-2xl">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTraditionalMode('browse');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                      traditionalMode === 'browse'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Browse Tables
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTraditionalMode('quick');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                      traditionalMode === 'quick'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Quick Play
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setTraditionalMode('create');
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                      traditionalMode === 'create'
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Create Table
                  </button>
                </div>
              </div>

              {traditionalMode === 'browse' && (
                /* BROWSE TABLES */
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                    <span>Active Public Saloon Tables</span>
                    <span>42ms average ping</span>
                  </div>

                  <div className="space-y-2.5">
                    {[
                      { name: 'THE RED SALOON', host: 'CardKing92', players: '3 / 4', rules: 'Standard', score: '10', ping: '35ms' },
                      { name: 'GOLD RUSH TABLE', host: 'WildBill', players: '2 / 4', rules: 'Stick the Dealer', score: '10', ping: '42ms' },
                      { name: 'PRAIRIE OAKS', host: 'CalamityJane', players: '4 / 4', rules: 'Canadian Loner', score: '7', ping: '68ms', full: true },
                    ].map((t, idx) => (
                      <div
                        key={idx}
                        className="bg-stone-900/90 border border-stone-800 p-4 rounded-2xl flex items-center justify-between shadow-md"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-white">{t.name}</span>
                            <span className="text-[10px] text-stone-400">Host: {t.host}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-stone-300">
                            <span>Rules: <strong className="text-amber-300">{t.rules}</strong></span>
                            <span>Target: <strong className="text-indigo-300">{t.score} Pts</strong></span>
                            <span>Ping: <strong className="text-emerald-400">{t.ping}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${t.full ? 'bg-rose-900/50 text-rose-300' : 'bg-emerald-900/50 text-emerald-300'}`}>
                            {t.players} Players
                          </span>
                          <button
                            onClick={() => {
                              sounds.playClick();
                              showToast(`Joining table: ${t.name}`, 'info');
                            }}
                            disabled={t.full}
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-black text-xs uppercase rounded-xl shadow transition cursor-pointer"
                          >
                            {t.full ? 'Full' : 'Join'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {traditionalMode === 'quick' && (
                /* QUICK PLAY */
                <div className="bg-stone-900/90 border border-indigo-500/40 rounded-2xl p-6 text-center space-y-5 max-w-lg mx-auto shadow-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-3xl mx-auto shadow-inner">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">Quick Matchmaking</h3>
                    <p className="text-xs text-stone-300 mt-1">
                      Instantly match with players of similar rank for a standard Euchre game.
                    </p>
                  </div>

                  {!isSearchingQuickPlay ? (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setIsSearchingQuickPlay(true);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition cursor-pointer"
                    >
                      FIND MATCH NOW
                    </button>
                  ) : (
                    <div className="space-y-4 animate-in fade-in">
                      <div className="text-sm font-bold text-amber-300 animate-pulse">
                        SEARCHING FOR PLAYERS... (Est. wait 00:14)
                      </div>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setIsSearchingQuickPlay(false);
                        }}
                        className="px-6 py-2 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                      >
                        Cancel Search
                      </button>
                    </div>
                  )}
                </div>
              )}

              {traditionalMode === 'create' && (
                /* CREATE TABLE */
                <div className="bg-stone-900/90 border border-indigo-500/40 rounded-2xl p-6 space-y-4 max-w-xl mx-auto shadow-2xl text-xs">
                  <h3 className="text-sm font-black text-indigo-300 uppercase tracking-wide border-b border-stone-800 pb-2">
                    Create Custom Multiplayer Table
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-stone-400 font-bold">Table Name</label>
                      <input
                        type="text"
                        value={tableNameInput}
                        onChange={(e) => setTableNameInput(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white px-3 py-2 rounded-xl focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-400 font-bold">Rules Preset</label>
                      <select
                        value={selectedRulesPreset}
                        onChange={(e) => setSelectedRulesPreset(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-amber-200 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value="Standard 4 Player">Standard 4-Player Partnership</option>
                        <option value="Stick the Dealer">Stick the Dealer</option>
                        <option value="Canadian Loner">Canadian Loner</option>
                        <option value="Joker Euchre">Joker Euchre</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-400 font-bold">Target Score</label>
                      <select
                        value={targetScore}
                        onChange={(e) => setTargetScore(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-800 text-amber-200 px-3 py-2 rounded-xl focus:outline-none cursor-pointer"
                      >
                        <option value={5}>5 Points</option>
                        <option value={7}>7 Points</option>
                        <option value={10}>10 Points</option>
                        <option value={15}>15 Points</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-stone-400 font-bold">Table Privacy</label>
                      <div className="flex items-center gap-3 pt-1">
                        <label className="flex items-center gap-1.5 cursor-pointer text-stone-200">
                          <input
                            type="checkbox"
                            checked={isPrivateTable}
                            onChange={(e) => setIsPrivateTable(e.target.checked)}
                            className="accent-indigo-600 rounded"
                          />
                          <span>Password Protected</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {isPrivateTable && (
                    <div className="space-y-1 pt-1">
                      <label className="text-stone-400 font-bold">Table Password</label>
                      <input
                        type="password"
                        placeholder="Enter password..."
                        value={tablePassword}
                        onChange={(e) => setTablePassword(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 text-white px-3 py-2 rounded-xl focus:outline-none"
                      />
                    </div>
                  )}

                  <button
                    onClick={() => {
                      sounds.playClick();
                      showToast(`Created table: ${tableNameInput}! Entering lobby...`, 'success');
                    }}
                    className="w-full mt-3 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black uppercase tracking-wider rounded-xl shadow cursor-pointer"
                  >
                    CREATE TABLE & ENTER LOBBY
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================== */}
          {/* SECTION 3: SPECTATOR (Live Games, Tournaments, Friends)    */}
          {/* ========================================================== */}
          {activeTab === 'spectator' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-xs text-stone-400 px-1">
                <span>Featured Live Saloon Matches & Tournaments</span>
                <span className="text-emerald-400 font-bold">● 3,420 Viewers Online</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    id: 'match_1',
                    title: 'Championship Semi-Final #2',
                    players: 'DealerAce & RedQueen vs BlueAce & CardShark',
                    score: '7 - 6',
                    hand: 'Hand 9',
                    viewers: '1,284 Watching',
                    type: 'Tournament',
                  },
                  {
                    id: 'match_2',
                    title: 'High Stakes Saloon Table',
                    players: 'WildBill & CalamityJane vs DocHoliday & Wyatt',
                    score: '4 - 8',
                    hand: 'Hand 6',
                    viewers: '512 Watching',
                    type: 'Traditional',
                  },
                ].map((m) => (
                  <div
                    key={m.id}
                    className="bg-stone-900/90 border border-stone-800 hover:border-emerald-500/50 p-4 rounded-2xl shadow-xl flex flex-col justify-between space-y-3 transition"
                  >
                    <div className="flex items-center justify-between">
                      <span className="bg-rose-900/80 text-rose-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-rose-500/50 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" /> LIVE
                      </span>
                      <span className="text-[10px] text-stone-400">{m.viewers}</span>
                    </div>

                    <div>
                      <h4 className="font-black text-sm text-white">{m.title}</h4>
                      <p className="text-xs text-amber-300 font-medium mt-1">{m.players}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs">
                      <div>
                        Score: <strong className="text-emerald-400">{m.score}</strong> ({m.hand})
                      </div>
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setWatchingMatchId(m.id);
                          showToast(`Now spectating ${m.title}!`, 'info');
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-black text-xs uppercase rounded-xl shadow transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" /> Watch
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* In-Modal Toast Notification Banner */}
        {toastMsg && (
          <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-2 rounded-2xl shadow-2xl text-xs font-black flex items-center gap-2 border animate-in fade-in slide-in-from-bottom-2 ${
              toastMsg.type === 'success'
                ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/80'
                : toastMsg.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/80'
                : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/80'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{toastMsg.text}</span>
          </div>
        )}
      </div>
    </div>
  );
};

