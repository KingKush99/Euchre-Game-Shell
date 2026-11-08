import React, { useState } from 'react';
import { X, Upload, Check, AlertCircle } from 'lucide-react';
import { PlayerProfile } from '../types/poker';
import { sounds } from '../utils/soundEffects';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  onSaveProfile: (updated: Partial<PlayerProfile>) => void;
}

// 32 CSS Mascot Animal Avatars
export const MASCOTS = [
  { id: 'fox', emoji: '🦊', name: 'Fox', bg: 'bg-amber-500/20 text-amber-400' },
  { id: 'panda', emoji: '🐼', name: 'Panda', bg: 'bg-[#18181b] text-stone-100' },
  { id: 'tiger', emoji: '🐯', name: 'Tiger', bg: 'bg-orange-500/20 text-orange-400' },
  { id: 'lion', emoji: '🦁', name: 'Lion', bg: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'frog', emoji: '🐸', name: 'Frog', bg: 'bg-emerald-500/20 text-emerald-400' },
  { id: 'monkey', emoji: '🐵', name: 'Monkey', bg: 'bg-amber-700/20 text-amber-600' },
  { id: 'koala', emoji: '🐨', name: 'Koala', bg: 'bg-stone-500/20 text-stone-300' },
  { id: 'rabbit', emoji: '🐰', name: 'Rabbit', bg: 'bg-rose-400/20 text-rose-300' },
  { id: 'dragon', emoji: '🐲', name: 'Dragon', bg: 'bg-emerald-600/20 text-emerald-400' },
  { id: 'unicorn', emoji: '🦄', name: 'Unicorn', bg: 'bg-purple-500/20 text-purple-300' },
  { id: 'owl', emoji: '🦉', name: 'Owl', bg: 'bg-amber-800/20 text-amber-500' },
  { id: 'wolf', emoji: '🐺', name: 'Wolf', bg: 'bg-slate-600/20 text-slate-300' },
  { id: 'bear', emoji: '🐻', name: 'Bear', bg: 'bg-amber-900/20 text-amber-600' },
  { id: 'penguin', emoji: '🐧', name: 'Penguin', bg: 'bg-cyan-500/20 text-cyan-400' },
  { id: 'butterfly', emoji: '🦋', name: 'Butterfly', bg: 'bg-sky-400/20 text-sky-300' },
  { id: 'octopus', emoji: '🐙', name: 'Octopus', bg: 'bg-pink-500/20 text-pink-400' },
  { id: 'trex', emoji: '🦖', name: 'T-Rex', bg: 'bg-green-700/20 text-green-400' },
  { id: 'bee', emoji: '🐝', name: 'Bee', bg: 'bg-yellow-400/20 text-yellow-300' },
  { id: 'parrot', emoji: '🦜', name: 'Parrot', bg: 'bg-emerald-400/20 text-emerald-300' },
  { id: 'flamingo', emoji: '🦩', name: 'Flamingo', bg: 'bg-pink-400/20 text-pink-300' },
  { id: 'dolphin', emoji: '🐬', name: 'Dolphin', bg: 'bg-blue-400/20 text-blue-300' },
  { id: 'shark', emoji: '🦈', name: 'Shark', bg: 'bg-slate-500/20 text-slate-300' },
  { id: 'turtle', emoji: '🐢', name: 'Turtle', bg: 'bg-lime-600/20 text-lime-400' },
  { id: 'raccoon', emoji: '🦝', name: 'Raccoon', bg: 'bg-stone-600/20 text-stone-400' },
  { id: 'hamster', emoji: '🐹', name: 'Hamster', bg: 'bg-orange-400/20 text-orange-300' },
  { id: 'cat', emoji: '🐱', name: 'Cat', bg: 'bg-amber-400/20 text-amber-300' },
  { id: 'dog', emoji: '🐶', name: 'Dog', bg: 'bg-amber-600/20 text-amber-400' },
  { id: 'cow', emoji: '🐮', name: 'Cow', bg: 'bg-stone-300/20 text-stone-200' },
  { id: 'eagle', emoji: '🦅', name: 'Eagle', bg: 'bg-amber-700/20 text-amber-500' },
  { id: 'horse', emoji: '🐴', name: 'Horse', bg: 'bg-amber-800/20 text-amber-600' },
  { id: 'elephant', emoji: '🐘', name: 'Elephant', bg: 'bg-indigo-400/20 text-indigo-300' },
  { id: 'hedgehog', emoji: '🦔', name: 'Hedgehog', bg: 'bg-[#451a03]/30 text-amber-400' },
];

