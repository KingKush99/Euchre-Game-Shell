import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Upload,
  Image as ImageIcon,
  Check,
  Trash2,
  Sparkles,
  Layers,
  Palette,
  Eye,
  RotateCcw,
} from 'lucide-react';
import {
  getCustomAssets,
  saveCustomCardBack,
  saveCustomCardFront,
  saveCustomTableTheme,
  clearCustomAsset,
  CustomAssetsState,
} from '../utils/customAssets';
import { getBicycleRiderDataUrl } from '../utils/bicycleBacks';
import { BicycleCard } from './BicycleCard';
import { sounds } from '../utils/soundEffects';

interface CustomAssetsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomAssetsModal: React.FC<CustomAssetsModalProps> = ({ isOpen, onClose }) => {
  const [assets, setAssets] = useState<CustomAssetsState>(getCustomAssets());
  const [activeTab, setActiveTab] = useState<'cardBack' | 'cardFront' | 'tableTheme'>('cardBack');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAssets(getCustomAssets());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage('Please upload an image file (PNG, JPG, or WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      let success = false;
      if (activeTab === 'cardBack') {
        success = saveCustomCardBack(dataUrl);
      } else if (activeTab === 'cardFront') {
        success = saveCustomCardFront(dataUrl);
      } else if (activeTab === 'tableTheme') {
        success = saveCustomTableTheme(dataUrl);
      }

      if (success) {
        sounds.playWin();
        setAssets(getCustomAssets());
        setStatusMessage('Saved permanently! Your custom visual is active across all tables.');
        setTimeout(() => setStatusMessage(null), 4000);
      } else {
        setStatusMessage('Error saving image. Try a smaller image file (< 2MB).');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleClear = (type: 'cardBack' | 'cardFront' | 'tableTheme') => {
    sounds.playClick();
    clearCustomAsset(type);
    setAssets(getCustomAssets());
    setStatusMessage('Reverted to default saloon art.');
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/85 backdrop-blur-md animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-2xl bg-[#0e1626] border-2 border-amber-500/80 rounded-3xl p-6 shadow-2xl text-amber-50 flex flex-col gap-5 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-500/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-xl shadow-lg border border-amber-300">
              🎨
            </div>
            <div>
              <h2 className="text-lg font-black tracking-wide text-amber-200">
                PERMANENT CARD & THEME UPLOADER
              </h2>
              <p className="text-xs text-amber-400/80 font-medium">
                Upload custom card backs, faces, or saloon themes stored permanently in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 gap-2 bg-stone-950/70 p-1.5 rounded-2xl border border-stone-800">
          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('cardBack');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'cardBack'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Card Back</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('cardFront');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'cardFront'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Card Front</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setActiveTab('tableTheme');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'tableTheme'
                ? 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400'
                : 'text-stone-400 hover:text-white'
            }`}
          >
            <Palette className="w-4 h-4" />
            <span>Table Theme Felt</span>
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div className="px-4 py-2 bg-emerald-500/20 border border-emerald-400/50 rounded-xl text-emerald-300 text-xs font-bold text-center animate-in fade-in">
            {statusMessage}
          </div>
        )}

        {/* Active Tab Content */}
        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-stone-950/60 border border-stone-800 rounded-2xl">
          {/* Preview Canvas */}
          <div className="flex flex-col items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-400">
              Live Preview
            </span>
            {activeTab === 'cardBack' && (
              <div className="w-32 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl flex items-center justify-center bg-stone-900 relative">
                {assets.cardBackUrl ? (
                  <img
                    src={assets.cardBackUrl}
                    alt="Custom Card Back"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#8b181b] to-[#450a0a] p-2 flex flex-col items-center justify-center border-4 border-amber-300/40 text-center">
                    <span className="text-2xl">⚜️</span>
                    <span className="text-[10px] font-black text-amber-200 mt-1 uppercase">
                      Default Vintage Saloon
                    </span>
                  </div>
                )}
                {assets.cardBackUrl && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-stone-950 font-black text-[8px] rounded">
                    CUSTOM
                  </span>
                )}
              </div>
            )}

            {activeTab === 'cardFront' && (
              <div className="w-32 h-44 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl flex items-center justify-center bg-stone-900 relative">
                {assets.cardFrontUrl ? (
                  <img
                    src={assets.cardFrontUrl}
                    alt="Custom Card Front"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#fffdfa] p-2 flex flex-col items-center justify-between border-2 border-stone-300 text-stone-900">
                    <div className="w-full flex justify-between font-serif font-black text-sm">
                      <span>A</span>
                      <span>♠</span>
                    </div>
                    <span className="text-4xl text-stone-950 font-serif">♠</span>
                    <div className="w-full flex justify-between font-serif font-black text-sm rotate-180">
                      <span>A</span>
                      <span>♠</span>
                    </div>
                  </div>
                )}
                {assets.cardFrontUrl && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-stone-950 font-black text-[8px] rounded">
                    CUSTOM
                  </span>
                )}
              </div>
            )}

            {activeTab === 'tableTheme' && (
              <div className="w-48 h-32 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-2xl flex items-center justify-center bg-stone-900 relative">
                {assets.tableThemeUrl ? (
                  <img
                    src={assets.tableThemeUrl}
                    alt="Custom Table Theme"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#065f46] via-[#047857] to-[#022c22] flex flex-col items-center justify-center border-4 border-amber-900 p-2 text-center">
                    <span className="text-xl">♠ ♥ ♦ ♣</span>
                    <span className="text-[10px] font-black text-emerald-200 mt-1 uppercase">
                      Texas Emerald Saloon Felt
                    </span>
                  </div>
                )}
                {assets.tableThemeUrl && (
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-emerald-500 text-stone-950 font-black text-[8px] rounded">
                    CUSTOM
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Upload and Controls Area */}
          <div className="flex-1 flex flex-col gap-3 text-left">
            <h4 className="text-sm font-black text-white">
              {activeTab === 'cardBack' && 'Custom Card Back Artwork'}
              {activeTab === 'cardFront' && 'Custom Card Face Artwork'}
              {activeTab === 'tableTheme' && 'Custom Table Felt / Room Theme'}
            </h4>
            <p className="text-xs text-stone-300 leading-relaxed">
              Upload any image from your computer or device. It is encoded and saved permanently in
              your local storage so it will appear on all 3D tables, cards in hand, and saloon felts
              every time you play.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/webp"
              onChange={handleFileUpload}
              className="hidden"
            />

            {activeTab === 'cardBack' && (
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-black uppercase text-amber-400">
                  Select Official Bicycle Rider Back:
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      sounds.playWin();
                      const blueUrl = getBicycleRiderDataUrl('blue');
                      saveCustomCardBack(blueUrl);
                      setAssets(getCustomAssets());
                      setStatusMessage('Active: Iconic Blue Bicycle Rider Back!');
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-[#152a6b] hover:bg-[#1e3a8a] text-white border border-blue-400/80 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
                  >
                    <span>🔵</span>
                    <span>Blue Rider Back</span>
                  </button>

                  <button
                    onClick={() => {
                      sounds.playWin();
                      const redUrl = getBicycleRiderDataUrl('red');
                      saveCustomCardBack(redUrl);
                      setAssets(getCustomAssets());
                      setStatusMessage('Active: Iconic Red Bicycle Rider Back!');
                      setTimeout(() => setStatusMessage(null), 3000);
                    }}
                    className="px-3 py-1.5 bg-[#b91c1c] hover:bg-[#dc2626] text-white border border-red-400/80 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow transition active:scale-95 cursor-pointer"
                  >
                    <span>🔴</span>
                    <span>Red Rider Back</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload New Image</span>
              </button>

              {((activeTab === 'cardBack' && assets.cardBackUrl) ||
                (activeTab === 'cardFront' && assets.cardFrontUrl) ||
                (activeTab === 'tableTheme' && assets.tableThemeUrl)) && (
                <button
                  onClick={() => handleClear(activeTab)}
                  className="px-3.5 py-2.5 bg-stone-800 hover:bg-stone-700 text-rose-300 font-bold text-xs uppercase rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Reset to Default</span>
                </button>
              )}
            </div>

            <div className="text-[11px] text-stone-400 flex items-center gap-1.5 mt-1 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Storage status: Permanent • Instant 3D texture update</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-2 border-t border-stone-800">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white font-black text-xs uppercase rounded-xl transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
