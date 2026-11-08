import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Heart,
  Music,
  X,
} from 'lucide-react';
import { gameAudio, PlaybackState } from '../utils/gameAudioEngine';
import { sounds } from '../utils/soundEffects';

interface CompactCampaignPlayerProps {
  onOpenFullModal: () => void;
}

export const CompactCampaignPlayer: React.FC<CompactCampaignPlayerProps> = ({
  onOpenFullModal,
}) => {
  const [playback, setPlayback] = useState<PlaybackState>(gameAudio.getState());
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [scrubSec, setScrubSec] = useState<number>(0);

  useEffect(() => {
    const unsubscribe = gameAudio.subscribe((state) => {
      setPlayback(state);
      if (!isScrubbing) {
        setScrubSec(state.currentTimeSec);
      }
    });
    return () => unsubscribe();
  }, [isScrubbing]);

  const currentTrack = playback.currentTrack;

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleTogglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    gameAudio.togglePlay();
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    gameAudio.next();
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.playClick();
    gameAudio.prev();
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setScrubSec(val);
    gameAudio.seek(val);
  };

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    gameAudio.setVolume(val);
  };

  // If minimized to floating icon badge
  if (isMinimized) {
    return (
      <div
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 bg-[#121622]/95 border-2 border-amber-500/40 rounded-full px-4 py-2 shadow-2xl backdrop-blur-md flex items-center gap-3 cursor-pointer hover:border-amber-400 hover:scale-105 transition active:scale-95 group"
        title="Expand Music Player"
      >
        <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center text-xs">
          <Music className="w-4 h-4 animate-pulse" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-amber-200 truncate max-w-[140px]">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-stone-400 font-mono">
            {formatTime(playback.currentTimeSec)}
          </span>
        </div>
        <button
          onClick={handleTogglePlay}
          className="w-6 h-6 rounded-full bg-white text-stone-950 flex items-center justify-center shadow"
        >
          {playback.isPlaying ? (
            <Pause className="w-3 h-3 fill-current" />
          ) : (
            <Play className="w-3 h-3 fill-current ml-0.5" />
          )}
        </button>
      </div>
    );
  }

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-full max-w-[620px] sm:max-w-[700px] h-[68px] bg-[#121622]/95 border border-amber-500/30 rounded-2xl px-3.5 py-2 shadow-[0_15px_40px_rgba(0,0,0,0.85)] backdrop-blur-lg flex items-center justify-between gap-3 text-stone-100 animate-in slide-in-from-bottom-3 duration-200 select-none"
      style={{
        // Keep within bounds so it never overlaps left chat or right mini-map
        maxWidth: 'min(700px, calc(100vw - 420px))',
      }}
    >
      {/* Left: Artwork + Title + Artist */}
      <div
        onClick={onOpenFullModal}
        className="flex items-center gap-2.5 min-w-[140px] max-w-[200px] cursor-pointer group"
        title="Open Full Soundtrack Hub"
      >
        <div
          className={`w-10 h-10 rounded-xl overflow-hidden bg-gradient-to-br ${currentTrack.coverBg} flex items-center justify-center text-lg shrink-0 shadow border border-white/10 group-hover:scale-105 transition-transform`}
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
          <span className="text-xs font-black text-white truncate group-hover:text-amber-300 transition-colors">
            {currentTrack.title}
          </span>
          <span className="text-[10px] text-stone-400 font-medium truncate">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Center: Playback Transport & Progress Scrubber */}
      <div className="flex-1 flex flex-col items-center gap-1 min-w-0">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrev}
            className="text-stone-400 hover:text-white transition p-1"
            title="Previous"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>

          <button
            onClick={handleTogglePlay}
            className="w-7 h-7 rounded-full bg-white hover:scale-105 text-stone-950 flex items-center justify-center transition active:scale-95 shadow"
            title={playback.isPlaying ? 'Pause' : 'Play'}
          >
            {playback.isPlaying ? (
              <Pause className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={handleNext}
            className="text-stone-400 hover:text-white transition p-1"
            title="Next"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
        </div>

        {/* Progress scrub bar */}
        <div className="w-full flex items-center gap-2 text-[9px] text-stone-400 font-mono">
          <span>{formatTime(scrubSec)}</span>
          <div className="flex-1 relative flex items-center">
            <input
              type="range"
              min="0"
              max={playback.durationSec || 100}
              step="1"
              value={scrubSec}
              onMouseDown={() => setIsScrubbing(true)}
              onTouchStart={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              onTouchEnd={() => setIsScrubbing(false)}
              onChange={handleSeek}
              className="w-full accent-[#1db954] hover:accent-[#1ed760] cursor-pointer h-1 bg-stone-700 rounded-full"
            />
          </div>
          <span>{currentTrack.duration}</span>
        </div>
      </div>

      {/* Right: Volume & Expand/Minimize */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => gameAudio.toggleMute()}
          className="text-stone-400 hover:text-white p-1"
          title={playback.isMuted ? 'Unmute' : 'Mute'}
        >
          {playback.isMuted || playback.volume === 0 ? (
            <VolumeX className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <Volume2 className="w-3.5 h-3.5" />
          )}
        </button>

        <div className="w-14 hidden sm:block">
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={playback.isMuted ? 0 : playback.volume}
            onChange={handleVolume}
            className="w-full accent-[#1db954] cursor-pointer h-1 bg-stone-700 rounded-full"
          />
        </div>

        {/* Expand to Full Modal */}
        <button
          onClick={onOpenFullModal}
          className="p-1.5 rounded-lg bg-stone-800/80 hover:bg-stone-700 text-amber-300 hover:text-white transition"
          title="Expand to Full Soundtrack Modal"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Minimize */}
        <button
          onClick={() => setIsMinimized(true)}
          className="p-1 rounded-lg text-stone-500 hover:text-stone-300 transition"
          title="Minimize to Pill"
        >
          <Minimize2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};
