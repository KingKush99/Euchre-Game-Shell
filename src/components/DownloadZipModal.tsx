import React, { useState } from 'react';
import { X, Download, Copy, Check, ExternalLink, AlertCircle, Github } from 'lucide-react';
import { sounds } from '../utils/soundEffects';

interface DownloadZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadZipModal: React.FC<DownloadZipModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  // Compute the current absolute URL
  const hostUrl = typeof window !== 'undefined' && window.location.origin ? window.location.origin : 'https://ais-dev-7xut2ds6sjvyll5nzxl7oi-374909100661.us-west2.run.app';
  const fullDownloadUrl = `${hostUrl}/api/download-zip`;

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(fullDownloadUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleTriggerBlobDownload = async () => {
    sounds.playClick();
    setIsDownloading(true);
    setDownloadStatus('Fetching project archive...');

    try {
      const response = await fetch('/api/download-zip');
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      setDownloadStatus('Preparing download file...');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'euchre-paradise-source.zip';
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        window.URL.revokeObjectURL(blobUrl);
        document.body.removeChild(link);
        setIsDownloading(false);
        setDownloadStatus('Download initiated! If your browser blocked it, open the direct link below in a new tab.');
      }, 500);
    } catch (err) {
      setIsDownloading(false);
      setDownloadStatus('Browser iframe blocked direct download. Please open the link in a new tab below.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="bg-[#0b1020] border-2 border-cyan-500/70 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl text-stone-100 space-y-5 relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center border border-cyan-500/40">
              <Download className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase text-white tracking-wider">
                Download Project (.ZIP)
              </h2>
              <span className="text-[11px] text-cyan-400 font-mono font-bold">
                Euchre Paradise Complete Source Code
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-stone-300 flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice regarding Sandboxed Iframe */}
        <div className="bg-amber-950/40 border border-amber-500/50 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-amber-200">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Why direct downloads can get blocked:</span>
            <p className="text-[11px] text-amber-300/90 leading-relaxed">
              Google AI Studio displays apps inside a sandboxed iframe. Modern web browsers automatically restrict file downloads initiated inside iframes.
              Open the direct link in a new tab or paste it in your browser address bar to download instantly!
            </p>
          </div>
        </div>

        {/* Action 1: Open in New Tab Button */}
        <div className="space-y-2">
          <a
            href={fullDownloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => sounds.playWin()}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-stone-950 font-black text-sm uppercase rounded-2xl shadow-xl transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <ExternalLink className="w-4 h-4 stroke-[2.5]" />
            <span>Open & Download in New Tab</span>
          </a>

          {/* Action 2: In-frame Blob Download Button */}
          <button
            onClick={handleTriggerBlobDownload}
            disabled={isDownloading}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-stone-200 font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>{isDownloading ? 'Packaging Download...' : 'Try In-App Direct Download'}</span>
          </button>

          {downloadStatus && (
            <p className="text-[11px] text-center font-mono text-cyan-300 bg-slate-900/80 p-2 rounded-xl border border-slate-800">
              {downloadStatus}
            </p>
          )}
        </div>

        {/* Action 3: Copy Direct URL Box */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <label className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block">
            Direct Download URL (Paste in new browser tab):
          </label>
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-700 rounded-xl p-2">
            <input
              type="text"
              readOnly
              value={fullDownloadUrl}
              className="bg-transparent text-cyan-300 text-xs font-mono flex-1 outline-none select-all px-1 truncate"
            />
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-stone-950 font-black text-xs rounded-lg transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* GitHub Push Help */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-3 text-xs space-y-1.5">
          <div className="flex items-center gap-2 text-stone-300 font-bold">
            <Github className="w-4 h-4 text-white" />
            <span>Why did GitHub push fail?</span>
          </div>
          <p className="text-[11px] text-stone-400 leading-relaxed">
            AI Studio communicates directly with GitHub's API. If GitHub push failed, your GitHub OAuth token expired or the selected repo on GitHub is not empty. Re-connecting GitHub in AI Studio or choosing an empty repo resolves it.
          </p>
        </div>
      </div>
    </div>
  );
};