const INAPPROPRIATE_WORDS = [
  'badword', 'hate', 'nazi', 'slur', 'offensive', 'scam', 'spam', 'porn', 'abuse'
];

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  onSaveProfile,
}) => {
  const [selectedMascot, setSelectedMascot] = useState<string>(playerProfile.mascot || 'fox');
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>(playerProfile.customAvatarUrl || '');
  const [username, setUsername] = useState<string>(playerProfile.username || 'PalaceQueen99');
  const [displayName, setDisplayName] = useState<string>(playerProfile.name || 'Gaming Queen');
  const [bio, setBio] = useState<string>(playerProfile.bio || 'Four pawns, one mission. Living life one roll at a time.');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size must be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCustomAvatarUrl(event.target.result as string);
          sounds.playWin();
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const containsProfanity = (text: string) => {
    const lower = text.toLowerCase();
    return INAPPROPRIATE_WORDS.some(word => lower.includes(word));
  };

  const handleSave = () => {
    setErrorMsg(null);

    // Validate empty
    if (!username.trim() || !displayName.trim()) {
      setErrorMsg('Username and Display name cannot be empty.');
      return;
    }

    // Validate profanity
    if (containsProfanity(username) || containsProfanity(displayName) || containsProfanity(bio)) {
      setErrorMsg('Inappropriate language detected. Please use respectful text.');
      return;
    }

    // Validate 7-day username change restriction
    const now = Date.now();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    if (
      username !== playerProfile.username &&
      playerProfile.lastUsernameChangeTimestamp &&
      now - playerProfile.lastUsernameChangeTimestamp < SEVEN_DAYS_MS
    ) {
      const remainingDays = Math.ceil(
        (SEVEN_DAYS_MS - (now - playerProfile.lastUsernameChangeTimestamp)) / (24 * 60 * 60 * 1000)
      );
      setErrorMsg(`Username can only be changed once every 7 days (${remainingDays} days remaining).`);
      return;
    }

    sounds.playWin();
    onSaveProfile({
      username: username.trim(),
      name: displayName.trim(),
      bio: bio.trim(),
      mascot: selectedMascot,
      customAvatarUrl,
      lastUsernameChangeTimestamp: username !== playerProfile.username ? now : playerProfile.lastUsernameChangeTimestamp,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-[#0b1326] border-2 border-slate-700/80 rounded-3xl p-6 shadow-2xl text-white my-auto max-h-[90vh] flex flex-col justify-between overflow-y-auto">
        {/* Top Header matching Image 2 */}
        <div className="w-full flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              PROFILE DETAILS
            </span>
            <h2 className="text-2xl font-black text-white tracking-tight">Edit profile</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center shadow-lg transition active:scale-90"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-500/20 border border-rose-500/60 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Mascot Selector Section matching Image 2 */}
        <div className="mt-4 p-4 bg-[#080d1a] border border-slate-800 rounded-2xl">
          <label className="text-xs font-bold text-emerald-400 mb-3 block">
            Choose a mascot or upload an appropriate profile image
          </label>

          {/* 32 Mascot Grid (4 rows x 8 columns) */}
          <div className="grid grid-cols-8 gap-2.5 max-h-56 overflow-y-auto p-1">
            {MASCOTS.map((m) => {
              const isSelected = selectedMascot === m.id && !customAvatarUrl;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    sounds.playClick();
                    setSelectedMascot(m.id);
                    setCustomAvatarUrl('');
                  }}
                  className={`h-12 rounded-xl flex items-center justify-center text-2xl transition border-2 ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.4)] scale-105'
                      : 'border-slate-800 bg-[#0d162b] hover:border-slate-600 hover:bg-[#121f3d]'
                  }`}
                  title={m.name}
                >
                  <span>{m.emoji}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Upload Section */}
          <div className="mt-4 p-3 border border-dashed border-slate-700 rounded-xl bg-[#0b1429]">
            <span className="text-xs font-bold text-white block">Upload your own image</span>
            <span className="text-[10px] text-stone-400 block mb-2">
              JPG, PNG or WebP · local appropriateness scan required
            </span>

            <div className="flex items-center gap-3">
              <label className="cursor-pointer px-4 py-2 bg-slate-800 hover:bg-slate-700 text-stone-200 text-xs font-bold rounded-xl border border-slate-600 flex items-center gap-2 transition">
                <Upload className="w-4 h-4 text-cyan-400" />
                <span>Choose File</span>
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-stone-400 truncate max-w-xs">
                {customAvatarUrl ? 'Custom image loaded ✓' : 'No file chosen'}
              </span>
            </div>
          </div>
        </div>

        {/* Form Inputs matching Image 2 */}
        <div className="mt-4 space-y-4">
          {/* Username */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-300">Username</label>
              <span className="text-[10px] text-stone-400">Change once every 7 days</span>
            </div>
            <input
              type="text"
              maxLength={64}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 transition"
              placeholder="PalaceQueen99"
            />
          </div>

          {/* Display Name */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-300">Display name</label>
              <span className="text-[10px] text-stone-400">Up to 64 characters</span>
            </div>
            <input
              type="text"
              maxLength={64}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-emerald-400 transition"
              placeholder="Gaming Queen"
            />
          </div>

          {/* Bio */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-stone-300">Bio</label>
              <span className="text-[10px] text-stone-400">{bio.length}/1000</span>
            </div>
            <textarea
              maxLength={1000}
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-emerald-400 transition resize-none font-mono text-xs"
              placeholder="Four pawns, one mission. Living life one roll at a time."
            />
          </div>
        </div>

        {/* Green Save Changes Button matching Image 2 */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full py-3.5 bg-emerald-400 hover:bg-emerald-300 text-stone-950 font-black text-base rounded-2xl shadow-[0_4px_20px_rgba(52,211,153,0.4)] transition active:scale-98 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>Save changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
