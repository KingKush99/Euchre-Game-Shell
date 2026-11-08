import React, { useState } from 'react';
import {
  X,
  Play,
  Volume2,
  VolumeX,
  ExternalLink,
  Flame,
  Users,
  MessageSquare,
  Heart,
  Send,
  ThumbsUp,
  ArrowLeft,
  Tv,
  Radio,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  isUserLiked?: boolean;
}

interface YouTubeLiveScreenProps {
  onReturnToHome: () => void;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', user: 'CardKing92', avatar: '🤠', time: 'Just now', text: 'That double euchre call in round 3 was absolutely insane! Lone hand legend 🔥', likes: 24 },
  { id: 'c2', user: 'LoneStarQueen', avatar: '👑', time: '1m ago', text: 'Texas Sovereign rules make this tournament so hype to watch live!', likes: 18 },
  { id: 'c3', user: 'EuchreMaster_TX', avatar: '🃏', time: '2m ago', text: 'Who do you guys think takes the $50k prize pool? My money is on TexasPalace!', likes: 11 },
  { id: 'c4', user: 'DealerAce', avatar: '🎯', time: '4m ago', text: 'Right Bower was buried in the kitty! Unbelievable luck for team North/South.', likes: 35 },
  { id: 'c5', user: 'Gunslinger99', avatar: '💀', time: '6m ago', text: 'Great defense on that 9-9 tie trick. World class play right here.', likes: 9 },
  { id: 'c6', user: 'SaloonBabe', avatar: '✨', time: '8m ago', text: 'The dealer rotation in game 4 changed the whole dynamic!', likes: 14 },
];

