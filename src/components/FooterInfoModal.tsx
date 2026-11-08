import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Send,
  Download,
  Share2,
  Shield,
  HelpCircle,
  Award,
  Calendar,
  Globe,
  Smartphone,
  MessageSquare,
  Sparkles,
  ExternalLink,
  Volume2,
  Eye,
  Sliders,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import confetti from 'canvas-confetti';

export type FooterSectionType =
  | 'accessibility_options'
  | 'suggestions'
  | 'about_us'
  | 'press_kit'
  | 'newsletter'
  | 'tournaments'
  | 'registration'
  | 'prizes'
  | 'awards'
  | 'player_of_month'
  | 'hall_of_fame'
  | 'credits'
  | 'terms'
  | 'privacy'
  | 'cookies'
  | 'community'
  | 'contact'
  | 'help_center'
  | 'report_bug'
  | 'feature_request'
  | 'social_media'
  | 'ios_app'
  | 'android_app'
  | 'language_selector';

interface FooterInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  section: FooterSectionType | null;
  onOpenFAQ?: () => void;
  onClaimBonusChips?: (amount: number) => void;
}

export const FooterInfoModal: React.FC<FooterInfoModalProps> = ({
  isOpen,
  onClose,
  section,
  onOpenFAQ,
  onClaimBonusChips,
}) => {
  const [suggestionText, setSuggestionText] = useState('');
  const [suggestionSent, setSuggestionSent] = useState(false);

  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

  const [bugDescription, setBugDescription] = useState('');
  const [bugCategory, setBugCategory] = useState('Gameplay');
  const [bugSubmitted, setBugSubmitted] = useState(false);

  const [highContrast, setHighContrast] = useState(false);
  const [soundCues, setSoundCues] = useState(true);
  const [fontSizeLarge, setFontSizeLarge] = useState(false);

  const [selectedLanguage, setSelectedLanguage] = useState('English');

  if (!isOpen || !section) return null;

  const handleSendSuggestion = () => {
    if (!suggestionText.trim()) return;
    sounds.playWin();
    confetti({ particleCount: 50, spread: 70 });
    setSuggestionSent(true);
    if (onClaimBonusChips) onClaimBonusChips(100);
    setTimeout(() => {
      setSuggestionSent(false);
      setSuggestionText('');
      onClose();
    }, 2000);
  };

  const handleSubscribeNewsletter = () => {
    if (!newsletterEmail.trim()) return;
    sounds.playWin();
    confetti({ particleCount: 60, spread: 80 });
    setNewsletterSubscribed(true);
    if (onClaimBonusChips) onClaimBonusChips(250);
    setTimeout(() => {
      setNewsletterSubscribed(false);
      setNewsletterEmail('');
      onClose();
    }, 2200);
  };

  const handleReportBug = () => {
    if (!bugDescription.trim()) return;
    sounds.playWin();
    setBugSubmitted(true);
    if (onClaimBonusChips) onClaimBonusChips(150);
    setTimeout(() => {
      setBugSubmitted(false);
      setBugDescription('');
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-text">
      <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#0c1424] border-2 border-slate-700 rounded-3xl p-6 shadow-2xl text-stone-100 flex flex-col justify-between overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {section.startsWith('social')
                ? '🌐'
                : section.includes('app')
                ? '📱'
                : section.includes('tournament') || section.includes('prize') || section.includes('award')
                ? '🏆'
                : section.includes('accessibility')
                ? '👁️'
                : '📜'}
            </span>
            <h2 className="text-base sm:text-lg font-black uppercase tracking-wider text-white">
              {section === 'accessibility_options' && 'Accessibility Options'}
              {section === 'suggestions' && 'Submit a Suggestion'}
              {section === 'about_us' && 'About Euchre Sovereigns Texas Palace'}
              {section === 'press_kit' && 'Press Kit & Media Assets'}
              {section === 'newsletter' && 'Weekly Sovereign Newsletter'}
              {section === 'tournaments' && 'Euchre Tournaments & Championships'}
              {section === 'registration' && 'Player Competition Registration'}
              {section === 'prizes' && 'Tournament Prizes & Cash Chip Payouts'}
              {section === 'awards' && 'Frontier Honor Badges & Awards'}
              {section === 'player_of_month' && 'Player of the Month Spotlight'}
              {section === 'hall_of_fame' && 'Frontier Hall of Fame'}
              {section === 'credits' && 'Credits & Development Team'}
              {section === 'terms' && 'Terms of Service'}
              {section === 'privacy' && 'Privacy Policy'}
              {section === 'cookies' && 'Cookie Policy'}
              {section === 'community' && 'Community & Fair Play Guidelines'}
              {section === 'contact' && 'Contact Frontier Support'}
              {section === 'help_center' && 'Knowledgebase & Help Center'}
              {section === 'report_bug' && 'Report a Bug'}
              {section === 'feature_request' && 'Community Feature Requests'}
              {section === 'social_media' && 'Official Social Media Channels'}
              {section === 'ios_app' && 'Download iOS Mobile App'}
              {section === 'android_app' && 'Download Android Mobile App'}
              {section === 'language_selector' && 'Language & Region Settings'}
            </h2>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 pr-1 text-xs sm:text-sm text-slate-300 leading-relaxed space-y-4">
          
          {/* ACCESSIBILITY OPTIONS */}
          {section === 'accessibility_options' && (
            <div className="space-y-4">
              <p className="text-slate-300">
                Customize your gameplay experience for optimal readability, audio cues, and comfort.
              </p>

              <div className="space-y-2.5">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-sky-400" /> High Contrast Visuals
                    </div>
                    <div className="text-[11px] text-slate-400">Enhance borders and card rank contrast on the felt.</div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setHighContrast(!highContrast);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                      highContrast ? 'bg-sky-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {highContrast ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Volume2 className="w-4 h-4 text-amber-400" /> Audio Turn Cues
                    </div>
                    <div className="text-[11px] text-slate-400">Play distinctive chime sounds when it is your turn to bid or play.</div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setSoundCues(!soundCues);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                      soundCues ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {soundCues ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Sliders className="w-4 h-4 text-emerald-400" /> Large Card Rank Typography
                    </div>
                    <div className="text-[11px] text-slate-400">Increase font scale on held cards and trick indicators.</div>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setFontSizeLarge(!fontSizeLarge);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-black text-xs transition cursor-pointer ${
                      fontSizeLarge ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {fontSizeLarge ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUGGESTIONS */}
          {section === 'suggestions' && (
            <div className="space-y-3">
              <p className="text-slate-300">
                Have an idea for a new game mode, saloon theme, or custom hat? Send it directly to our team! Submitting earns <strong>100 Free Chips</strong>.
              </p>
              {suggestionSent ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Thank you partner! Your suggestion was received and 100 chips were credited!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    rows={4}
                    value={suggestionText}
                    onChange={(e) => setSuggestionText(e.target.value)}
                    placeholder="Tell us what you would love to see in Euchre Sovereigns..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs sm:text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSendSuggestion}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow transition active:scale-95"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit & Claim 100 Chips</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ABOUT US */}
          {section === 'about_us' && (
            <div className="space-y-3">
              <p>
                <strong>Euchre Sovereigns Texas Palace</strong> is the premier 3D frontier card-playing experience built natively for modern web and mobile. Inspired by classic western adventures and the strategy of Euchre, our engine blends rich saloon physics, custom 3D avatar customizers, interactive campaign towns, and high-stakes tournament competition.
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-black text-sm">3D Overhead Saloon</div>
                  <div className="text-[11px] text-slate-400 mt-1">Authentic top-down perspective showing all 4 players holding 5 cards.</div>
                </div>
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                  <div className="text-purple-400 font-black text-sm">Full Frontier Rules</div>
                  <div className="text-[11px] text-slate-400 mt-1">Right and Left Bowers, Loner calls, stick the dealer, and live match scoring.</div>
                </div>
              </div>
            </div>
          )}

          {/* PRESS KIT */}
          {section === 'press_kit' && (
            <div className="space-y-3">
              <p>Media kit, high-resolution logos, screenshots, and game documentation for journalists and content creators.</p>
              <div className="flex flex-col gap-2">
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>🎨 High-Res Saloon Assets & Logos (ZIP)</span>
                  <button onClick={() => alert('Downloading Press Kit Assets (12MB)...')} className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white">Download</button>
                </div>
                <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span>📄 Factsheet & Studio Press Release (PDF)</span>
                  <button onClick={() => alert('Downloading Factsheet PDF...')} className="px-3 py-1 bg-sky-600 hover:bg-sky-500 rounded-lg text-xs font-bold text-white">Download</button>
                </div>
              </div>
            </div>
          )}

          {/* NEWSLETTER */}
          {section === 'newsletter' && (
            <div className="space-y-3">
              <p>Subscribe to our weekly dispatch for secret chip codes, tournament announcements, and patch notes. Earn <strong>250 Bonus Chips</strong> instantly!</p>
              {newsletterSubscribed ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Welcome partner! 250 bonus chips added to your bankroll!</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <button
                    onClick={handleSubscribeNewsletter}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow transition active:scale-95"
                  >
                    Subscribe
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TOURNAMENTS & PRIZES */}
          {(section === 'tournaments' || section === 'prizes' || section === 'registration') && (
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-950 to-indigo-950 border border-purple-500/50 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="font-black text-white text-base">Amarillo Championship $50,000 Grand Cup</div>
                  <div className="text-xs text-purple-300 mt-0.5">Every Saturday • 4 Rounds • Double Elimination</div>
                </div>
                <button onClick={() => alert('You are registered for the next Grand Cup tournament!')} className="px-4 py-2 bg-purple-500 hover:bg-purple-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow">
                  Register
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-amber-400 font-black text-sm">1st Place</div>
                  <div className="text-white font-bold">$25,000 Sovereigns</div>
                  <div className="text-[10px] text-slate-400">Golden Trophy Badge</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-slate-300 font-black text-sm">2nd Place</div>
                  <div className="text-white font-bold">$15,000 Sovereigns</div>
                  <div className="text-[10px] text-slate-400">Silver Belt Buckle</div>
                </div>
                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                  <div className="text-amber-600 font-black text-sm">3rd Place</div>
                  <div className="text-white font-bold">$10,000 Sovereigns</div>
                  <div className="text-[10px] text-slate-400">Bronze Spurs</div>
                </div>
              </div>
            </div>
          )}

          {/* AWARDS & PLAYER OF MONTH & HALL OF FAME */}
          {(section === 'awards' || section === 'player_of_month' || section === 'hall_of_fame' || section === 'credits') && (
            <div className="space-y-3">
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-4 flex items-center gap-3">
                <span className="text-3xl">🤠</span>
                <div>
                  <div className="font-black text-amber-300 text-sm">Current Player of the Month: Tex_Red_99</div>
                  <div className="text-xs text-slate-300">142 Matches Won • 88% Trick Conversion • Conquered All 6 Frontier Towns</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 space-y-1">
                <div>• <strong>Hall of Fame #1:</strong> Maverick Pete - 48 Consecutive Marches</div>
                <div>• <strong>Hall of Fame #2:</strong> Dakota Saloon Belle - 1,200,000 Gold Sovereigns</div>
                <div>• <strong>Lead Engineer & Design:</strong> DeepMind & Antigravity Sovereign Studio</div>
              </div>
            </div>
          )}

          {/* LEGAL (TERMS, PRIVACY, COOKIES, COMMUNITY) */}
          {(section === 'terms' || section === 'privacy' || section === 'cookies' || section === 'community') && (
            <div className="space-y-2.5 text-xs leading-relaxed text-slate-300 bg-slate-950/70 p-3 rounded-2xl border border-slate-800">
              <h4 className="font-bold text-white text-sm">Fair Play Guarantee & Terms</h4>
              <p>
                All cards are dealt using cryptographically verified Fisher-Yates random number generation. Bots adhere strictly to standard Euchre probability tables and do not have access to unrevealed cards in players' hands.
              </p>
              <p>
                Virtual chips and sovereigns have no real-world monetary value and cannot be exchanged for cash. Harassment, collusive signaling, or intentional rage-quits are violations of our Saloon Community Guidelines and subject to match forfeiture.
              </p>
            </div>
          )}

          {/* SUPPORT & REPORT BUG */}
          {(section === 'contact' || section === 'help_center' || section === 'report_bug' || section === 'feature_request') && (
            <div className="space-y-3">
              <p>Experiencing an issue or have feedback for our saloon pit bosses? Submit your report below for <strong>150 Chips</strong> reward!</p>
              {bugSubmitted ? (
                <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Report submitted! Our development marshals are on it!</span>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400">Category:</span>
                    <select
                      value={bugCategory}
                      onChange={(e) => setBugCategory(e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-2 py-1 text-xs text-white"
                    >
                      <option value="Gameplay">Gameplay & Trick Rules</option>
                      <option value="Visuals">3D Visuals & Camera</option>
                      <option value="Audio">Sound & Music</option>
                      <option value="Economy">Chips & Shop</option>
                    </select>
                  </div>
                  <textarea
                    rows={3}
                    value={bugDescription}
                    onChange={(e) => setBugDescription(e.target.value)}
                    placeholder="Describe what happened..."
                    className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleReportBug}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-xl shadow transition"
                    >
                      Submit Report (150 Chips)
                    </button>
                    {onOpenFAQ && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenFAQ();
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl"
                      >
                        Check FAQs First
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SOCIAL MEDIA */}
          {section === 'social_media' && (
            <div className="space-y-3">
              <p>Connect with over 150,000 frontier card players across our official social channels:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <a href="https://facebook.com" target="_blank" rel="noreferrer" className="p-3 bg-[#1877f2]/20 border border-[#1877f2]/40 rounded-xl flex items-center gap-2 text-blue-300 hover:bg-[#1877f2]/30">
                  <span>🟦</span> <span>Facebook Community</span>
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" className="p-3 bg-stone-900 border border-stone-700 rounded-xl flex items-center gap-2 text-white hover:bg-stone-800">
                  <span>❌</span> <span>X / Twitter News</span>
                </a>
                <a href="https://instagram.com" target="_blank" rel="noreferrer" className="p-3 bg-pink-950/40 border border-pink-500/40 rounded-xl flex items-center gap-2 text-pink-300 hover:bg-pink-900/40">
                  <span>📷</span> <span>Instagram Highlights</span>
                </a>
                <a href="https://snapchat.com" target="_blank" rel="noreferrer" className="p-3 bg-yellow-950/40 border border-yellow-500/40 rounded-xl flex items-center gap-2 text-yellow-300 hover:bg-yellow-900/40">
                  <span>👻</span> <span>Snapchat Stories</span>
                </a>
                <a href="https://youtube.com" target="_blank" rel="noreferrer" className="p-3 bg-red-950/40 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-300 hover:bg-red-900/40">
                  <span>📺</span> <span>YouTube Saloon Streams</span>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="p-3 bg-blue-950/40 border border-blue-500/40 rounded-xl flex items-center gap-2 text-blue-300 hover:bg-blue-900/40">
                  <span>💼</span> <span>LinkedIn Studio Careers</span>
                </a>
              </div>
            </div>
          )}

          {/* MOBILE APPS (iOS & ANDROID) */}
          {(section === 'ios_app' || section === 'android_app') && (
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-500/40 rounded-2xl flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl shadow-xl">
                  {section === 'ios_app' ? '🍎' : '🤖'}
                </div>
                <div>
                  <div className="font-black text-white text-base">
                    {section === 'ios_app' ? 'Euchre Sovereigns for iOS' : 'Euchre Sovereigns for Android'}
                  </div>
                  <div className="text-xs text-blue-200 mt-0.5">
                    Full 3D Saloon Experience • Offline Play • Native Haptics
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center gap-2">
                <div className="text-xs text-slate-300">Scan QR or tap to open directly on your mobile device:</div>
                <div className="w-32 h-32 bg-white p-2 rounded-xl flex items-center justify-center text-stone-950 font-mono text-[9px] shadow-lg">
                  [ MOBILE_APP_QR ]
                </div>
                <button
                  onClick={() => alert(`Redirecting to ${section === 'ios_app' ? 'Apple App Store' : 'Google Play Store'}...`)}
                  className={`mt-1 px-6 py-2.5 rounded-xl font-black text-xs uppercase text-white shadow-xl transition active:scale-95 ${
                    section === 'ios_app' ? 'bg-[#2563eb] hover:bg-blue-600' : 'bg-[#16a34a] hover:bg-green-600'
                  }`}
                >
                  {section === 'ios_app' ? 'Open in App Store' : 'Open in Google Play'}
                </button>
              </div>
            </div>
          )}

          {/* LANGUAGE SELECTOR */}
          {section === 'language_selector' && (
            <div className="space-y-3">
              <p>Select your preferred language for cards, interface, and audio voice lines:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {['English', 'Español', 'Français', 'Deutsch', 'Português', 'Italiano', '日本語', '한국어', 'Nederlands'].map((lang) => (
                  <button
                    key={lang}
                    onClick={() => {
                      sounds.playClick();
                      setSelectedLanguage(lang);
                      alert(`Language set to ${lang}!`);
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                      selectedLanguage === lang
                        ? 'bg-amber-500 text-stone-950 border-amber-300 shadow'
                        : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span>{lang}</span>
                    {selectedLanguage === lang && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
          <button
            onClick={() => {
              sounds.playClick();
              onClose();
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
