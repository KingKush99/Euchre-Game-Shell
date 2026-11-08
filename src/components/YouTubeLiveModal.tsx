import React, { useState } from 'react';
import { X, Play, Volume2, VolumeX, ExternalLink, Flame, Users, MessageSquare, Heart, Send, ThumbsUp, MessageCircle } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface Comment {
  id: string;
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
  isUserLiked?: boolean;
}

interface YouTubeLiveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INITIAL_COMMENTS: Comment[] = [
  { id: 'c1', user: 'CardKing92', avatar: '🤠', time: 'Just now', text: 'That double euchre call in round 3 was absolutely insane! Lone hand legend 🔥', likes: 24 },
  { id: 'c2', user: 'LoneStarQueen', avatar: '👑', time: '1m ago', text: 'Texas Sovereign rules make this tournament so hype to watch live!', likes: 18 },
  { id: 'c3', user: 'EuchreMaster_TX', avatar: '🃏', time: '2m ago', text: 'Who do you guys think takes the $50k prize pool? My money is on TexasPalace!', likes: 11 },
  { id: 'c4', user: 'DealerAce', avatar: '🎯', time: '4m ago', text: 'Right Bower was buried in the kitty! Unbelievable luck for team North/South.', likes: 35 },
  { id: 'c5', user: 'Gunslinger99', avatar: '💀', time: '6m ago', text: 'Great defense on that 9-9 tie trick. World class play right here.', likes: 9 },
];

export const YouTubeLiveModal: React.FC<YouTubeLiveModalProps> = ({ isOpen, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [likesCount, setLikesCount] = useState(1482);
  const [hasLiked, setHasLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>(INITIAL_COMMENTS);
  const [newCommentText, setNewCommentText] = useState('');

  if (!isOpen) return null;

  const youtubeLiveUrl = 'https://www.youtube.com/watch?v=jfKfPfyJRdk';
  const embedUrl = `https://www.youtube-nocookie.com/embed/jfKfPfyJRdk?autoplay=1&mute=${isMuted ? 1 : 0}&enablejsapi=1`;

  const handleLike = () => {
    sounds.playClick();
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
    <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-3 sm:p-5">
      {/* Click backdrop */}
      <div className="absolute inset-0 pointer-events-auto bg-black/85 backdrop-blur-md" onClick={onClose} />

      <div className="pointer-events-auto relative z-10 w-full max-w-5xl bg-[#0a0f1d] border-2 border-red-600 rounded-3xl p-4 sm:p-6 shadow-[0_0_60px_rgba(220,38,38,0.5)] flex flex-col gap-4 text-white animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-hidden">
        {/* Header Bar: YouTube Live Theme */}
        <div className="flex items-center justify-between pb-3 border-b border-red-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(220,38,38,0.8)] relative">
              <Play className="w-6 h-6 fill-white ml-0.5" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-white rounded-full border-2 border-red-600 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-widest flex items-center gap-1 shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  LIVE
                </span>
                <h2 className="text-base sm:text-lg font-black text-white tracking-wide">
                  EUCHRE EVERYTHING WORLD CHAMPIONSHIP
                </h2>
              </div>
              <p className="text-xs text-stone-400">
                Official YouTube Live Stream • Grand Finals Tournament & Live Comments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={youtubeLiveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs transition shadow-md"
            >
              <span>Watch on YouTube</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white border border-stone-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Video & Live Comments Split Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 overflow-hidden">
          {/* Left Column: Video Player & Stats (8 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3 overflow-hidden">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-red-900/80 shadow-2xl group">
              <iframe
                className="w-full h-full object-cover"
                src={embedUrl}
                title="Euchre Everything YouTube Live Stream"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />

              {/* Mute toggle overlay button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-3 right-3 p-2 bg-black/80 hover:bg-black text-white rounded-xl border border-stone-700 backdrop-blur-md transition flex items-center gap-1.5 text-xs font-bold"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 text-red-400" />
                    <span>UNMUTE</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                    <span>MUTE</span>
                  </>
                )}
              </button>
            </div>

            {/* Stream Stats & Interactions */}
            <div className="flex items-center justify-between gap-3 bg-[#080d1a] p-3 rounded-2xl border border-stone-800 text-xs">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                  <Users className="w-4 h-4 text-red-400" />
                  <span>12,490 Viewers</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-300 font-bold">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>High Stakes euchre</span>
                </div>
              </div>

              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-xl border font-black flex items-center gap-2 transition ${
                  hasLiked
                    ? 'bg-red-600/30 border-red-500 text-red-300 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                    : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${hasLiked ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{likesCount.toLocaleString()} Likes</span>
              </button>
            </div>
          </div>

          {/* Right Column: Live Comment Stream Section (5 cols) */}
          <div className="lg:col-span-5 bg-[#070b16] border border-red-950/80 rounded-2xl p-3.5 flex flex-col justify-between overflow-hidden shadow-xl">
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-800/80 mb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-red-400" />
                <h3 className="font-black text-xs uppercase tracking-wider text-white">LIVE CHAT & COMMENTS</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {comments.length} Comments
              </span>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-1">
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="p-2.5 bg-stone-900/80 hover:bg-stone-900 rounded-xl border border-stone-800/80 transition flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded-full bg-stone-800 flex items-center justify-center text-sm shrink-0 shadow">
                    {c.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-[11px] mb-0.5">
                      <span className="font-bold text-red-300 truncate">{c.user}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{c.time}</span>
                    </div>
                    <p className="text-xs text-stone-200 leading-snug break-words">{c.text}</p>
                    <div className="flex items-center justify-end mt-1">
                      <button
                        onClick={() => handleLikeComment(c.id)}
                        className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg transition ${
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
            <form onSubmit={handleAddComment} className="pt-2.5 border-t border-stone-800 flex items-center gap-2">
              <input
                type="text"
                placeholder="Add a public comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1 bg-stone-950 border border-stone-800 focus:border-red-500 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none transition"
              />
              <button
                type="submit"
                disabled={!newCommentText.trim()}
                className="px-3.5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-black text-xs rounded-xl shadow transition flex items-center gap-1 shrink-0"
              >
                <span>Post</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