export const YouTubeLiveScreen: React.FC<YouTubeLiveScreenProps> = ({ onReturnToHome }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [likesCount, setLikesCount] = useState(1482);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');

  const youtubeLiveUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
  const embedUrl = `https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1`;

  const handleLike = () => {
    sounds.playWin();
    confetti({ particleCount: 35, spread: 60, origin: { x: 0.3, y: 0.7 } });
    if (hasLiked) {
      setLikesCount((p) => p - 1);
      setHasLiked(false);
    } else {
      setLikesCount((p) => p + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    sounds.playClick();
    const comment: Comment = {
      id: `user-${Date.now()}`,
      user: 'You (Sovereign Player)',
      avatar: '⭐',
      time: 'Just now',
      text: newCommentText.trim(),
      likes: 1,
      isUserLiked: true,
    };

    setComments((prev) => [comment, ...prev]);
    setNewCommentText('');
  };

  const handleLikeComment = (commentId: string) => {
    sounds.playClick();
    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          const isLiked = !c.isUserLiked;
          return {
            ...c,
            likes: isLiked ? c.likes + 1 : c.likes - 1,
            isUserLiked: isLiked,
          };
        }
        return c;
      })
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-[#070b16] text-white flex flex-col select-none overflow-x-hidden">
      {/* Background ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-red-600/15 via-rose-600/10 to-transparent pointer-events-none blur-3xl" />

      {/* TOP WINDOW HEADER */}
      <header className="relative z-10 w-full px-4 sm:px-8 py-4 border-b border-red-600/30 bg-gradient-to-r from-stone-950 via-[#160b12] to-stone-950 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              sounds.playClick();
              onReturnToHome();
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-stone-900/90 hover:bg-stone-800 text-stone-200 hover:text-white border border-stone-700/80 transition-all active:scale-95 shadow-md group cursor-pointer"
            title="Return to Main Menu"
          >
            <ArrowLeft className="w-4 h-4 text-red-400 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-xs font-black uppercase tracking-wider">Home Hub</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-red-600 border-2 border-red-400 flex items-center justify-center text-white text-xl shadow-[0_0_20px_rgba(220,38,38,0.8)] relative">
              <Play className="w-6 h-6 fill-white ml-0.5" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border-2 border-red-600 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-[9px] px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  YOUTUBE LIVE WINDOW
                </span>
                <span className="text-xs text-rose-300 font-mono">12,490 VIEWERS WATCHING</span>
              </div>
              <h1 className="text-lg sm:text-2xl font-black font-serif tracking-wide text-white drop-shadow">
                EUCHRE EVERYTHING WORLD CHAMPIONSHIP
              </h1>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <a
            href={youtubeLiveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-md cursor-pointer"
          >
            <span>Watch on YouTube</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

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

      {/* MAIN WINDOW CONTENT */}
      <main className="relative z-10 flex-1 w-full max-w-7xl mx-auto p-4 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (8 cols): Large Video Player, Controls & Broadcast Info */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            {/* 16:9 Video Player Container */}
            <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden border-2 border-red-900/80 shadow-[0_15px_50px_rgba(0,0,0,0.9)] group">
              <iframe
                className="w-full h-full object-cover"
                src={embedUrl}
                title="Euchre Everything YouTube Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Mute / Unmute Overlay Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 px-3 py-2 bg-black/85 hover:bg-black text-white rounded-2xl border border-stone-700 backdrop-blur-md transition flex items-center gap-2 text-xs font-bold shadow-xl cursor-pointer"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-red-400" />
                    <span>UNMUTE AUDIO</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>MUTE AUDIO</span>
                  </>
                )}
              </button>
            </div>

            {/* Stream Stats & Controls Banner */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#0a0f1e] p-4 sm:p-5 rounded-3xl border-2 border-stone-800 shadow-xl">
              <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-stone-200 font-bold">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>12,490 Viewers</span>
                </div>
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Grand Finals Table • High Stakes</span>
                </div>
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span>$50,000 Prize Pool</span>
                </div>
              </div>

              <button
                onClick={handleLike}
                className={`px-5 py-2.5 rounded-2xl border-2 font-black text-xs flex items-center gap-2 transition cursor-pointer active:scale-95 ${
                  hasLiked
                    ? 'bg-red-600/30 border-red-500 text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.5)]'
                    : 'bg-stone-900 border-stone-700 text-stone-300 hover:text-white hover:border-red-500/50'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likesCount.toLocaleString()} Likes</span>
              </button>
            </div>

            {/* Match Information Breakdown */}
            <div className="p-5 bg-[#0a0f1e] rounded-3xl border-2 border-stone-800 shadow-xl space-y-3">
              <h3 className="font-serif font-black text-base text-amber-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-red-400 animate-pulse" /> TOURNAMENT MATCH DETAILS
              </h3>
              <p className="text-xs text-stone-300 leading-relaxed">
                Live official broadcast of the Euchre World Championship Grand Finals. Teams play 5-game sets under Sovereign Texas rules (10 Points to Win, Stick the Dealer, Canadian Loner enabled).
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Current Score</span>
                  <strong className="text-amber-300 text-sm">North/South: 8 - East/West: 7</strong>
                </div>
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Round</span>
                  <strong className="text-white text-sm">Game 5 (Hand 11)</strong>
                </div>
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Active Trump</span>
                  <strong className="text-emerald-400 text-sm">Hearts (♥)</strong>
                </div>
                <div className="p-3 bg-stone-950 rounded-2xl border border-stone-800">
                  <span className="text-stone-500 text-[10px] uppercase font-bold block">Broadcast Host</span>
                  <strong className="text-rose-400 text-sm">Euchre Everything TV</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (4 cols): Live Comments & Real-Time Chat Stream */}
          <div className="lg:col-span-4 bg-[#0a0f1e] border-2 border-red-950/80 rounded-3xl p-5 flex flex-col justify-between shadow-2xl h-[680px]">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-800 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-400" />
                <h3 className="font-black text-xs uppercase tracking-wider text-white">LIVE CHAT & COMMENTS</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                {comments.length} Comments
              </span>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 my-2">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-3 bg-stone-950/90 hover:bg-stone-950 rounded-2xl border border-stone-800/90 transition flex items-start gap-3 shadow-md"
                >
                  <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-sm shrink-0 shadow">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-red-300 truncate">{c.user}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-snug break-words">{c.text}</p>
                    <div className="flex items-center justify-end mt-1.5">
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition cursor-pointer ${
                          c.isUserLiked ? 'text-red-400 bg-red-950/60' : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        <ThumbsUp className="w-3 h-3" />
                        <span>{c.likes}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Comment Input Form */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a public live stream comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 focus:border-red-500 rounded-2xl px-3.5 py-2.5 text-xs text-white placeholder-stone-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-4 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs rounded-2xl shadow transition flex items-center gap-1.5 shrink-0 cursor-pointer active:scale-95"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};
