import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Bell,
  Volume2,
  Monitor,
  Lock,
  Accessibility,
  Globe,
  Gamepad2,
  ShieldAlert,
  Database,
  UserCheck,
  Search,
  ChevronLeft,
  Check,
  AlertTriangle,
  RotateCcw,
  Mic,
  Smartphone,
  Laptop,
  Trash2,
  Shield,
  Key,
  Download,
  Info,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { DownloadZipModal } from './DownloadZipModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SettingsCategoryId =
  | 'notifications'
  | 'audio'
  | 'visual'
  | 'privacy'
  | 'accessibility'
  | 'language'
  | 'gameplay'
  | 'safety'
  | 'data_storage'
  | 'account_security';

interface CategoryDef {
  id: SettingsCategoryId;
  title: string;
  subtitle: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryDef[] = [
  { id: 'notifications', title: 'Notifications', subtitle: 'Manage game, social, marketplace, and system alerts.', icon: Bell },
  { id: 'audio', title: 'Audio', subtitle: 'Control music, effects, voices, and voice chat output.', icon: Volume2 },
  { id: 'visual', title: 'Visual', subtitle: 'Display resolution, graphics quality, UI scale, and board FX.', icon: Monitor },
  { id: 'privacy', title: 'Privacy', subtitle: 'Profile visibility, social privacy, and marketplace records.', icon: Lock },
  { id: 'accessibility', title: 'Accessibility', subtitle: 'Vision assistance, motion controls, input, and audio cues.', icon: Accessibility },
  { id: 'language', title: 'Language', subtitle: 'Select text, voice lines, subtitles, and regional formats.', icon: Globe },
  { id: 'gameplay', title: 'Gameplay', subtitle: 'General game pace, assistance, and game-specific rules.', icon: Gamepad2 },
  { id: 'safety', title: 'Safety', subtitle: 'Profanity filters, blocked players, and family safe mode.', icon: ShieldAlert },
  { id: 'data_storage', title: 'Data & Storage', subtitle: 'Manage local storage, cached media, replays, and cloud sync.', icon: Database },
  { id: 'account_security', title: 'Account & Security', subtitle: 'Profile details, 2FA, active sessions, and data exports.', icon: UserCheck },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<SettingsCategoryId>('notifications');
  const [mobileSubCategory, setMobileSubCategory] = useState<SettingsCategoryId | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSavedToast, setShowSavedToast] = useState(false);
  const [showZipModal, setShowZipModal] = useState(false);

  // Confirmation Modals State
  const [confirmDeleteCache, setConfirmDeleteCache] = useState(false);
  const [confirmDeleteAccount, setConfirmDeleteAccount] = useState(false);
  const [confirmDisplayChange, setConfirmDisplayChange] = useState(false);
  const [displayCountdown, setDisplayCountdown] = useState(15);

  // Microphone Test State
  const [isTestingMic, setIsTestingMic] = useState(false);
  const [micLevel, setMicLevel] = useState(0);

  // 1. NOTIFICATIONS STATE
  const [enableNotifications, setEnableNotifications] = useState(true);
  const [notificationSounds, setNotificationSounds] = useState(true);
  const [showPreviews, setShowPreviews] = useState(true);
  const [notifyFriendRequests, setNotifyFriendRequests] = useState(true);
  const [notifyGameInvites, setNotifyGameInvites] = useState(true);
  const [notifyMatchReady, setNotifyMatchReady] = useState(true);
  const [notifyTurn, setNotifyTurn] = useState(true);
  const [notifyTournaments, setNotifyTournaments] = useState(true);
  const [notifyChallenges, setNotifyChallenges] = useState(false);
  const [auctionEndingAlert, setAuctionEndingAlert] = useState(true);
  const [outbidAlert, setOutbidAlert] = useState(true);
  const [auctionWonAlert, setAuctionWonAlert] = useState(true);
  const [itemSoldAlert, setItemSoldAlert] = useState(true);
  const [offerReceivedAlert, setOfferReceivedAlert] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(false);
  const [watchlistUpdates, setWatchlistUpdates] = useState(true);
  const [notifyMessages, setNotifyMessages] = useState(true);
  const [notifyFriendActivity, setNotifyFriendActivity] = useState(true);
  const [notifyClubActivity, setNotifyClubActivity] = useState(false);
  const [deliveryInGame, setDeliveryInGame] = useState(true);
  const [deliveryDesktop, setDeliveryDesktop] = useState(true);
  const [deliveryEmail, setDeliveryEmail] = useState(false);
  const [dndEnabled, setDndEnabled] = useState(false);
  const [dndStart, setDndStart] = useState('22:00');
  const [dndEnd, setDndEnd] = useState('08:00');

  // 2. AUDIO STATE
  const [masterVolume, setMasterVolume] = useState(85);
  const [muteAll, setMuteAll] = useState(false);
  const [muteUnfocused, setMuteUnfocused] = useState(true);
  const [musicVolume, setMusicVolume] = useState(70);
  const [menuMusic, setMenuMusic] = useState(true);
  const [gameplayMusic, setGameplayMusic] = useState(true);
  const [effectsVolume, setEffectsVolume] = useState(90);
  const [cardSounds, setCardSounds] = useState(true);
  const [boardSounds, setBoardSounds] = useState(true);
  const [uiSounds, setUiSounds] = useState(true);
  const [packSounds, setPackSounds] = useState(true);
  const [marketplaceSounds, setMarketplaceSounds] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [characterVoiceLines, setCharacterVoiceLines] = useState(true);
  const [announcerVolume, setAnnouncerVolume] = useState(85);
  const [enableVoiceChat, setEnableVoiceChat] = useState(true);
  const [inputDevice, setInputDevice] = useState('Default Microphone (Realtek)');
  const [outputDevice, setOutputDevice] = useState('Default Headphones (Realtek)');
  const [micVolume, setMicVolume] = useState(75);
  const [voiceChatVolume, setVoiceChatVolume] = useState(80);
  const [pushToTalk, setPushToTalk] = useState(true);

  // 3. VISUAL STATE
  const [fullscreen, setFullscreen] = useState(true);
  const [windowMode, setWindowMode] = useState<'Fullscreen' | 'Borderless' | 'Windowed'>('Borderless');
  const [resolution, setResolution] = useState('1920x1080 (1080p)');
  const [refreshRate, setRefreshRate] = useState('144 Hz');
  const [vsync, setVsync] = useState(true);
  const [graphicsPreset, setGraphicsPreset] = useState<'Low' | 'Medium' | 'High' | 'Ultra'>('High');
  const [textureQuality, setTextureQuality] = useState('High');
  const [shadowQuality, setShadowQuality] = useState('High');
  const [effectsQuality, setEffectsQuality] = useState('Ultra');
  const [animationQuality, setAnimationQuality] = useState('High');
  const [antiAliasing, setAntiAliasing] = useState('TAA (4x)');
  const [uiScale, setUiScale] = useState('100%');
  const [textSize, setTextSize] = useState<'Normal' | 'Large' | 'Extra Large'>('Normal');
  const [menuBgAnim, setMenuBgAnim] = useState(true);
  const [characterAnims, setCharacterAnims] = useState(true);
  const [boardDetail, setBoardDetail] = useState('High Detail');
  const [cardDetail, setCardDetail] = useState('Ultra Painted');
  const [chipEffects, setChipEffects] = useState(true);

