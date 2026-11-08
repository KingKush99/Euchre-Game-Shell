import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Pause,
  Shuffle,
  SkipBack,
  SkipForward,
  Repeat,
  Heart,
  MoreHorizontal,
  Search,
  Volume2,
  VolumeX,
  ListMusic,
  Download,
  Check,
  Sparkles,
  Sliders,
  Clock,
  ArrowUpDown,
  Upload,
  Music,
  Trash2,
  FileAudio,
  CheckCircle2,
  Disc,
} from 'lucide-react';
import { GameTrack, euchreAlbumCover } from '../types/music';
import { gameAudio, PlaybackState } from '../utils/gameAudioEngine';
import { sounds } from '../utils/soundEffects';

interface CampaignMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampaignMusicModal: React.FC<CampaignMusicModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [playback, setPlayback] = useState<PlaybackState>(gameAudio.getState());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'number' | 'title' | 'duration'>('number');
  const [showThreeDotsMenu, setShowThreeDotsMenu] = useState<boolean>(false);
  const [activeTrackMenuId, setActiveTrackMenuId] = useState<string | null>(null);
  const [showQueueDrawer, setShowQueueDrawer] = useState<boolean>(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [attachingTrackId, setAttachingTrackId] = useState<string | null>(null);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubValueSec, setScrubValueSec] = useState<number>(0);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState<boolean>(false);

  const playlistHeaderRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = gameAudio.subscribe((state) => {
      setPlayback(state);
      if (!isScrubbing) {
        setScrubValueSec(state.currentTimeSec);
      }
    });
    return () => unsubscribe();
  }, [isScrubbing]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  if (!isOpen) return null;

  const currentTrack = playback.currentTrack;

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Filter & Sort tracks from allTracks (base playlist + custom tracks)
  let displayedTracks = playback.allTracks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.album.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.lyricsPreview && t.lyricsPreview.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.townAssociation && t.townAssociation.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedCategory === 'favorites') {
      return playback.likedTrackIds.has(t.id);
    }
    if (selectedCategory === 'custom') {
      return !!t.isCustom;
    }
    if (selectedCategory === 'main') {
      return t.section === 'Main';
    }
    if (selectedCategory === 'gameplay') {
      return t.section === 'Gameplay' || t.category === 'gameplay';
    }
    if (selectedCategory === 'tension_showdown') {
      return t.section === 'Tension' || t.section === 'Showdown';
    }
    if (selectedCategory === 'championship') {
      return t.section === 'Championship';
    }
    if (selectedCategory === 'menu') {
      return t.section === 'Menu' || t.category === 'saloon';
    }
    return true;
  });

  if (sortBy === 'title') {
    displayedTracks = [...displayedTracks].sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortBy === 'duration') {
    displayedTracks = [...displayedTracks].sort((a, b) => b.durationSec - a.durationSec);
  } else {
    displayedTracks = [...displayedTracks].sort((a, b) => a.trackNumber - b.trackNumber);
  }

  const handlePlayTrack = (track: GameTrack) => {
    sounds.playClick();
    gameAudio.playTrack(track.id);
  };

  const handleTogglePlay = () => {
    sounds.playClick();
    gameAudio.togglePlay();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubValueSec(val);
    gameAudio.seek(val);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    gameAudio.setVolume(val);
  };

  const handleToggleFavorite = (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    gameAudio.toggleFavorite(trackId);
    const isLiked = !playback.likedTrackIds.has(trackId);
    showToast(isLiked ? '❤️ Added to Liked Songs' : 'Removed from Liked Songs');
  };

  const handleToggleDownload = (trackId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sounds.playClick();
    gameAudio.toggleDownload(trackId);
    const isDownloaded = !playback.downloadedTrackIds.has(trackId);
    showToast(isDownloaded ? '💾 Saved to Offline Persistent Cache' : 'Removed download');
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const result = await gameAudio.uploadAndMatchFiles(files);

    if (result.matchedCount > 0 && result.createdCount > 0) {
      showToast(`✨ Matched ${result.matchedCount} track(s) & imported ${result.createdCount} new custom track(s)!`);
      setShowImportModal(false);
    } else if (result.matchedCount > 0) {
      showToast(`✨ Successfully matched & loaded ${result.matchedCount} audio track(s) to playlist!`);
      setShowImportModal(false);
    } else if (result.createdCount > 0) {
      showToast(`🎵 Successfully imported ${result.createdCount} track(s) to playlist!`);
      setShowImportModal(false);
    } else {
      showToast('⚠️ Please upload audio files (.mp3, .wav, .m4a, .ogg)');
    }
  };

  const handleAttachAudioFile = async (file: File) => {
    if (!attachingTrackId) return;
    await gameAudio.attachAudioToTrack(attachingTrackId, file);
    showToast('✨ Audio file attached! Saved in persistent database.');
    setAttachingTrackId(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDraggingOver(true);
      }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={handleDrop}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-8 z-50 bg-[#1db954] text-stone-950 px-4 py-2.5 rounded-full font-black text-xs shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2 border border-emerald-300">
          <Sparkles className="w-4 h-4" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        multiple
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleFileUpload(e.target.files);
          }
        }}
      />
      <input
        type="file"
        ref={attachInputRef}
        accept="audio/*,.mp3,.wav,.m4a,.ogg,.aac"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleAttachAudioFile(e.target.files[0]);
          }
        }}
      />

      {/* Main Container matching SettingsModal dimensions */}
      <div
        style={{
          width: 'min(1080px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 48px))',
        }}
        className={`relative bg-[#121212] border-2 ${
          isDraggingOver ? 'border-[#1db954] ring-4 ring-[#1db954]/30' : 'border-stone-700/80'
        } rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] text-stone-100 flex flex-col overflow-hidden shrink-0 transition-all`}
      >
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-40 w-9 h-9 rounded-full bg-black/60 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition active:scale-95 shadow-lg"
          title="Close Music (Keeps playing in background)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Drag Overlay Indicator */}
        {isDraggingOver && (
          <div className="absolute inset-0 bg-[#1db954]/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center gap-3 pointer-events-none animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#1db954] text-stone-950 flex items-center justify-center shadow-2xl animate-bounce">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-black text-white drop-shadow">
              Drop Audio Files to Import to Playlist
            </h3>
            <p className="text-xs text-stone-200 font-bold">
              MP3, WAV, M4A, OGG supported • Saved in persistent local database
            </p>
          </div>
        )}

        {/* SCROLLABLE MAIN CONTENT REGION */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col">
          {/* ========================================================================= */}
          {/* 1. PLAYLIST HEADER */}
          {/* ========================================================================= */}
          <div
            ref={playlistHeaderRef}
            className="relative px-6 sm:px-10 pt-8 pb-6 bg-gradient-to-b from-[#3a1d06] via-[#1e1005] to-[#121212] flex flex-col gap-6"
          >
            {/* Subtle suit watermark decoration */}
            <div className="absolute top-4 right-16 text-8xl text-amber-500/5 font-serif font-black select-none pointer-events-none">
              ♠ ♥ ♦ ♣
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 relative z-10">
              {/* Left Large Official Album Artwork */}
              <div className="w-44 h-44 sm:w-48 sm:h-48 rounded-2xl overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.8)] border-2 border-amber-500/30 shrink-0 bg-stone-900 group relative">
                <img
                  src={currentTrack.coverImage || euchreAlbumCover}
                  alt={currentTrack.title || 'EUCHRE Official Game Soundtrack'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2.5">
                  <span className="text-[10px] font-black text-amber-300 tracking-wider uppercase drop-shadow">
                    {currentTrack.section || 'Soundtrack'}
                  </span>
                </div>
              </div>

              {/* Right Playlist Details & Metadata */}
              <div className="flex-1 flex flex-col justify-end text-center sm:text-left space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-[11px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/20 px-3 py-0.5 rounded-full border border-amber-400/30">
                    BASE PLAYLIST
                  </span>
                  <span className="text-xs text-stone-400 font-bold">
                    The Porchlight Sessions & Saloon Classics
                  </span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                  EUCHRE SALOON SOUNDTRACK
                </h1>

                <p className="text-xs sm:text-sm text-stone-300 font-medium max-w-2xl">
                  Featuring official Euchre country ballads, loner anthems, and saloon stomps — plus support for your own custom uploaded music.
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs text-stone-300 font-medium pt-1 flex-wrap">
                  <span className="text-white font-black flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> The Porchlight Players
                  </span>
                  <span>•</span>
                  <span>{playback.allTracks.length} Songs in Library</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Persistent Database
                  </span>
                </div>
              </div>
            </div>

            {/* Action Row: Large Play Button, Import Songs, Shuffle, Favorite, 3-Dots Menu */}
            <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 relative z-20 flex-wrap">
              <div className="flex items-center gap-3 relative flex-wrap">
                {/* Large Green/Gold PLAY Button */}
                <button
                  onClick={handleTogglePlay}
                  className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-[#1db954] hover:bg-[#1ed760] text-stone-950 flex items-center justify-center shadow-[0_8px_25px_rgba(29,185,84,0.5)] transition hover:scale-105 active:scale-95"
                  title={playback.isPlaying ? 'Pause' : 'Play Soundtrack'}
                >
                  {playback.isPlaying ? (
                    <Pause className="w-6 h-6 fill-current" />
                  ) : (
                    <Play className="w-6 h-6 fill-current ml-1" />
                  )}
                </button>

                {/* Import Songs Button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 rounded-full bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-amber-500/40 text-xs font-black flex items-center gap-2 transition hover:scale-105 active:scale-95 shadow-lg"
                  title="Import music files (.mp3, .wav, .m4a)"
                >
                  <Upload className="w-4 h-4" />
                  <span>Add / Import Songs</span>
                </button>

                {/* Shuffle Button */}
                <button
                  onClick={() => {
                    sounds.playClick();
                    gameAudio.toggleShuffle();
                    showToast(playback.isShuffle ? 'Shuffle Off' : 'Shuffle On');
                  }}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition relative ${
                    playback.isShuffle
                      ? 'border-[#1db954] text-[#1db954] bg-[#1db954]/10 shadow-[0_0_15px_rgba(29,185,84,0.3)]'
                      : 'border-stone-700 text-stone-400 hover:text-white hover:border-stone-500'
                  }`}
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                  {playback.isShuffle && (
                    <span className="absolute bottom-1.5 w-1 h-1 bg-[#1db954] rounded-full" />
                  )}
                </button>

                {/* Heart Favorite / Save Playlist */}
                <button
                  onClick={() => handleToggleFavorite(currentTrack.id)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                    playback.likedTrackIds.has(currentTrack.id)
                      ? 'border-rose-500 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.3)]'
                      : 'border-stone-700 text-stone-400 hover:text-white hover:border-stone-500'
                  }`}
                  title="Save to Favorites"
                >
                  <Heart
                    className={`w-4 h-4 ${
                      playback.likedTrackIds.has(currentTrack.id) ? 'fill-current' : ''
                    }`}
                  />
                </button>

                {/* 3-Dots More Options Menu */}
                <button
                  onClick={() => setShowThreeDotsMenu(!showThreeDotsMenu)}
                  className="w-10 h-10 rounded-full border border-stone-700 hover:border-stone-500 text-stone-400 hover:text-white flex items-center justify-center transition"
                  title="More Options"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {/* 3-Dots Context Menu Dropdown */}
                {showThreeDotsMenu && (
                  <div className="absolute top-16 left-32 w-64 bg-[#242424] border border-stone-700 rounded-2xl p-2 shadow-2xl z-50 text-xs font-semibold text-stone-200 flex flex-col animate-in fade-in zoom-in-95 duration-150">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setShowThreeDotsMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="p-2.5 text-left hover:bg-stone-700/70 rounded-xl transition flex items-center gap-2.5 text-amber-300"
                    >
                      <Upload className="w-4 h-4 text-amber-400" />
                      <span>Upload Custom Music Files</span>
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setShowThreeDotsMenu(false);
                        gameAudio.togglePlay();
                      }}
                      className="p-2.5 text-left hover:bg-stone-700/70 rounded-xl transition flex items-center gap-2.5"
                    >
                      <Play className="w-4 h-4 text-emerald-400" />
                      <span>{playback.isPlaying ? 'Pause Playlist' : 'Play Playlist'}</span>
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setShowThreeDotsMenu(false);
                        gameAudio.toggleShuffle();
                        if (!playback.isPlaying) gameAudio.togglePlay();
                      }}
                      className="p-2.5 text-left hover:bg-stone-700/70 rounded-xl transition flex items-center gap-2.5"
                    >
                      <Shuffle className="w-4 h-4 text-amber-400" />
                      <span>Shuffle Play</span>
                    </button>
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setShowThreeDotsMenu(false);
                        gameAudio.downloadAll();
                        showToast(`💾 All ${playback.allTracks.length} tracks cached in offline storage`);
                      }}
                      className="p-2.5 text-left hover:bg-stone-700/70 rounded-xl transition flex items-center gap-2.5"
                    >
                      <Download className="w-4 h-4 text-cyan-400" />
                      <span>Cache All for Offline Play</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Right Side Quick Search Field */}
              <div className="flex items-center gap-3">
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-stone-400" />
                  <input
                    type="text"
                    placeholder="Search songs or lyrics..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#222] text-xs font-semibold text-white pl-9 pr-3 py-2 rounded-full border border-stone-700 focus:border-stone-400 outline-none w-44 sm:w-60 transition placeholder:text-stone-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 2. CATEGORY TABS & SORT BAR */}
          {/* ========================================================================= */}
          <div className="px-6 sm:px-10 py-3 bg-[#161616] border-b border-stone-800 flex items-center justify-between gap-4 flex-wrap">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {[
                { id: 'all', label: `All Tracks (${playback.allTracks.length})` },
                { id: 'main', label: 'Main Theme' },
                { id: 'gameplay', label: 'Gameplay' },
                { id: 'tension_showdown', label: 'Tension & Showdown' },
                { id: 'championship', label: 'Championship' },
                { id: 'menu', label: 'Saloon & Menu' },
                { id: 'custom', label: `Custom Uploads (${playback.allTracks.filter((t) => t.isCustom).length})` },
                { id: 'favorites', label: `Liked (${playback.likedTrackIds.size})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedCategory(tab.id);
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === tab.id
                      ? 'bg-white text-stone-950 shadow'
                      : 'bg-[#282828] text-stone-300 hover:bg-[#333] hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Sort Toggle Dropdown */}
            <div className="flex items-center gap-2 text-xs text-stone-400 font-bold">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#242424] text-stone-200 text-xs font-semibold px-2.5 py-1 rounded-lg border border-stone-700 outline-none cursor-pointer"
              >
                <option value="number">Track #</option>
                <option value="title">Title (A-Z)</option>
                <option value="duration">Duration</option>
              </select>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* 3. TRACK LIST TABLE */}
          {/* ========================================================================= */}
          <div className="px-6 sm:px-10 py-4 flex-1">
            <table className="w-full text-left text-xs text-stone-300 border-collapse">
              <thead>
                <tr className="border-b border-stone-800 text-[11px] font-black text-stone-400 uppercase tracking-wider pb-2">
                  <th className="py-2.5 pl-3 w-12 text-center">#</th>
                  <th className="py-2.5">TITLE & SECTION</th>
                  <th className="py-2.5 hidden md:table-cell">ALBUM</th>
                  <th className="py-2.5 hidden sm:table-cell text-center">SOURCE</th>
                  <th className="py-2.5 pr-4 text-right">
                    <Clock className="w-4 h-4 inline" />
                  </th>
                  <th className="py-2.5 pr-2 w-16 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/40">
                {displayedTracks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-stone-500 font-bold text-sm">
                      No tracks found matching your filter.
                    </td>
                  </tr>
                ) : (
                  displayedTracks.map((track) => {
                    const isCurrent = track.id === currentTrack.id;
                    const isLiked = playback.likedTrackIds.has(track.id);
                    const isDownloaded = playback.downloadedTrackIds.has(track.id);

                    return (
                      <tr
                        key={track.id}
                        onClick={() => handlePlayTrack(track)}
                        onDoubleClick={() => handlePlayTrack(track)}
                        className={`group hover:bg-[#282828] transition cursor-pointer rounded-xl ${
                          isCurrent ? 'bg-[#242424]' : ''
                        }`}
                      >
                        {/* Index / Equalizer */}
                        <td className="py-3 pl-3 text-center">
                          {isCurrent && playback.isPlaying ? (
                            <div className="flex items-end justify-center gap-0.5 h-4 w-4 mx-auto">
                              <span
                                className="w-1 bg-[#1db954] rounded-full animate-[bounce_0.6s_infinite_alternate]"
                                style={{ height: '70%' }}
                              />
                              <span
                                className="w-1 bg-[#1db954] rounded-full animate-[bounce_0.9s_infinite_alternate]"
                                style={{ height: '100%' }}
                              />
                              <span
                                className="w-1 bg-[#1db954] rounded-full animate-[bounce_0.5s_infinite_alternate]"
                                style={{ height: '40%' }}
                              />
                            </div>
                          ) : (
                            <span className="group-hover:hidden font-mono text-stone-400 font-bold">
                              {track.trackNumber < 10 ? `0${track.trackNumber}` : track.trackNumber}
                            </span>
                          )}
                          <Play className="w-4 h-4 text-white fill-white hidden group-hover:block mx-auto" />
                        </td>

                        {/* Title + Artwork + Artist + Lyrics Preview */}
                        <td className="py-2.5">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-11 h-11 rounded-xl overflow-hidden bg-gradient-to-br ${track.coverBg} flex items-center justify-center text-lg shrink-0 shadow border border-white/10`}
                            >
                              {track.coverImage ? (
                                <img
                                  src={track.coverImage}
                                  alt={track.title}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                track.coverEmoji
                              )}
                            </div>
                            <div className="flex flex-col truncate pr-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`font-black text-xs sm:text-sm truncate ${
                                    isCurrent ? 'text-[#1db954]' : 'text-white'
                                  }`}
                                >
                                  {track.title}
                                </span>
                                {track.section && (
                                  <span className="text-[9px] bg-amber-500/20 text-amber-300 font-bold px-1.5 py-0.2 rounded border border-amber-400/30 shrink-0">
                                    {track.section}
                                  </span>
                                )}
                                {track.isCustom && (
                                  <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-1.5 py-0.2 rounded border border-cyan-400/30 shrink-0">
                                    CUSTOM
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-stone-400 font-medium truncate">
                                <span>{track.artist}</span>
                                {track.lyricsPreview && (
                                  <span className="hidden lg:inline text-stone-500 truncate italic">
                                    • "{track.lyricsPreview}"
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Album Column */}
                        <td className="py-2.5 text-stone-400 hidden md:table-cell font-medium truncate max-w-xs">
                          {track.album}
                        </td>

                        {/* Audio Source Badge */}
                        <td className="py-2.5 hidden sm:table-cell text-center">
                          {track.hasCustomAudio ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-sm cursor-help"
                              title={`Uploaded Audio: ${track.customFileName || 'Custom File'} (${track.customFileSize || 'Stored in DB'})`}
                            >
                              <Check className="w-3 h-3 text-emerald-400" /> Uploaded Audio
                            </span>
                          ) : track.isCustom ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                              <Check className="w-3 h-3" /> Saved DB
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300/80 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/20">
                              <Disc className="w-3 h-3 text-amber-400" /> Studio Synth
                            </span>
                          )}
                        </td>

                        {/* Duration Column */}
                        <td className="py-2.5 pr-4 text-right font-mono text-stone-400 text-xs">
                          {track.duration}
                        </td>

                        {/* Track Options 3-Dots */}
                        <td className="py-2.5 pr-2 text-center relative">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={(e) => handleToggleFavorite(track.id, e)}
                              className={`p-1.5 transition ${
                                isLiked
                                  ? 'text-rose-500'
                                  : 'text-stone-500 hover:text-white opacity-0 group-hover:opacity-100'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
                            </button>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTrackMenuId(activeTrackMenuId === track.id ? null : track.id);
                              }}
                              className="p-1.5 text-stone-400 hover:text-white opacity-0 group-hover:opacity-100 transition"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Track Context Menu Popup */}
                          {activeTrackMenuId === track.id && (
                            <div className="absolute right-6 top-8 w-56 bg-[#282828] border border-stone-700 rounded-2xl p-1.5 shadow-2xl z-50 text-xs font-semibold text-stone-200 flex flex-col animate-in fade-in duration-100 text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTrackMenuId(null);
                                  handlePlayTrack(track);
                                }}
                                className="p-2 hover:bg-stone-700/60 rounded-xl transition flex items-center gap-2"
                              >
                                <Play className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Play Now</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTrackMenuId(null);
                                  gameAudio.playNextInQueue(track);
                                  showToast(`Queued next: ${track.title}`);
                                }}
                                className="p-2 hover:bg-stone-700/60 rounded-xl transition flex items-center gap-2"
                              >
                                <ListMusic className="w-3.5 h-3.5 text-amber-400" />
                                <span>Play Next</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTrackMenuId(null);
                                  gameAudio.addToQueue(track);
                                  showToast(`Added to queue: ${track.title}`);
                                }}
                                className="p-2 hover:bg-stone-700/60 rounded-xl transition flex items-center gap-2"
                              >
                                <ListMusic className="w-3.5 h-3.5 text-cyan-400" />
                                <span>Add to Queue</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveTrackMenuId(null);
                                  setAttachingTrackId(track.id);
                                  attachInputRef.current?.click();
                                }}
                                className="p-2 hover:bg-stone-700/60 rounded-xl transition flex items-center gap-2 text-amber-300"
                              >
                                <FileAudio className="w-3.5 h-3.5" />
                                <span>{track.hasCustomAudio ? 'Replace Audio File' : 'Attach Audio File'}</span>
                              </button>
                              {track.hasCustomAudio && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTrackMenuId(null);
                                    gameAudio.removeCustomAudioFromTrack(track.id);
                                    showToast(`Reset ${track.title} to studio synth`);
                                  }}
                                  className="p-2 hover:bg-stone-700/60 text-stone-300 rounded-xl transition flex items-center gap-2"
                                >
                                  <Disc className="w-3.5 h-3.5 text-amber-400" />
                                  <span>Reset to Studio Synth</span>
                                </button>
                              )}
                              {track.isCustom && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setActiveTrackMenuId(null);
                                    gameAudio.removeCustomTrack(track.id);
                                    showToast(`Deleted track: ${track.title}`);
                                  }}
                                  className="p-2 hover:bg-rose-950/60 text-rose-300 rounded-xl transition flex items-center gap-2"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Remove Custom Track</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* QUEUE DRAWER OVERLAY */}
        {/* ========================================================================= */}
        {showQueueDrawer && (
          <div className="absolute right-0 top-0 bottom-[80px] w-80 bg-[#181818] border-l border-stone-800 p-4 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <ListMusic className="w-4 h-4 text-[#1db954]" />
                <h3 className="font-black text-sm text-white">Play Queue</h3>
              </div>
              <button
                onClick={() => setShowQueueDrawer(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                  NOW PLAYING
                </div>
                <div className="p-2.5 rounded-xl bg-[#242424] flex items-center gap-3 border border-stone-700">
                  <div
                    className={`w-9 h-9 rounded-lg overflow-hidden bg-gradient-to-br ${currentTrack.coverBg} flex items-center justify-center text-base shrink-0`}
                  >
                    {currentTrack.coverImage ? (
                      <img
                        src={currentTrack.coverImage}
                        alt={currentTrack.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      currentTrack.coverEmoji
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-black text-xs text-[#1db954] truncate">
                      {currentTrack.title}
                    </div>
                    <div className="text-[10px] text-stone-400 truncate">
                      {currentTrack.artist}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-wider text-stone-400 mb-2">
                  <span>UP NEXT ({playback.queue.length})</span>
                  {playback.queue.length > 0 && (
                    <button
                      onClick={() => {
                        sounds.playClick();
                        gameAudio.clearQueue();
                      }}
                      className="text-amber-400 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {playback.queue.length === 0 ? (
                  <div className="p-4 text-center text-xs text-stone-500 font-medium">
                    Queue is empty. Use 3-dots on any track to add.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {playback.queue.map((track, qIdx) => (
                      <div
                        key={`${track.id}_${qIdx}`}
                        className="p-2 rounded-xl bg-[#202020] hover:bg-[#262626] flex items-center justify-between gap-2 text-xs transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-stone-500 font-mono text-[10px]">{qIdx + 1}</span>
                          <div className="truncate">
                            <div className="font-bold text-white text-[11px] truncate">
                              {track.title}
                            </div>
                            <div className="text-[10px] text-stone-400 truncate">
                              {track.artist}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => gameAudio.removeFromQueue(qIdx)}
                          className="text-stone-500 hover:text-rose-400 p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* AUDIO SETTINGS DRAWER OVERLAY */}
        {/* ========================================================================= */}
        {showSettingsDrawer && (
          <div className="absolute right-0 top-0 bottom-[80px] w-80 bg-[#181818] border-l border-stone-800 p-4 shadow-2xl z-40 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-400" />
                <h3 className="font-black text-sm text-white">Audio & Playback Settings</h3>
              </div>
              <button
                onClick={() => setShowSettingsDrawer(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
              <div className="space-y-2">
                <div className="font-black text-amber-300 uppercase text-[11px]">
                  Crossfade Tracks
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {[0, 2, 4, 6, 8].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => {
                        sounds.playClick();
                        gameAudio.setSettings({ crossfadeSec: sec as any });
                      }}
                      className={`py-1.5 rounded-lg font-bold text-center border transition ${
                        playback.settings.crossfadeSec === sec
                          ? 'bg-[#1db954] text-stone-950 border-emerald-300'
                          : 'bg-[#242424] text-stone-400 border-stone-700 hover:text-white'
                      }`}
                    >
                      {sec === 0 ? 'Off' : `${sec}s`}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200">Normalize Audio Volume</span>
                  <input
                    type="checkbox"
                    checked={playback.settings.normalizeVolume}
                    onChange={(e) =>
                      gameAudio.setSettings({ normalizeVolume: e.target.checked })
                    }
                    className="accent-[#1db954] w-4 h-4 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  Maintains optimal balanced loudness across all saloon tracks.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-stone-800">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-200">Pause on Window Blur</span>
                  <input
                    type="checkbox"
                    checked={playback.settings.pauseOnBlur}
                    onChange={(e) =>
                      gameAudio.setSettings({ pauseOnBlur: e.target.checked })
                    }
                    className="accent-[#1db954] w-4 h-4 rounded cursor-pointer"
                  />
                </div>
                <p className="text-[10px] text-stone-500">
                  Automatically pauses music when switching browser tabs.
                </p>
              </div>

              <div className="p-3 bg-[#242424] rounded-2xl border border-stone-700 space-y-1">
                <div className="font-bold text-amber-300 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  IndexedDB Local Storage
                </div>
                <div className="text-[10px] text-stone-400">
                  {playback.allTracks.length} tracks registered in your jukebox. All custom uploaded songs stay preserved permanently.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. PERSISTENT BOTTOM PLAYER BAR */}
        {/* ========================================================================= */}
        <div className="h-[80px] bg-[#181818] border-t border-stone-800 px-4 sm:px-8 flex items-center justify-between gap-4 z-30 shrink-0">
          {/* LEFT SIDE: Album Artwork + Song Title + Artist + Heart Button */}
          <div className="flex items-center gap-3 w-1/4 min-w-[180px]">
            <div
              className={`w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br ${currentTrack.coverBg} flex items-center justify-center text-2xl shrink-0 shadow border border-white/10`}
            >
              {currentTrack.coverImage ? (
                <img
                  src={currentTrack.coverImage}
                  alt={currentTrack.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                currentTrack.coverEmoji
              )}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-xs sm:text-sm font-black text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </span>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-[11px] text-stone-400 font-medium truncate">
                  {currentTrack.artist}
                </span>
                {playback.hasRealAudio || currentTrack.hasCustomAudio ? (
                  <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-500/40 shrink-0">
                    🟢 Authentic Audio
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-amber-300/90 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-500/30 shrink-0">
                    🎼 Studio Synth
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => handleToggleFavorite(currentTrack.id)}
              className={`p-1.5 transition ml-1 shrink-0 ${
                playback.likedTrackIds.has(currentTrack.id)
                  ? 'text-rose-500'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Save to Liked Songs"
            >
              <Heart
                className={`w-4 h-4 ${
                  playback.likedTrackIds.has(currentTrack.id) ? 'fill-current' : ''
                }`}
              />
            </button>
          </div>

          {/* CENTER: Transport Controls & Progress Scrub Bar */}
          <div className="flex-1 max-w-xl flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  sounds.playClick();
                  gameAudio.toggleShuffle();
                }}
                className={`p-1.5 transition relative ${
                  playback.isShuffle ? 'text-[#1db954]' : 'text-stone-400 hover:text-white'
                }`}
                title="Shuffle"
              >
                <Shuffle className="w-4 h-4" />
                {playback.isShuffle && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#1db954] rounded-full" />
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  gameAudio.prev();
                }}
                className="text-stone-300 hover:text-white transition p-1"
                title="Previous track"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={handleTogglePlay}
                className="w-10 h-10 rounded-full bg-white hover:scale-105 text-stone-950 flex items-center justify-center transition active:scale-95 shadow-md"
                title={playback.isPlaying ? 'Pause' : 'Play'}
              >
                {playback.isPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                )}
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  gameAudio.next();
                }}
                className="text-stone-300 hover:text-white transition p-1"
                title="Next track"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                onClick={() => {
                  sounds.playClick();
                  gameAudio.cycleRepeat();
                }}
                className={`p-1.5 transition relative ${
                  playback.repeatMode !== 'off'
                    ? 'text-[#1db954]'
                    : 'text-stone-400 hover:text-white'
                }`}
                title={`Repeat: ${playback.repeatMode}`}
              >
                <Repeat className="w-4 h-4" />
                {playback.repeatMode !== 'off' && (
                  <span className="absolute -top-1 -right-1 text-[8px] font-mono font-black text-[#1db954]">
                    {playback.repeatMode === 'one' ? '1' : '•'}
                  </span>
                )}
              </button>
            </div>

            {/* Interactive Timeline Progress Scrub Bar */}
            <div className="w-full flex items-center gap-2.5 text-[11px] text-stone-400 font-mono">
              <span className="w-8 text-right">{formatTime(scrubValueSec)}</span>
              <div className="flex-1 relative flex items-center">
                <input
                  type="range"
                  min="0"
                  max={playback.durationSec || 100}
                  step="1"
                  value={scrubValueSec}
                  onMouseDown={() => setIsScrubbing(true)}
                  onTouchStart={() => setIsScrubbing(true)}
                  onMouseUp={() => setIsScrubbing(false)}
                  onTouchEnd={() => setIsScrubbing(false)}
                  onChange={handleSeek}
                  className="w-full accent-[#1db954] hover:accent-[#1ed760] cursor-pointer h-1 bg-stone-700 rounded-full"
                />
              </div>
              <span className="w-8 text-left">{currentTrack.duration}</span>
            </div>
          </div>

          {/* RIGHT SIDE: Queue Toggle, Settings, Volume Slider */}
          <div className="flex items-center gap-3 w-1/4 justify-end shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                setShowQueueDrawer(!showQueueDrawer);
                setShowSettingsDrawer(false);
              }}
              className={`p-2 rounded-lg transition ${
                showQueueDrawer
                  ? 'text-[#1db954] bg-stone-800'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Play Queue"
            >
              <ListMusic className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setShowSettingsDrawer(!showSettingsDrawer);
                setShowQueueDrawer(false);
              }}
              className={`p-2 rounded-lg transition ${
                showSettingsDrawer
                  ? 'text-amber-400 bg-stone-800'
                  : 'text-stone-400 hover:text-white'
              }`}
              title="Sound & Audio Settings"
            >
              <Sliders className="w-4 h-4" />
            </button>

            <button
              onClick={() => gameAudio.toggleMute()}
              className="text-stone-400 hover:text-white p-1 transition"
              title={playback.isMuted ? 'Unmute' : 'Mute'}
            >
              {playback.isMuted || playback.volume === 0 ? (
                <VolumeX className="w-4 h-4 text-rose-400" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            <div className="w-20 hidden sm:block">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={playback.isMuted ? 0 : playback.volume}
                onChange={handleVolumeChange}
                className="w-full accent-[#1db954] hover:accent-[#1ed760] cursor-pointer h-1 bg-stone-700 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
