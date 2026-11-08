import React, { useState, useEffect } from 'react';
import {
  X,
  Swords,
  Trophy,
  Users,
  Eye,
  Plus,
  Search,
  Play,
  CheckCircle2,
  Shield,
  Calendar,
  Globe,
  Clock,
  Lock,
  Sparkles,
  ArrowLeft,
  Flame,
  Radio,
  Copy,
  Check,
  Zap,
} from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';
import { subscribeMultiplayerLobby, createRealtimeRoom, joinRealtimeRoom, RealtimeRoomState } from '../services/realtimeMultiplayer';
import { multiplayerSync, MultiplayerRoom, MultiplayerRoomPlayer } from '../utils/multiplayerSync';
import { getVisitorId } from '../services/realtimePresence';

interface MultiplayerScreenProps {
  playerProfile: PlayerProfile;
  onReturnToHome: () => void;
  onJoinTable?: (tableConfig?: any) => void;
}

export const MultiplayerScreen: React.FC<MultiplayerScreenProps> = ({
  playerProfile,
  onReturnToHome,
  onJoinTable,
}) => {
  // Exactly three top-level sections: 'tournaments' | 'traditional' | 'spectator'
  const [activeTab, setActiveTab] = useState<'tournaments' | 'traditional' | 'spectator'>('traditional');

  // Tournaments Subcategory ('official' | 'unofficial')
  const [tournamentSubTab, setTournamentSubTab] = useState<'official' | 'unofficial'>('official');

  // Traditional Subcategory ('browse' | 'quick' | 'create' | 'lobby')
  const [traditionalMode, setTraditionalMode] = useState<'browse' | 'quick' | 'create' | 'lobby'>('browse');

  // Quick Play / Create Table States
  const [isSearchingQuickPlay, setIsSearchingQuickPlay] = useState<boolean>(false);
  const [quickPlayCountdown, setQuickPlayCountdown] = useState<number>(3);
  const [selectedRulesPreset, setSelectedRulesPreset] = useState<string>('Standard 4 Player');
  const [targetScore, setTargetScore] = useState<number>(10);
  const [tableNameInput, setTableNameInput] = useState<string>('The Red Saloon');
  const [isPrivateTable, setIsPrivateTable] = useState<boolean>(false);
  const [tablePassword, setTablePassword] = useState<string>('');
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Active Live Lobby
  const [activeLobbyRoom, setActiveLobbyRoom] = useState<any | null>(null);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);
  const [realtimeRooms, setRealtimeRooms] = useState<RealtimeRoomState[]>([]);

  // Subscribe to live Firestore multiplayer rooms
  useEffect(() => {
    const unsub = subscribeMultiplayerLobby((rooms) => {
      setRealtimeRooms(rooms);
    });
    return () => unsub();
  }, []);

  // Listen to broadcast messages from other tabs/players
  useEffect(() => {
    const unsubscribe = multiplayerSync.subscribe((msg) => {
      if (msg.type === 'PLAYER_JOINED' || msg.type === 'PLAYER_READY' || msg.type === 'SYNC_STATE') {
        if (activeLobbyRoom && msg.roomCode === activeLobbyRoom.code) {
          const updated = multiplayerSync.getRoom(activeLobbyRoom.code);
          if (updated) setActiveLobbyRoom(updated);
        }
        setPublicRooms(multiplayerSync.listPublicRooms());
      } else if (msg.type === 'START_GAME') {
        if (activeLobbyRoom && msg.roomCode === activeLobbyRoom.code) {
          sounds.playWin();
          if (onJoinTable) onJoinTable({ roomCode: activeLobbyRoom.code });
        }
      }
    });

    return () => unsubscribe();
  }, [activeLobbyRoom, onJoinTable]);

  // Handle Quick Play Matchmaking
  const handleStartQuickPlay = () => {
    sounds.playClick();
    setIsSearchingQuickPlay(true);
    let count = 3;
    const timer = setInterval(() => {
      count -= 1;
      setQuickPlayCountdown(count);
      if (count <= 0) {
        clearInterval(timer);
        setIsSearchingQuickPlay(false);
        sounds.playWin();
        if (onJoinTable) onJoinTable({ mode: 'quick_match' });
      }
    }, 1000);
  };

  // Handle Create New Multiplayer Room
  const handleCreateRoom = async () => {
    sounds.playClick();
    const visitorId = getVisitorId();
    const created = await createRealtimeRoom(
      tableNameInput || 'Frontier Saloon Table',
      {
        id: visitorId,
        name: playerProfile.name || 'Euchre Sovereign',
        avatar: '🤠',
      }
    ).catch(() => null);

    if (created) {
      setActiveLobbyRoom(created);
      setTraditionalMode('lobby');
    }
  };

  // Handle Join by Code or from Browser
  const handleJoinRoom = (room: MultiplayerRoom) => {
    sounds.playClick();
    multiplayerSync.setRoom(room.code);

    // If not already in room, add this player
    const existingIndex = room.players.findIndex((p) => p.name === playerProfile.name);
    let updatedPlayers = [...room.players];
    if (existingIndex === -1 && updatedPlayers.length < 4) {
      const nextSeat = updatedPlayers.length;
      updatedPlayers.push({
        id: `p${nextSeat}`,
        name: playerProfile.name || `Player ${nextSeat + 1}`,
        avatar: '🤠',
        seatIndex: nextSeat,
        team: nextSeat % 2 === 0 ? 1 : 2,
        isReady: false,
        isHost: false,
        ping: 28 + Math.floor(Math.random() * 15),
      });
    }

    const updatedRoom: MultiplayerRoom = {
      ...room,
      players: updatedPlayers,
    };

    multiplayerSync.saveRoom(updatedRoom);
    multiplayerSync.broadcast({
      type: 'PLAYER_JOINED',
      roomCode: room.code,
      senderId: playerProfile.name || 'Player',
      senderName: playerProfile.name || 'Player',
      payload: updatedRoom,
    });

    setActiveLobbyRoom(updatedRoom);
    setTraditionalMode('lobby');
  };

  const handleCopyCode = (code: string) => {
    try {
      navigator.clipboard.writeText(code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {}
  };

  // Toggle ready status in room
  const handleToggleReady = () => {
    if (!activeLobbyRoom) return;
    sounds.playClick();
    const updatedPlayers = activeLobbyRoom.players.map((p) => {
      if (p.isHost || p.name === playerProfile.name) {
        return { ...p, isReady: !p.isReady };
      }
      return p;
    });

    const updatedRoom = { ...activeLobbyRoom, players: updatedPlayers };
    multiplayerSync.saveRoom(updatedRoom);
    multiplayerSync.broadcast({
      type: 'PLAYER_READY',
      roomCode: activeLobbyRoom.code,
      senderId: playerProfile.name || 'Player',
      senderName: playerProfile.name || 'Player',
      payload: updatedRoom,
    });
    setActiveLobbyRoom(updatedRoom);
  };

  // Launch the live match
  const handleLaunchGame = () => {
    if (!activeLobbyRoom) return;
    sounds.playWin();
    multiplayerSync.broadcast({
      type: 'START_GAME',
      roomCode: activeLobbyRoom.code,
      senderId: playerProfile.name || 'Host',
      senderName: playerProfile.name || 'Host',
      payload: { roomCode: activeLobbyRoom.code },
    });
    if (onJoinTable) onJoinTable({ roomCode: activeLobbyRoom.code });
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070b16] text-amber-50 flex flex-col select-none overflow-x-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-600/15 via-purple-600/10 to-transparent pointer-events-none blur-3xl" />

      {/* TOP WINDOW HEADER */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 border-b border-indigo-500/30 bg-gradient-to-r from-stone-950 via-[#0e142e] to-stone-950 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onReturnToHome();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 transition-all active:scale-95 shadow-md group cursor-pointer"
            title="Return to Main Menu"
          >
            <ArrowLeft className="w-4 h-4 text-indigo-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider">Home Hub</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-800 border-2 border-indigo-300 flex items-center justify-center text-2xl shadow-lg">
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  REAL-TIME MULTIPLAYER SALOON
                </span>
                <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> 1,482 PLAYERS ONLINE
                </span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black font-serif tracking-wide text-indigo-100 drop-shadow">
                ONLINE SALOONS & TOURNAMENTS
              </h1>
            </div>
          </div>
        </div>

        {/* Player Profile Badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-[#091224] border border-indigo-500/30 px-3.5 py-1.5 rounded-2xl text-xs shadow-inner">
            <span className="text-amber-400 font-black">💰 {playerProfile.chips.toLocaleString()}</span>
            <span className="text-stone-500">•</span>
            <span className="text-yellow-300 font-bold">👑 {playerProfile.sovereigns || 0} Sov</span>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onReturnToHome();
            }}
            className="w-10 h-10 rounded-full bg-stone-900 hover:bg-rose-900/80 text-stone-300 hover:text-white border border-stone-700/80 flex items-center justify-center transition active:scale-95 shadow-md cursor-pointer"
            title="Close Window"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>
      </header>

      {/* THREE TOP-LEVEL TABS */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        <div className="grid grid-cols-3 gap-3 p-1.5 bg-[#0a0f22] border-2 border-indigo-900/60 rounded-3xl shadow-xl">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('traditional');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-md cursor-pointer ${
              activeTab === 'traditional'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black border border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-[1.02]'
                : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Live Multiplayer</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tournaments');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-md cursor-pointer ${
              activeTab === 'tournaments'
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-stone-950 font-black border border-amber-300 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-[1.02]'
                : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Tournaments</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('spectator');
            }}
            className={`py-3 px-4 rounded-2xl font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2.5 transition shadow-md cursor-pointer ${
              activeTab === 'spectator'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black border border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-[1.02]'
                : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
            }`}
          >
            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Spectator</span>
          </button>
        </div>
      </div>

      {/* MAIN BODY CONTENT */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6">
        {/* ========================================================== */}
        {/* SECTION 1: TRADITIONAL / REAL MULTIPLAYER LOBBY            */}
        {/* ========================================================== */}
        {activeTab === 'traditional' && (
          <div className="space-y-6">
            {/* Sub-navigation for Traditional */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-[#0c1326] border-2 border-indigo-500/30 p-2 rounded-3xl shadow-xl w-fit">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTraditionalMode('browse');
                  }}
                  className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition cursor-pointer ${
                    traditionalMode === 'browse'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Browse Public Saloons
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTraditionalMode('quick');
                  }}
                  className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition cursor-pointer ${
                    traditionalMode === 'quick'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Quick Matchmaking
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTraditionalMode('create');
                  }}
                  className={`px-5 py-2 rounded-2xl text-xs font-black uppercase transition cursor-pointer ${
                    traditionalMode === 'create'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Create Custom Room
                </button>
              </div>

              {/* Direct Code Join Input */}
              <div className="flex items-center gap-2 bg-[#0c1326] border border-indigo-500/40 p-1.5 rounded-2xl">
                <input
                  type="text"
                  placeholder="Enter Room Code (e.g. TEXAS-409)"
                  value={joinCodeInput}
                  onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                  className="bg-transparent text-xs text-white px-3 py-1.5 outline-none font-mono tracking-wider w-44 uppercase"
                />
                <button
                  onClick={() => {
                    if (joinCodeInput.trim()) {
                      const room = multiplayerSync.getRoom(joinCodeInput.trim());
                      if (room) {
                        handleJoinRoom(room);
                      } else {
                        // Create room with that code
                        const newRoom: MultiplayerRoom = {
                          code: joinCodeInput.trim(),
                          name: `Saloon Room ${joinCodeInput.trim()}`,
                          hostId: playerProfile.name || 'Host',
                          players: [
                            {
                              id: 'p0',
                              name: playerProfile.name || 'You',
                              avatar: '🤠',
                              seatIndex: 0,
                              team: 1,
                              isReady: true,
                              isHost: true,
                              ping: 25,
                            },
                          ],
                          maxPlayers: 4,
                          targetScore: 10,
                          rulesPreset: 'Standard 4 Player',
                          isPrivate: false,
                          status: 'lobby',
                          createdAt: Date.now(),
                        };
                        multiplayerSync.saveRoom(newRoom);
                        handleJoinRoom(newRoom);
                      }
                    }
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs rounded-xl transition cursor-pointer"
                >
                  Join Code
                </button>
              </div>
            </div>

            {/* 1. LOBBY VIEW (When inside a live multiplayer room) */}
            {traditionalMode === 'lobby' && activeLobbyRoom && (
              <div className="bg-[#0c1326] border-2 border-indigo-500/50 rounded-3xl p-6 shadow-2xl space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-indigo-500/30 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE MULTIPLAYER LOBBY
                      </span>
                      <span className="text-xs text-stone-400">Target: {activeLobbyRoom.targetScore} Pts</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black text-white mt-1">{activeLobbyRoom.name}</h2>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-stone-900 border border-stone-700 px-3.5 py-2 rounded-2xl flex items-center gap-2 font-mono text-xs">
                      <span className="text-stone-400">ROOM CODE:</span>
                      <strong className="text-amber-300 text-sm">{activeLobbyRoom.code}</strong>
                      <button
                        onClick={() => handleCopyCode(activeLobbyRoom.code)}
                        className="p-1 hover:bg-stone-800 rounded text-stone-300 transition"
                        title="Copy Room Code"
                      >
                        {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <button
                      onClick={() => setTraditionalMode('browse')}
                      className="px-3.5 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold rounded-2xl transition cursor-pointer"
                    >
                      Leave Lobby
                    </button>
                  </div>
                </div>

                {/* 4 Seated Player Slots */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { seat: 0, label: 'Seat 1: South (Team 1 - Host)', defaultTeam: 1 },
                    { seat: 1, label: 'Seat 2: West (Team 2)', defaultTeam: 2 },
                    { seat: 2, label: 'Seat 3: North (Team 1 - Partner)', defaultTeam: 1 },
                    { seat: 3, label: 'Seat 4: East (Team 2)', defaultTeam: 2 },
                  ].map(({ seat, label, defaultTeam }) => {
                    const player = activeLobbyRoom.players.find((p) => p.seatIndex === seat);

                    return (
                      <div
                        key={seat}
                        className={`rounded-2xl p-4 border-2 transition flex flex-col justify-between min-h-[160px] ${
                          player
                            ? 'bg-stone-900/90 border-indigo-500/60 shadow-lg'
                            : 'bg-stone-950/60 border-dashed border-stone-800 text-stone-500'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                          <span className={defaultTeam === 1 ? 'text-amber-300' : 'text-purple-300'}>
                            {label}
                          </span>
                          {player && (
                            <span className="text-cyan-400 font-mono flex items-center gap-1">
                              📶 {player.ping}ms
                            </span>
                          )}
                        </div>

                        {player ? (
                          <div className="flex items-center gap-3 my-auto">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-400 flex items-center justify-center text-2xl shadow">
                              {player.avatar}
                            </div>
                            <div>
                              <div className="font-black text-white text-sm flex items-center gap-1.5">
                                {player.name}
                                {player.isHost && (
                                  <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 rounded border border-amber-400/40">
                                    HOST
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-400">
                                Team {player.team} • {player.isReady ? '✅ READY' : '⏳ Waiting...'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center my-auto space-y-1">
                            <Users className="w-6 h-6 mx-auto text-stone-700" />
                            <div className="text-xs text-stone-500">Empty Slot</div>
                            <div className="text-[10px] text-stone-600">Open another tab with room code to join!</div>
                          </div>
                        )}

                        <div className="pt-2 border-t border-stone-800/60 flex items-center justify-between text-[11px]">
                          {player ? (
                            <span className={player.isReady ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                              {player.isReady ? 'Ready for Hand' : 'Not Ready'}
                            </span>
                          ) : (
                            <span className="text-stone-600 font-mono">Waiting for player...</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Lobby Control Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-indigo-500/30">
                  <div className="text-xs text-stone-400 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Invite players with Room Code <strong className="text-amber-300 font-mono">{activeLobbyRoom.code}</strong>. Real multi-tab synchronized state active!</span>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleToggleReady}
                      className="flex-1 sm:w-44 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-2xl border border-stone-700 transition cursor-pointer"
                    >
                      Toggle Ready
                    </button>
                    <button
                      onClick={handleLaunchGame}
                      className="flex-1 sm:w-56 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_5px_20px_rgba(16,185,129,0.5)] transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Launch Saloon Table</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 2. BROWSE PUBLIC TABLES */}
            {traditionalMode === 'browse' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-stone-400 px-2">
                  <span>Available Public Saloon Tables in Texas Territory</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Multi-Tab Sync Active
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {publicRooms.map((room, idx) => (
                    <div
                      key={idx}
                      className="bg-stone-900/90 border border-stone-800 hover:border-indigo-500/60 p-5 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl transition"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-base text-white">{room.name}</span>
                          <span className="text-xs text-amber-300 font-mono bg-stone-950 px-2.5 py-0.5 rounded-lg border border-stone-800">
                            #{room.code}
                          </span>
                          <span className="text-xs text-stone-400">Host: {room.hostId}</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-stone-300">
                          <span>Rules: <strong className="text-amber-300">{room.rulesPreset}</strong></span>
                          <span>Target: <strong className="text-indigo-300">{room.targetScore} Pts</strong></span>
                          <span>Ping: <strong className="text-cyan-400">24ms</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-900/50 text-emerald-300">
                          {room.players.length} / {room.maxPlayers} Players
                        </span>
                        <button
                          onClick={() => handleJoinRoom(room)}
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow transition cursor-pointer"
                        >
                          Join Saloon Table
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. QUICK MATCHMAKING */}
            {traditionalMode === 'quick' && (
              <div className="bg-[#0c1326] border-2 border-indigo-500/40 rounded-3xl p-8 text-center space-y-6 max-w-xl mx-auto shadow-2xl">
                <div className="w-20 h-20 rounded-3xl bg-indigo-600/30 border border-indigo-400/50 flex items-center justify-center text-4xl mx-auto shadow-inner">
                  ⚡
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Instant Saloon Matchmaking</h3>
                  <p className="text-xs text-stone-300 mt-2 max-w-md mx-auto leading-relaxed">
                    Auto-match with 3 players of similar rank in standard 4-player Euchre. Fast hands, active dealer rotation.
                  </p>
                </div>

                {!isSearchingQuickPlay ? (
                  <button
                    onClick={handleStartQuickPlay}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.6)] transition cursor-pointer active:scale-95"
                  >
                    FIND MATCH NOW
                  </button>
                ) : (
                  <div className="space-y-4 p-4 bg-stone-900/90 rounded-2xl border border-indigo-500/50 animate-pulse">
                    <div className="text-sm font-bold text-amber-300">
                      SEARCHING FOR SALOON PLAYERS... ({quickPlayCountdown}s)
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                      <span>Matching South, West, North, East seats...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. CREATE CUSTOM ROOM */}
            {traditionalMode === 'create' && (
              <div className="bg-[#0c1326] border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 space-y-5 max-w-2xl mx-auto shadow-2xl text-xs">
                <h3 className="text-base font-black text-indigo-300 uppercase tracking-wide border-b border-stone-800 pb-3">
                  Create Custom Multiplayer Room
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-bold">Room Name</label>
                    <input
                      type="text"
                      value={tableNameInput}
                      onChange={(e) => setTableNameInput(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-white px-3.5 py-2.5 rounded-2xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-bold">Rules Preset</label>
                    <select
                      value={selectedRulesPreset}
                      onChange={(e) => setSelectedRulesPreset(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-800 text-amber-200 px-3.5 py-2.5 rounded-2xl focus:outline-none cursor-pointer"
                    >
                      <option value="Standard 4 Player">Standard 4-Player Partnership</option>
                      <option value="Stick the Dealer">Stick the Dealer</option>
                      <option value="Canadian Loner">Canadian Loner</option>
                      <option value="Joker Euchre">Joker Euchre</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-bold">Target Score</label>
                    <select
                      value={targetScore}
                      onChange={(e) => setTargetScore(Number(e.target.value))}
                      className="w-full bg-stone-950 border border-stone-800 text-amber-200 px-3.5 py-2.5 rounded-2xl focus:outline-none cursor-pointer"
                    >
                      <option value={5}>5 Points (Sprint)</option>
                      <option value={7}>7 Points (Casual)</option>
                      <option value={10}>10 Points (Standard)</option>
                      <option value={15}>15 Points (Marathon)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-stone-300 font-bold">Privacy</label>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer text-stone-200">
                        <input
                          type="checkbox"
                          checked={isPrivateTable}
                          onChange={(e) => setIsPrivateTable(e.target.checked)}
                          className="accent-indigo-600 w-4 h-4 rounded"
                        />
                        <span>Password Protected</span>
                      </label>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleCreateRoom}
                  className="w-full mt-4 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_8px_30px_rgba(99,102,241,0.6)] transition cursor-pointer active:scale-95"
                >
                  CREATE ROOM & OPEN LOBBY
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* SECTION 2: TOURNAMENTS                                     */}
        {/* ========================================================== */}
        {activeTab === 'tournaments' && (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-4">
              <div className="flex items-center gap-2 bg-[#0c1326] border-2 border-amber-500/30 p-1.5 rounded-2xl">
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTournamentSubTab('official');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                    tournamentSubTab === 'official'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Official Sanctioned
                </button>
                <button
                  onClick={() => {
                    sounds.playClick();
                    setTournamentSubTab('unofficial');
                  }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase transition cursor-pointer ${
                    tournamentSubTab === 'unofficial'
                      ? 'bg-amber-400 text-stone-950 shadow-md'
                      : 'text-stone-400 hover:text-white'
                  }`}
                >
                  Unofficial Community
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-br from-stone-900 via-[#10172e] to-stone-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-amber-400/20 text-amber-300 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-amber-400/40">
                      OFFICIAL • SINGLE ELIMINATION
                    </span>
                    <span className="text-xs text-stone-300 flex items-center gap-1.5 font-mono bg-stone-950/80 px-2.5 py-1 rounded-lg border border-stone-800">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> Starts in 01:42:18
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-black font-serif text-white">
                    EUCHRE WEEKLY OPEN CHAMPIONSHIP
                  </h3>
                  <p className="text-xs text-stone-300">
                    Standard 4-Player Partnership. 128 registered competitors battle across 7 rounds for the Weekly Open Trophy.
                  </p>
                </div>

                <div className="flex sm:flex-col items-center gap-3 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      sounds.playWin();
                      if (onJoinTable) onJoinTable({ mode: 'tournament' });
                    }}
                    className="flex-1 sm:w-44 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-2xl shadow-[0_5px_20px_rgba(245,158,11,0.5)] transition active:scale-95 cursor-pointer"
                  >
                    Enter Match Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================== */}
        {/* SECTION 3: SPECTATOR                                       */}
        {/* ========================================================== */}
        {activeTab === 'spectator' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-400 px-2">
              <span>Featured Live Saloon Matches & Championship Broadcasts</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> 3,420 Viewers Spectating Live
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                {
                  id: 'match_1',
                  title: 'Euchre Open Semi-Final #2',
                  players: 'The Dealer & Red Queen vs Blue Ace & The Strategist',
                  score: '7 - 6',
                  hand: 'Hand 9 (Trump: Spades ♠)',
                  viewers: '1,284 Watching',
                },
                {
                  id: 'match_2',
                  title: 'High Stakes Saloon Table #4',
                  players: 'Card Shark & Lone Star vs Doc Holliday & Wyatt',
                  score: '4 - 8',
                  hand: 'Hand 6 (Trump: Hearts ♥)',
                  viewers: '812 Watching',
                },
              ].map((m) => (
                <div
                  key={m.id}
                  className="bg-[#0c1326] border-2 border-stone-800 hover:border-emerald-500/60 p-5 rounded-3xl shadow-xl flex flex-col justify-between space-y-4 transition group"
                >
                  <div className="flex items-center justify-between">
                    <span className="bg-rose-900/80 text-rose-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-rose-500/50 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" /> LIVE BROADCAST
                    </span>
                    <span className="text-xs text-stone-400 font-mono">{m.viewers}</span>
                  </div>

                  <div>
                    <h4 className="font-black text-base text-white group-hover:text-amber-200 transition">{m.title}</h4>
                    <p className="text-xs text-amber-300/90 font-medium mt-1">{m.players}</p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-stone-800 text-xs">
                    <div>
                      Score: <strong className="text-emerald-400 text-sm">{m.score}</strong>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        if (onJoinTable) onJoinTable({ mode: 'spectator', matchId: m.id });
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" /> Watch Match
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