  // 4. PRIVACY STATE
  const [profileVisibility, setProfileVisibility] = useState<'Public' | 'Friends Only' | 'Private'>('Public');
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [showCurrentGame, setShowCurrentGame] = useState(true);
  const [showMatchHistory, setShowMatchHistory] = useState(true);
  const [showCollection, setShowCollection] = useState(true);
  const [showInventory, setShowInventory] = useState(true);
  const [showAchievements, setShowAchievements] = useState(true);
  const [whoCanFriend, setWhoCanFriend] = useState<'Everyone' | 'Friends of Friends' | 'Nobody'>('Everyone');
  const [whoCanMessage, setWhoCanMessage] = useState<'Everyone' | 'Friends' | 'Nobody'>('Friends');
  const [whoCanInvite, setWhoCanInvite] = useState<'Everyone' | 'Friends' | 'Nobody'>('Everyone');
  const [whoCanSpectate, setWhoCanSpectate] = useState<'Everyone' | 'Friends' | 'Nobody'>('Friends');
  const [showUsernameOnListings, setShowUsernameOnListings] = useState(true);
  const [showCollectionValue, setShowCollectionValue] = useState(true);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);

  // 5. ACCESSIBILITY STATE
  const [colorblindMode, setColorblindMode] = useState<'Off' | 'Protanopia' | 'Deuteranopia' | 'Tritanopia'>('Off');
  const [highContrastMode, setHighContrastMode] = useState(false);
  const [increaseUiContrast, setIncreaseUiContrast] = useState(false);
  const [suitColorAssistance, setSuitColorAssistance] = useState(true);
  const [clearSuitSymbols, setClearSuitSymbols] = useState(true);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [disableCameraShake, setDisableCameraShake] = useState(true);
  const [disableScreenFlash, setDisableScreenFlash] = useState(true);
  const [holdVsToggle, setHoldVsToggle] = useState<'Toggle' | 'Hold'>('Toggle');
  const [doubleClickSensitivity, setDoubleClickSensitivity] = useState(50);
  const [monoAudio, setMonoAudio] = useState(false);
  const [visualSoundIndicators, setVisualSoundIndicators] = useState(false);
  const [subtitleSupport, setSubtitleSupport] = useState(true);
  const [simplifiedInterface, setSimplifiedInterface] = useState(false);
  const [extendedTurnTimer, setExtendedTurnTimer] = useState(false);
  const [confirmImportantActions, setConfirmImportantActions] = useState(true);

  // 6. LANGUAGE STATE
  const [gameLanguage, setGameLanguage] = useState('English (US)');
  const [textLanguage, setTextLanguage] = useState('English (US)');
  const [voiceLanguage, setVoiceLanguage] = useState('English (Original)');
  const [subtitleLanguage, setSubtitleLanguage] = useState('English (US)');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [timeFormat, setTimeFormat] = useState('12-Hour (1:30 PM)');
  const [autoDetectLanguage, setAutoDetectLanguage] = useState(true);

  // 7. GAMEPLAY STATE
  const [confirmEndTurn, setConfirmEndTurn] = useState(false);
  const [confirmForfeit, setConfirmForfeit] = useState(true);
  const [confirmPurchaseInGame, setConfirmPurchaseInGame] = useState(true);
  const [showLegalMoves, setShowLegalMoves] = useState(true);
  const [showSuggestedMoves, setShowSuggestedMoves] = useState(true);
  const [showTooltips, setShowTooltips] = useState(true);
  const [showTurnTimer, setShowTurnTimer] = useState(true);
  const [autoSortCards, setAutoSortCards] = useState(true);
  const [animationSpeed, setAnimationSpeed] = useState<'Slow' | 'Normal' | 'Fast'>('Fast');
  const [autoAdvanceTurns, setAutoAdvanceTurns] = useState(false);
  const [tutorialPrompts, setTutorialPrompts] = useState(true);
  const [strategyHints, setStrategyHints] = useState(true);
  const [euchreAutoPassRound1, setEuchreAutoPassRound1] = useState(false);
  const [highlightBowers, setHighlightBowers] = useState(true);
  const [autoMuckPokerHands, setAutoMuckPokerHands] = useState(true);

  // 8. SAFETY STATE
  const [profanityFilter, setProfanityFilter] = useState(true);
  const [filterOffensiveUsernames, setFilterOffensiveUsernames] = useState(true);
  const [blockUnknownMessages, setBlockUnknownMessages] = useState(false);
  const [autoMuteReported, setAutoMuteReported] = useState(true);
  const [hideOffensiveContent, setHideOffensiveContent] = useState(true);
  const [hideUserMedia, setHideUserMedia] = useState(false);
  const [disableDMsFamily, setDisableDMsFamily] = useState(false);
  const [restrictUGC, setRestrictUGC] = useState(false);

  // 9. DATA & STORAGE STATE
  const [autoDownloadUpdates, setAutoDownloadUpdates] = useState(true);
  const [downloadHighResAssets, setDownloadHighResAssets] = useState(true);
  const [autoSaveReplays, setAutoSaveReplays] = useState(true);
  const [replayStorageLimit, setReplayStorageLimit] = useState('10 GB');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [lowBandwidthMode, setLowBandwidthMode] = useState(false);
  const [preloadMarketplaceMedia, setPreloadMarketplaceMedia] = useState(true);

  // 10. ACCOUNT & SECURITY STATE
  const [username] = useState('PalaceQueen99');
  const [displayName] = useState('GAMING QUEEN');
  const [email] = useState('queen@sequence.palace');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [loginNotifications, setLoginNotifications] = useState(true);

  // Body Scroll Lock Effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Display Confirmation Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (confirmDisplayChange && displayCountdown > 0) {
      timer = setInterval(() => {
        setDisplayCountdown((prev) => prev - 1);
      }, 1000);
    } else if (confirmDisplayChange && displayCountdown === 0) {
      setConfirmDisplayChange(false);
      setDisplayCountdown(15);
      sounds.playCardDrop();
    }
    return () => clearInterval(timer);
  }, [confirmDisplayChange, displayCountdown]);

  // Mic level simulation
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isTestingMic) {
      timer = setInterval(() => {
        setMicLevel(Math.floor(Math.random() * 85) + 15);
      }, 120);
    } else {
      setMicLevel(0);
    }
    return () => clearInterval(timer);
  }, [isTestingMic]);

  // Auto-save feedback trigger
  const triggerAutoSaveToast = () => {
    sounds.playClick();
    setShowSavedToast(true);
    setTimeout(() => setShowSavedToast(false), 2000);
  };

  // Search Results Filtering
  const filteredSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    const matches: { categoryId: SettingsCategoryId; label: string }[] = [];

    const check = (catId: SettingsCategoryId, term: string, label: string) => {
      if (term.toLowerCase().includes(q) || label.toLowerCase().includes(q)) {
        matches.push({ categoryId: catId, label });
      }
    };

    check('audio', 'Master Volume', 'Master Volume');
    check('audio', 'Music Volume', 'Music Volume');
    check('audio', 'Effects Volume', 'Effects Volume');
    check('audio', 'Voice Chat', 'Voice Chat & Microphone');
    check('notifications', 'Friend Requests', 'Friend Requests Notification');
    check('notifications', 'Turn Alerts', 'Turn Notifications');
    check('visual', 'Resolution', 'Display Resolution');
    check('visual', 'Graphics Quality', 'Graphics Preset');
    check('privacy', 'Profile Visibility', 'Profile Visibility (Public/Private)');
    check('accessibility', 'Colorblind Mode', 'Colorblind Mode');
    check('accessibility', 'High Contrast Mode', 'High Contrast Mode');
    check('language', 'Language', 'Game Language Selector');
    check('gameplay', 'Animation Speed', 'Card Animation Speed');
    check('safety', 'Profanity Filter', 'Chat Profanity Filter');
    check('data_storage', 'Local Storage', 'Clear Cached Storage');
    check('account_security', 'Two-Factor', 'Two-Factor Authentication');
    check('account_security', 'Delete Account', 'Delete Account');

    return matches;
  }, [searchQuery]);

  if (!isOpen) return null;

  const activeCategoryDef = CATEGORIES.find((c) => c.id === activeCategory) || CATEGORIES[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-6 select-none animate-in fade-in duration-200">
      
      {/* 
        CRITICAL FIXED MODAL SHELL:
        width: min(1080px, calc(100vw - 48px))
        height: min(760px, calc(100vh - 48px))
        EXACT SAME DIMENSIONS REGARDLESS OF CATEGORY!
      */}
      <div
        style={{
          width: 'min(1080px, calc(100vw - 48px))',
          height: 'min(760px, calc(100vh - 48px))',
        }}
        className="relative bg-[#0d1322] border-2 border-slate-800 rounded-3xl shadow-[0_25px_70px_rgba(0,0,0,0.9)] text-white flex flex-col overflow-hidden shrink-0"
      >
        {/* ================= HEADER ================= */}
        <div className="w-full h-16 px-6 bg-[#080d1a] border-b border-slate-800/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 border border-blue-400/50 flex items-center justify-center text-white shadow">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-wide leading-none font-sans uppercase">
                Settings
              </h1>
              <p className="text-[11px] text-stone-400 font-medium mt-0.5">
                Manage your game and account preferences.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#e11d23] hover:bg-[#ef4444] text-white flex items-center justify-center shadow-[0_0_15px_rgba(225,29,35,0.6)] transition active:scale-90 shrink-0"
            title="Close Settings"
          >
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* ================= MAIN TWO-COLUMN BODY ================= */}
        <div className="flex-1 w-full flex overflow-hidden">
          
          {/* LEFT CATEGORY NAVIGATION (Fixed ~250px) */}
          <div className="w-64 sm:w-72 bg-[#080c16] border-r border-slate-800/80 flex flex-col shrink-0 overflow-hidden">
            
            {/* Search Box */}
            <div className="p-3 border-b border-slate-800/80 relative shrink-0">
              <Search className="w-4 h-4 text-stone-400 absolute left-5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#121a2d] border border-slate-700/80 rounded-xl text-xs text-white placeholder-stone-400 focus:outline-none focus:border-cyan-400 transition"
              />

              {/* Search Instant Results Dropdown */}
              {filteredSearchResults.length > 0 && (
                <div className="absolute top-full left-3 right-3 mt-1 bg-[#121a2d] border-2 border-cyan-400/80 rounded-xl p-2 z-30 shadow-2xl space-y-1 max-h-48 overflow-y-auto">
                  {filteredSearchResults.map((res, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveCategory(res.categoryId);
                        setSearchQuery('');
                        triggerAutoSaveToast();
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-cyan-500/20 text-xs font-bold text-stone-200 hover:text-white transition flex items-center justify-between"
                    >
                      <span className="truncate">{res.label}</span>
                      <span className="text-[9px] text-cyan-400 uppercase font-mono">Jump →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 10 Vertical Categories List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isActive = activeCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      sounds.playClick();
                      setActiveCategory(cat.id);
                      setMobileSubCategory(cat.id);
                    }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-left transition-all duration-150 font-bold text-xs sm:text-sm group ${
                      isActive
                        ? 'bg-[#18233c] text-white border-l-4 border-cyan-400 shadow-md font-black'
                        : 'text-stone-400 hover:text-white hover:bg-[#101828]'
                    }`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform ${
                        isActive ? 'text-cyan-400 scale-110' : 'text-stone-500 group-hover:text-stone-300'
                      }`}
                    />
                    <span className="truncate">{cat.title}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT SETTINGS CONTENT AREA (Scrolls Vertically) */}
          <div className="flex-1 bg-[#0b101c] overflow-y-auto p-5 sm:p-7 space-y-6">
            
            {/* Category Title & Short One-Line Description */}
            <div className="pb-3 border-b border-slate-800/80">
              <h2 className="text-2xl font-black text-white tracking-wide flex items-center gap-2">
                <span>{activeCategoryDef.title}</span>
              </h2>
              <p className="text-xs sm:text-sm text-stone-400 font-medium mt-0.5">
                {activeCategoryDef.subtitle}
              </p>
            </div>

            {/* ================= 1. NOTIFICATIONS ================= */}
            {activeCategory === 'notifications' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* General Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    GENERAL NOTIFICATIONS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle
                      title="Enable System Notifications"
                      desc="Allow the game platform to send push and pop-up notifications"
                      checked={enableNotifications}
                      onChange={(val) => { setEnableNotifications(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Notification Sounds"
                      desc="Play audio chimes when a new notification arrives"
                      checked={notificationSounds}
                      onChange={(val) => { setNotificationSounds(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Show Notification Previews"
                      desc="Display message text and caller details inside notification popups"
                      checked={showPreviews}
                      onChange={(val) => { setShowPreviews(val); triggerAutoSaveToast(); }}
                    />
                  </div>
                </div>

                {/* Game Notifications Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    GAME ALERTS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle
                      title="Friend Requests"
                      desc="Alert when someone sends you a friend invitation"
                      checked={notifyFriendRequests}
                      onChange={(val) => { setNotifyFriendRequests(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Game Invites"
                      desc="Alert when invited to join a multiplayer saloon table"
                      checked={notifyGameInvites}
                      onChange={(val) => { setNotifyGameInvites(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Match Ready"
                      desc="Alert when your queued match is ready to start"
                      checked={notifyMatchReady}
                      onChange={(val) => { setNotifyMatchReady(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Turn Notifications"
                      desc="Alert when it is your turn to make a move"
                      checked={notifyTurn}
                      onChange={(val) => { setNotifyTurn(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Tournament Notifications"
                      desc="Alerts for upcoming tournament rounds and brackets"
                      checked={notifyTournaments}
                      onChange={(val) => { setNotifyTournaments(val); triggerAutoSaveToast(); }}
                    />
                    <RowToggle
                      title="Challenge Notifications"
                      desc="Alerts when a player issues a direct duel or challenge"
                      checked={notifyChallenges}
                      onChange={(val) => { setNotifyChallenges(val); triggerAutoSaveToast(); }}
                    />
                  </div>
                </div>

                {/* Marketplace Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    MARKETPLACE & AUCTIONS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Auction Ending Soon" desc="Alert 15 minutes before watched auctions close" checked={auctionEndingAlert} onChange={(v) => { setAuctionEndingAlert(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Outbid Alerts" desc="Alert immediately if another bidder tops your offer" checked={outbidAlert} onChange={(v) => { setOutbidAlert(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Auction Won" desc="Alert when you win a rare deck or relic auction" checked={auctionWonAlert} onChange={(v) => { setAuctionWonAlert(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Item Sold" desc="Alert when an item from your collection is purchased" checked={itemSoldAlert} onChange={(v) => { setItemSoldAlert(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Offer Received" desc="Alert when another player makes a private bid offer" checked={offerReceivedAlert} onChange={(v) => { setOfferReceivedAlert(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Price Alerts" desc="Alert when bookmarked items drop below target price" checked={priceAlerts} onChange={(v) => { setPriceAlerts(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Watchlist Updates" desc="Weekly summary of watchlist items" checked={watchlistUpdates} onChange={(v) => { setWatchlistUpdates(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Social & Delivery */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    SOCIAL & DELIVERY METHOD
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="New Messages" desc="Alert for direct chat messages" checked={notifyMessages} onChange={(v) => { setNotifyMessages(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Friend Activity" desc="Alert when friends come online or start playing" checked={notifyFriendActivity} onChange={(v) => { setNotifyFriendActivity(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Club / Group Activity" desc="Alert for clan and saloon group announcements" checked={notifyClubActivity} onChange={(v) => { setNotifyClubActivity(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="In-Game Popups" desc="Show alerts directly inside active gameplay view" checked={deliveryInGame} onChange={(v) => { setDeliveryInGame(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Desktop / Push Alerts" desc="Send native OS notifications when minimized" checked={deliveryDesktop} onChange={(v) => { setDeliveryDesktop(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Email Digests" desc="Send important account and tournament emails" checked={deliveryEmail} onChange={(v) => { setDeliveryEmail(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Do Not Disturb Group */}
                <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-3">
                  <RowToggle
                    title="Do Not Disturb Mode"
                    desc="Mute all notifications during quiet hours"
                    checked={dndEnabled}
                    onChange={(v) => { setDndEnabled(v); triggerAutoSaveToast(); }}
                  />
                  {dndEnabled && (
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">Start Time</label>
                        <input
                          type="time"
                          value={dndStart}
                          onChange={(e) => { setDndStart(e.target.value); triggerAutoSaveToast(); }}
                          className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">End Time</label>
                        <input
                          type="time"
                          value={dndEnd}
                          onChange={(e) => { setDndEnd(e.target.value); triggerAutoSaveToast(); }}
                          className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ================= 2. AUDIO ================= */}
            {activeCategory === 'audio' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Master Audio Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    MASTER AUDIO
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <RowSlider
                      title="Master Volume"
                      desc="Controls overall game audio output"
                      value={masterVolume}
                      onChange={(v) => { setMasterVolume(v); triggerAutoSaveToast(); }}
                    />
                    <div className="pt-3 border-t border-slate-800/80 divide-y divide-slate-800/80">
                      <RowToggle title="Mute All Audio" desc="Instantly silence all game music, sound effects, and voice" checked={muteAll} onChange={(v) => { setMuteAll(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Mute When Unfocused" desc="Automatically mute game audio when switching browser tabs" checked={muteUnfocused} onChange={(v) => { setMuteUnfocused(v); triggerAutoSaveToast(); }} />
                    </div>
                  </div>
                </div>

                {/* Music Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    BACKGROUND MUSIC
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <RowSlider
                      title="Music Volume"
                      desc="Adjust music soundtrack levels"
                      value={musicVolume}
                      onChange={(v) => { setMusicVolume(v); triggerAutoSaveToast(); }}
                    />
                    <div className="pt-3 border-t border-slate-800/80 divide-y divide-slate-800/80">
                      <RowToggle title="Menu Music" desc="Play saloon soundtrack in main hub and lobby menus" checked={menuMusic} onChange={(v) => { setMenuMusic(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Gameplay Music" desc="Play dynamic adaptive music during Euchre and Poker games" checked={gameplayMusic} onChange={(v) => { setGameplayMusic(v); triggerAutoSaveToast(); }} />
                    </div>
                  </div>
                </div>

                {/* Sound Effects Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    SOUND EFFECTS (SFX)
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <RowSlider
                      title="Effects Volume"
                      desc="Card deals, chip stacks, and button clicks"
                      value={effectsVolume}
                      onChange={(v) => { setEffectsVolume(v); triggerAutoSaveToast(); }}
                    />
                    <div className="pt-3 border-t border-slate-800/80 divide-y divide-slate-800/80">
                      <RowToggle title="Card Sounds" desc="Card shuffles, snaps, and slaps" checked={cardSounds} onChange={(v) => { setCardSounds(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Board Sounds" desc="Chip sliding and felt impact audio" checked={boardSounds} onChange={(v) => { setBoardSounds(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="UI Sounds" desc="Button presses and modal navigation clicks" checked={uiSounds} onChange={(v) => { setUiSounds(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Pack Opening Sounds" desc="Rare deck unlock and pack opening fanfare" checked={packSounds} onChange={(v) => { setPackSounds(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Marketplace Sounds" desc="Coin purchase and auction gavel sounds" checked={marketplaceSounds} onChange={(v) => { setMarketplaceSounds(v); triggerAutoSaveToast(); }} />
                    </div>
                  </div>
                </div>

                {/* Voice & Voice Chat Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    VOICE CHAT & ANNOUNCER
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <RowSlider title="Voice Volume" desc="Character taunts and player voice lines" value={voiceVolume} onChange={(v) => { setVoiceVolume(v); triggerAutoSaveToast(); }} />
                    <RowSlider title="Announcer Volume" desc="Trump call announcements and dealer speech" value={announcerVolume} onChange={(v) => { setAnnouncerVolume(v); triggerAutoSaveToast(); }} />
                    
                    <div className="pt-3 border-t border-slate-800/80 space-y-4">
                      <RowToggle title="Character Voice Lines" desc="Allow 3D avatars to speak dialogue" checked={characterVoiceLines} onChange={(v) => { setCharacterVoiceLines(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Enable Voice Chat" desc="Talk live with teammates and opponents at the table" checked={enableVoiceChat} onChange={(v) => { setEnableVoiceChat(v); triggerAutoSaveToast(); }} />
                      
                      {enableVoiceChat && (
                        <div className="space-y-3 pt-2 bg-[#080d1a] p-3 rounded-xl border border-slate-800">
                          <div>
                            <label className="text-xs font-bold text-stone-300 block mb-1">Input Device (Microphone)</label>
                            <select
                              value={inputDevice}
                              onChange={(e) => { setInputDevice(e.target.value); triggerAutoSaveToast(); }}
                              className="w-full bg-[#121a2d] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                            >
                              <option>Default Microphone (Realtek High Definition)</option>
                              <option>USB Studio Condenser Mic</option>
                              <option>Headset Microphone</option>
                            </select>
                          </div>

                          <div>
                            <label className="text-xs font-bold text-stone-300 block mb-1">Output Device (Headphones/Speakers)</label>
                            <select
                              value={outputDevice}
                              onChange={(e) => { setOutputDevice(e.target.value); triggerAutoSaveToast(); }}
                              className="w-full bg-[#121a2d] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                            >
                              <option>Default Headphones (Realtek Audio)</option>
                              <option>Digital Optical Output</option>
                            </select>
                          </div>

                          <RowSlider title="Microphone Volume" desc="Adjust your microphone gain" value={micVolume} onChange={(v) => { setMicVolume(v); triggerAutoSaveToast(); }} />
                          <RowSlider title="Voice Chat Volume" desc="Adjust volume of incoming player voices" value={voiceChatVolume} onChange={(v) => { setVoiceChatVolume(v); triggerAutoSaveToast(); }} />
                          <RowToggle title="Push to Talk" desc="Hold key to speak instead of open mic" checked={pushToTalk} onChange={(v) => { setPushToTalk(v); triggerAutoSaveToast(); }} />

                          {/* Microphone Test */}
                          <div className="pt-2 flex items-center justify-between gap-4">
                            <button
                              type="button"
                              onClick={() => {
                                sounds.playClick();
                                setIsTestingMic(!isTestingMic);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow transition active:scale-95 flex items-center gap-1.5"
                            >
                              <Mic className="w-4 h-4" />
                              <span>{isTestingMic ? 'Stop Mic Test' : 'Test Microphone'}</span>
                            </button>

                            {/* Live Mic Volume Level Meter */}
                            <div className="flex-1 h-3 bg-stone-900 rounded-full overflow-hidden border border-slate-700">
                              <div
                                className="h-full bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 transition-all duration-100"
                                style={{ width: `${micLevel}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 3. VISUAL ================= */}
            {activeCategory === 'visual' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Display Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    DISPLAY & RESOLUTION
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <RowToggle title="Fullscreen Mode" desc="Run the application full screen" checked={fullscreen} onChange={(v) => { setFullscreen(v); triggerAutoSaveToast(); }} />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Window Mode</div>
                        <div className="text-xs text-stone-400">Select display presentation style</div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-xl border border-slate-700">
                        {(['Fullscreen', 'Borderless', 'Windowed'] as const).map((m) => (
                          <button
                            key={m}
                            onClick={() => { setWindowMode(m); triggerAutoSaveToast(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              windowMode === m ? 'bg-cyan-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            {m}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">Resolution</label>
                        <select
                          value={resolution}
                          onChange={(e) => {
                            setResolution(e.target.value);
                            setConfirmDisplayChange(true);
                            setDisplayCountdown(15);
                            sounds.playWin();
                          }}
                          className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                        >
                          <option>3840x2160 (4K UHD)</option>
                          <option>2560x1440 (1440p QHD)</option>
                          <option>1920x1080 (1080p FHD)</option>
                          <option>1280x720 (720p HD)</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">Refresh Rate</label>
                        <select
                          value={refreshRate}
                          onChange={(e) => { setRefreshRate(e.target.value); triggerAutoSaveToast(); }}
                          className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                        >
                          <option>240 Hz</option>
                          <option>144 Hz</option>
                          <option>120 Hz</option>
                          <option>60 Hz</option>
                        </select>
                      </div>
                    </div>

                    <RowToggle title="Vertical Sync (VSync)" desc="Lock frame rate to monitor refresh rate to prevent screen tearing" checked={vsync} onChange={(v) => { setVsync(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Graphics Quality */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    GRAPHICS PRESETS & QUALITY
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Graphics Preset</div>
                        <div className="text-xs text-stone-400">Overall visual quality configuration</div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-xl border border-slate-700">
                        {(['Low', 'Medium', 'High', 'Ultra'] as const).map((p) => (
                          <button
                            key={p}
                            onClick={() => { setGraphicsPreset(p); triggerAutoSaveToast(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              graphicsPreset === p ? 'bg-cyan-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            {p}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">Texture Quality</label>
                        <select value={textureQuality} onChange={(e) => { setTextureQuality(e.target.value); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                          <option>Ultra (4K Painted)</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Low</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-stone-300 block mb-1">Shadow Quality</label>
                        <select value={shadowQuality} onChange={(e) => { setShadowQuality(e.target.value); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                          <option>Ultra Soft Shadows</option>
                          <option>High</option>
                          <option>Medium</option>
                          <option>Disabled</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interface & Game Board */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    INTERFACE & BOARD FX
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Menu Background Animation" desc="3D rotating character canvas and floating casino chips in menu background" checked={menuBgAnim} onChange={(v) => { setMenuBgAnim(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Show Character Animations" desc="3D mascot reaction animations during victory and euchre loner sweeps" checked={characterAnims} onChange={(v) => { setCharacterAnims(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Chip / Piece Motion Effects" desc="Particle trails when tossing betting chips on the felt table" checked={chipEffects} onChange={(v) => { setChipEffects(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>
              </div>
            )}

            {/* ================= 4. PRIVACY ================= */}
            {activeCategory === 'privacy' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    PROFILE VISIBILITY
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Profile Visibility</div>
                        <div className="text-xs text-stone-400">Controls who can see your stats and profile page</div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-xl border border-slate-700">
                        {(['Public', 'Friends Only', 'Private'] as const).map((v) => (
                          <button
                            key={v}
                            onClick={() => { setProfileVisibility(v); triggerAutoSaveToast(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              profileVisibility === v ? 'bg-cyan-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800/80 divide-y divide-slate-800/80">
                      <RowToggle title="Show Online Status" desc="Display green online indicator when in saloon" checked={showOnlineStatus} onChange={(v) => { setShowOnlineStatus(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Show Current Game" desc="Display active table name to friends" checked={showCurrentGame} onChange={(v) => { setShowCurrentGame(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Show Match History" desc="Allow players to inspect your recent Euchre/Poker matches" checked={showMatchHistory} onChange={(v) => { setShowMatchHistory(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Show Card Deck Collection" desc="Show unlocked painted decks and hats on public profile" checked={showCollection} onChange={(v) => { setShowCollection(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Show Marketplace Inventory" desc="Allow public viewing of listed deck relics" checked={showInventory} onChange={(v) => { setShowInventory(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Show Achievements" desc="Display unlocked trophies on leaderboards" checked={showAchievements} onChange={(v) => { setShowAchievements(v); triggerAutoSaveToast(); }} />
                    </div>
                  </div>
                </div>

                {/* Social & Marketplace Privacy */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    SOCIAL & MARKETPLACE PERMISSIONS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Who Can Send Friend Requests</label>
                      <select value={whoCanFriend} onChange={(e) => { setWhoCanFriend(e.target.value as any); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                        <option>Everyone</option>
                        <option>Friends of Friends</option>
                        <option>Nobody</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Who Can Message Me</label>
                      <select value={whoCanMessage} onChange={(e) => { setWhoCanMessage(e.target.value as any); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                        <option>Everyone</option>
                        <option>Friends</option>
                        <option>Nobody</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 5. ACCESSIBILITY ================= */}
            {activeCategory === 'accessibility' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Live Accessibility Preview */}
                <div className="p-4 bg-[#121c33] border-2 border-cyan-400/80 rounded-2xl flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-black text-cyan-300 uppercase tracking-wider">
                      ACCESSIBILITY LIVE PREVIEW
                    </h4>
                    <p className="text-xs text-stone-300 mt-0.5">
                      Card Suit Symbol Preview: <span className="text-rose-400 font-bold">♥ Hearts</span> • <span className="text-rose-400 font-bold">♦ Diamonds</span> • <span className="text-sky-300 font-bold">♠ Spades</span> • <span className="text-emerald-400 font-bold">♣ Clubs</span>
                    </p>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500 text-stone-950 text-xs font-black rounded-lg">
                    ACTIVE
                  </span>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    VISION & HIGH CONTRAST
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Colorblind Filter Mode</label>
                      <select
                        value={colorblindMode}
                        onChange={(e) => { setColorblindMode(e.target.value as any); triggerAutoSaveToast(); }}
                        className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5"
                      >
                        <option>Off (Default Colors)</option>
                        <option>Protanopia (Red-Blind Assistance)</option>
                        <option>Deuteranopia (Green-Blind Assistance)</option>
                        <option>Tritanopia (Blue-Blind Assistance)</option>
                      </select>
                    </div>

                    <div className="divide-y divide-slate-800/80 pt-2">
                      <RowToggle title="High Contrast Mode" desc="Darkens background canvas and boosts text outline contrast" checked={highContrastMode} onChange={(v) => { setHighContrastMode(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Card Suit Color Assistance" desc="Uses distinct 4-color suit scheme (Red Hearts, Orange Diamonds, Black Spades, Green Clubs)" checked={suitColorAssistance} onChange={(v) => { setSuitColorAssistance(v); triggerAutoSaveToast(); }} />
                      <RowToggle title="Display Suit Symbols More Clearly" desc="Enlarges suit symbols on card corners for fast identification" checked={clearSuitSymbols} onChange={(v) => { setClearSuitSymbols(v); triggerAutoSaveToast(); }} />
                    </div>
                  </div>
                </div>

                {/* Motion & Input */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    MOTION & INPUT ACCESSIBILITY
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Reduce Motion" desc="Disables camera zooms and card flipping transitions" checked={reduceMotion} onChange={(v) => { setReduceMotion(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Disable Camera Shake" desc="Prevents table vibration when big hands are played" checked={disableCameraShake} onChange={(v) => { setDisableCameraShake(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Disable Screen Flash" desc="Disables bright screen flashes during jackpots and victory" checked={disableScreenFlash} onChange={(v) => { setDisableScreenFlash(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Subtitle / Caption Support" desc="Display captions for all character voice lines" checked={subtitleSupport} onChange={(v) => { setSubtitleSupport(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>
              </div>
            )}

            {/* ================= 6. LANGUAGE ================= */}
            {activeCategory === 'language' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Restart Notice Banner */}
                <div className="p-3.5 bg-amber-950/80 border border-amber-500/80 rounded-2xl text-amber-200 text-xs font-bold flex items-center gap-3">
                  <Info className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>Changing primary language updates text dynamically. Voice line packs require a game client restart.</span>
                </div>

                <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-stone-300 block mb-1">Game Interface Language</label>
                    <select
                      value={gameLanguage}
                      onChange={(e) => { setGameLanguage(e.target.value); triggerAutoSaveToast(); }}
                      className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5 font-sans"
                    >
                      <option>English (US)</option>
                      <option>Français (French)</option>
                      <option>Español (Spanish)</option>
                      <option>Português (Portuguese)</option>
                      <option>Deutsch (German)</option>
                      <option>Italiano (Italian)</option>
                      <option>日本語 (Japanese)</option>
                      <option>한국어 (Korean)</option>
                      <option>简体中文 (Simplified Chinese)</option>
                      <option>繁體中文 (Traditional Chinese)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Date Format</label>
                      <select value={dateFormat} onChange={(e) => { setDateFormat(e.target.value); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                        <option>MM/DD/YYYY (12/31/2026)</option>
                        <option>DD/MM/YYYY (31/12/2026)</option>
                        <option>YYYY-MM-DD (2026-12-31)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-stone-300 block mb-1">Time Format</label>
                      <select value={timeFormat} onChange={(e) => { setTimeFormat(e.target.value); triggerAutoSaveToast(); }} className="w-full bg-[#080d1a] border border-slate-700 text-xs font-bold text-white rounded-xl p-2.5">
                        <option>12-Hour (1:30 PM)</option>
                        <option>24-Hour (13:30)</option>
                      </select>
                    </div>
                  </div>

                  <RowToggle title="Auto-detect System Language" desc="Automatically match operating system language preferences" checked={autoDetectLanguage} onChange={(v) => { setAutoDetectLanguage(v); triggerAutoSaveToast(); }} />
                </div>
              </div>
            )}

            {/* ================= 7. GAMEPLAY ================= */}
            {activeCategory === 'gameplay' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    GLOBAL GAMEPLAY RULES
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Confirm End Turn" desc="Require explicit confirmation tap before ending turn" checked={confirmEndTurn} onChange={(v) => { setConfirmEndTurn(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Confirm Forfeit / Quit" desc="Ask for confirmation before leaving an active match" checked={confirmForfeit} onChange={(v) => { setConfirmForfeit(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Confirm Purchase During Game" desc="Confirm chip re-buys during high-stakes games" checked={confirmPurchaseInGame} onChange={(v) => { setConfirmPurchaseInGame(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Show Legal Moves Highlight" desc="Glow playable cards in hand matching led suit" checked={showLegalMoves} onChange={(v) => { setShowLegalMoves(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Show Suggested AI Moves" desc="Highlight recommended card choice for beginners" checked={showSuggestedMoves} onChange={(v) => { setShowSuggestedMoves(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Auto-Sort Dealt Cards" desc="Automatically order hand by trump suit and card rank" checked={autoSortCards} onChange={(v) => { setAutoSortCards(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Animation Pace */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    CARD DEALING PACE & ASSISTANCE
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-bold text-white">Card Animation Speed</div>
                        <div className="text-xs text-stone-400">Pace of dealing and trick collection</div>
                      </div>
                      <div className="flex items-center gap-1 bg-[#080d1a] p-1 rounded-xl border border-slate-700">
                        {(['Slow', 'Normal', 'Fast'] as const).map((s) => (
                          <button
                            key={s}
                            onClick={() => { setAnimationSpeed(s); triggerAutoSaveToast(); }}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                              animationSpeed === s ? 'bg-cyan-500 text-stone-950 font-black' : 'text-stone-400 hover:text-white'
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Game-Specific Overrides */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    EUCHRE & CARD SPECIFIC OVERRIDES
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Auto-Pass Round 1 Trump if No Trump Cards" desc="Automatically pass ordering up turn if holding zero trump suit cards" checked={euchreAutoPassRound1} onChange={(v) => { setEuchreAutoPassRound1(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Highlight Right & Left Bowers" desc="Shimmer golden border on Bowers in hand" checked={highlightBowers} onChange={(v) => { setHighlightBowers(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Auto-Muck Poker Losing Hands" desc="Fold uncalled losing hands at showdown without exposing" checked={autoMuckPokerHands} onChange={(v) => { setAutoMuckPokerHands(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>
              </div>
            )}

            {/* ================= 8. SAFETY ================= */}
            {activeCategory === 'safety' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    CHAT & CONTENT SAFETY
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Chat Profanity Filter" desc="Filter out offensive language in table chat and DMs" checked={profanityFilter} onChange={(v) => { setProfanityFilter(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Filter Offensive Usernames" desc="Replace inappropriate player names with default saloon aliases" checked={filterOffensiveUsernames} onChange={(v) => { setFilterOffensiveUsernames(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Block Unknown Messages" desc="Only accept chat messages from confirmed friends" checked={blockUnknownMessages} onChange={(v) => { setBlockUnknownMessages(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Auto-Mute Reported Players" desc="Automatically mute players with multiple player reports" checked={autoMuteReported} onChange={(v) => { setAutoMuteReported(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    PLAYER INTERACTION CONTROLS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-bold text-white">Blocked & Muted Lists</div>
                      <div className="text-xs text-stone-400">0 Blocked Players • 2 Muted Players</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => sounds.playClick()} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700">
                        Manage Blocked
                      </button>
                      <button onClick={() => sounds.playClick()} className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700">
                        Manage Muted
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 9. DATA & STORAGE ================= */}
            {activeCategory === 'data_storage' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Local Storage Usage Bar */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    LOCAL STORAGE USAGE (9.22 GB TOTAL)
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-5 space-y-4">
                    {/* Visual Segmented Progress Bar */}
                    <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden flex border border-slate-800 shadow-inner">
                      <div className="h-full bg-cyan-500" style={{ width: '26%' }} title="Game Data 2.4 GB" />
                      <div className="h-full bg-indigo-500" style={{ width: '10%' }} title="Cached Media 820 MB" />
                      <div className="h-full bg-purple-500" style={{ width: '51%' }} title="Replay Clips 4.8 GB" />
                      <div className="h-full bg-amber-400" style={{ width: '13%' }} title="Screenshots 1.2 GB" />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold pt-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-cyan-500 shrink-0" />
                        <span>Game Data: <span className="text-white font-black">2.4 GB</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-indigo-500 shrink-0" />
                        <span>Cache: <span className="text-white font-black">820 MB</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500 shrink-0" />
                        <span>Replays: <span className="text-white font-black">4.8 GB</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                        <span>Shots: <span className="text-white font-black">1.2 GB</span></span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setConfirmDeleteCache(true);
                        }}
                        className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-200 border border-rose-600/80 font-black text-xs rounded-xl transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Clear Cache (820 MB)</span>
                      </button>

                      <div className="text-[11px] text-stone-400 font-mono">
                        Last Cloud Sync: <span className="text-emerald-400 font-bold">Synced 2m ago</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Downloads & Replays */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    DOWNLOADS & MATCH REPLAYS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 divide-y divide-slate-800/80">
                    <RowToggle title="Auto-Download Updates" desc="Keep game client updated automatically" checked={autoDownloadUpdates} onChange={(v) => { setAutoDownloadUpdates(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Download High-Resolution Assets" desc="Preload 4K painted deck textures" checked={downloadHighResAssets} onChange={(v) => { setDownloadHighResAssets(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Automatically Save Match Replays" desc="Record full Euchre and Poker hand replays for analysis" checked={autoSaveReplays} onChange={(v) => { setAutoSaveReplays(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Project Source Code Export */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono flex items-center justify-between">
                    <span>PROJECT EXPORT</span>
                    <span className="text-[10px] text-emerald-400 font-mono font-bold">READY TO DOWNLOAD</span>
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <div className="text-sm font-black text-white flex items-center gap-2">
                        <span>Euchre Paradise Source Code</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40 font-bold">.ZIP</span>
                      </div>
                      <div className="text-xs text-stone-400 mt-1">
                        Download the entire codebase including 3D scenes, sounds, card models, assets, and Express server in a single ZIP file.
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        sounds.playWin();
                        setShowZipModal(true);
                      }}
                      className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-stone-950 font-black text-xs uppercase rounded-xl shadow-lg transition active:scale-95 flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0"
                    >
                      <Download className="w-4 h-4 stroke-[2.5]" />
                      <span>Download .ZIP</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ================= 10. ACCOUNT & SECURITY ================= */}
            {activeCategory === 'account_security' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                {/* Account Details Group */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    ACCOUNT PREFERENCES
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="grid grid-cols-3 gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="text-[10px] font-black uppercase text-stone-400">Username</div>
                        <div className="text-sm font-black text-white mt-0.5">@{username}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-stone-400">Display Name</div>
                        <div className="text-sm font-black text-white mt-0.5">{displayName}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-black uppercase text-stone-400">Email Address</div>
                        <div className="text-sm font-black text-white mt-0.5">{email}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button onClick={() => sounds.playClick()} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-xl shadow">
                        Edit Profile Details
                      </button>
                      <button onClick={() => sounds.playClick()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700">
                        Change Email Address
                      </button>
                    </div>
                  </div>
                </div>

                {/* Security State */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    SECURITY & AUTHENTICATION
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-sm font-bold text-white">Two-Factor Authentication (2FA)</div>
                        <div className="text-xs text-stone-400">Require authenticator code on new logins</div>
                      </div>
                      <span className="px-3 py-1 bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-black rounded-lg">
                        {twoFactorEnabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <div className="text-sm font-bold text-white">Passkeys</div>
                        <div className="text-xs text-stone-400">Biometric fingerprint / face unlock</div>
                      </div>
                      <span className="px-3 py-1 bg-blue-950 border border-blue-500 text-blue-300 text-xs font-black rounded-lg">
                        CONFIGURED
                      </span>
                    </div>

                    <RowToggle title="Remember This Device" desc="Keep logged in on this browser" checked={rememberDevice} onChange={(v) => { setRememberDevice(v); triggerAutoSaveToast(); }} />
                    <RowToggle title="Login Notifications" desc="Send instant email alerts on new logins" checked={loginNotifications} onChange={(v) => { setLoginNotifications(v); triggerAutoSaveToast(); }} />
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 font-mono">
                    ACTIVE LOGIN SESSIONS
                  </h3>
                  <div className="bg-[#101728] border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-[#080d1a] rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <Laptop className="w-5 h-5 text-cyan-400" />
                        <div>
                          <div className="text-xs font-black text-white">Windows PC • Chrome Browser (Current Session)</div>
                          <div className="text-[10px] text-stone-400">Dallas, TX • Active Now</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 uppercase">This Device</span>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#080d1a] rounded-xl border border-slate-800">
                      <div className="flex items-center gap-3">
                        <Smartphone className="w-5 h-5 text-purple-400" />
                        <div>
                          <div className="text-xs font-black text-white">iPhone 15 Pro • Saloon Mobile App</div>
                          <div className="text-[10px] text-stone-400">Austin, TX • 2 hours ago</div>
                        </div>
                      </div>
                      <button onClick={() => sounds.playClick()} className="text-xs font-bold text-rose-400 hover:underline">
                        Sign Out
                      </button>
                    </div>

                    <button onClick={() => sounds.playClick()} className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-xs rounded-xl border border-slate-700">
                      Sign Out All Other Devices
                    </button>
                  </div>
                </div>

                {/* DANGER ZONE (Separated at Bottom) */}
                <div className="p-5 bg-rose-950/30 border-2 border-rose-600/80 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-400 font-black text-sm uppercase tracking-wider">
                    <AlertTriangle className="w-5 h-5" />
                    <span>DANGER ZONE</span>
                  </div>
                  <p className="text-xs text-stone-300">
                    Permanently delete your account, game progress, card collection, and vault balance. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => {
                      sounds.playCardDrop();
                      setConfirmDeleteAccount(true);
                    }}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition active:scale-95"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Auto-Save Toast Badge */}
        {showSavedToast && (
          <div className="absolute bottom-4 right-6 bg-emerald-500 text-stone-950 px-3.5 py-1.5 rounded-full font-black text-xs shadow-2xl flex items-center gap-1.5 animate-in fade-in duration-150 z-40">
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Settings Saved</span>
          </div>
        )}

      </div>

      {/* ================= CONFIRMATION DIALOGS ================= */}

      {/* Clear Cache Confirmation */}
      {confirmDeleteCache && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <div className="bg-[#101728] border-2 border-rose-500 rounded-3xl p-6 max-w-md w-full space-y-4 text-center">
            <Trash2 className="w-12 h-12 text-rose-500 mx-auto" />
            <h3 className="text-lg font-black text-white uppercase">Clear Local Cache?</h3>
            <p className="text-xs text-stone-300">
              This will clear 820 MB of cached deck textures and board sounds. They will re-download when needed.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteCache(false)}
                className="flex-1 py-2.5 bg-slate-800 text-stone-200 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  sounds.playWin();
                  setConfirmDeleteCache(false);
                  triggerAutoSaveToast();
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white font-black text-xs rounded-xl"
              >
                Clear Cache
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirmation */}
      {confirmDeleteAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 animate-in fade-in">
          <div className="bg-[#180a0e] border-2 border-rose-600 rounded-3xl p-6 max-w-md w-full space-y-4 text-center">
            <AlertTriangle className="w-14 h-14 text-rose-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-white uppercase tracking-wide">PERMANENTLY DELETE ACCOUNT?</h3>
            <p className="text-xs text-stone-300">
              Are you absolutely sure? All stats, unlocked deck relics, and coin vault balance will be deleted permanently.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteAccount(false)}
                className="flex-1 py-2.5 bg-slate-800 text-stone-200 font-bold text-xs rounded-xl"
              >
                Keep Account
              </button>
              <button
                onClick={() => {
                  sounds.playCardDrop();
                  setConfirmDeleteAccount(false);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-rose-600 text-white font-black text-xs rounded-xl shadow-lg"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Display Settings Revert Countdown Confirmation */}
      {confirmDisplayChange && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in">
          <div className="bg-[#101728] border-2 border-cyan-400 rounded-3xl p-6 max-w-md w-full space-y-4 text-center">
            <Monitor className="w-12 h-12 text-cyan-400 mx-auto" />
            <h3 className="text-lg font-black text-white uppercase">Keep These Display Settings?</h3>
            <p className="text-xs text-stone-300">
              Resolution changed to <span className="text-cyan-300 font-bold">{resolution}</span>. Reverting in <span className="text-amber-400 font-black text-sm">{displayCountdown}s</span>...
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmDisplayChange(false);
                  setDisplayCountdown(15);
                  sounds.playClick();
                }}
                className="flex-1 py-2.5 bg-cyan-500 text-stone-950 font-black text-xs rounded-xl shadow"
              >
                Keep Changes
              </button>
              <button
                onClick={() => {
                  setConfirmDisplayChange(false);
                  setDisplayCountdown(15);
                  setResolution('1920x1080 (1080p)');
                  sounds.playCardDrop();
                }}
                className="flex-1 py-2.5 bg-slate-800 text-stone-200 font-bold text-xs rounded-xl"
              >
                Revert Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Zip Helper Modal */}
      <DownloadZipModal isOpen={showZipModal} onClose={() => setShowZipModal(false)} />

    </div>
  );
};

// Reusable Row Helper Components for consistent 64-72px height rows
interface RowToggleProps {
  title: string;
  desc?: string;
  checked: boolean;
  onChange: (val: boolean) => void;
}

const RowToggle: React.FC<RowToggleProps> = ({ title, desc, checked, onChange }) => (
  <div className="flex items-center justify-between py-3 min-h-[64px] gap-4">
    <div>
      <div className="text-sm font-bold text-white">{title}</div>
      {desc && <div className="text-xs text-stone-400 mt-0.5">{desc}</div>}
    </div>
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="w-5 h-5 accent-cyan-400 rounded cursor-pointer shrink-0"
    />
  </div>
);

interface RowSliderProps {
  title: string;
  desc?: string;
  value: number;
  onChange: (val: number) => void;
}

const RowSlider: React.FC<RowSliderProps> = ({ title, desc, value, onChange }) => (
  <div className="space-y-1 py-1">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-bold text-white">{title}</div>
        {desc && <div className="text-xs text-stone-400">{desc}</div>}
      </div>
      <span className="text-xs font-mono font-black text-cyan-400">{value}%</span>
    </div>
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-2 bg-slate-800 accent-cyan-400 rounded-lg cursor-pointer"
    />
  </div>
);
