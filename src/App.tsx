import React, { useState, useEffect, useRef } from 'react';
import { HatItem, InventoryItem, PlayerProfile, PropertyItem, TownLocation } from './types/poker';
import { INITIAL_PLAYER_PROFILE, TOWNS_DATA } from './data/gameData';
import { HomeScreenHub } from './components/HomeScreenHub';
import { EuchreTable } from './components/EuchreTable';
import { DailyCalendarModal } from './components/DailyCalendarModal';
import { CampaignWorldMapModal } from './components/CampaignWorldMapModal';
import { HamburgerMenuModal } from './components/HamburgerMenuModal';
import { HatsShopModal } from './components/HatsShopModal';
import { ShopModal } from './components/ShopModal';
import { PropertiesModal } from './components/PropertiesModal';
import { StatsCareerModal } from './components/StatsCareerModal';
import { TopLeftGovernorBonusModal } from './components/TopLeftGovernorBonusModal';
import { SlotsModal } from './components/SlotsModal';
import { PalaceAssistantModal } from './components/PalaceAssistantModal';
import { DirectMessagesModal } from './components/DirectMessagesModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { EditProfileModal } from './components/EditProfileModal';
import { SettingsModal } from './components/SettingsModal';
import { ThemesModal } from './components/ThemesModal';
import { FAQModal } from './components/FAQModal';
import { DailyDiceModal } from './components/DailyDiceModal';
import { RoyalLeaderboardModal } from './components/RoyalLeaderboardModal';
import { RulesGuideModal } from './components/RulesGuideModal';
import { SiteWalkthroughOverlay } from './components/SiteWalkthroughOverlay';
import { TwitchLiveChat } from './components/TwitchLiveChat';
import { MapScreen } from './components/MapScreen';
import { CampaignWorldScreen } from './components/CampaignWorldScreen';
import { ProgressionModal } from './components/ProgressionModal';
import { SixOuterButtons } from './components/SixOuterButtons';
import { WatchAdsModal } from './components/WatchAdsModal';
import { MailboxModal } from './components/MailboxModal';
import { MusicModal } from './components/MusicModal';
import { SinglePlayerScreen } from './components/SinglePlayerScreen';
import { MultiplayerScreen } from './components/MultiplayerScreen';
import { YouTubeLiveScreen } from './components/YouTubeLiveScreen';
import { GoogleAdBanner } from './components/GoogleAdBanner';
import { sounds } from './utils/soundEffects';
import { testFirestoreConnection } from './lib/firebase';
import { initRealtimePresence, getVisitorId } from './services/realtimePresence';
import { subscribeRealtimeProfile, saveRealtimeProfile } from './services/realtimeProfiles';

const STORAGE_KEY = 'euchre_paradise_profile_v4';
const THEME_KEY = 'euchre_painted_theme_v4';
const VISITORS_KEY = 'euchre_all_time_visitors';

export default function App() {
  // Initialize and increment visitor count
  useEffect(() => {
    try {
      const currentCount = parseInt(localStorage.getItem(VISITORS_KEY) || '1482912', 10);
      if (!sessionStorage.getItem('euchre_visited_session')) {
        const nextCount = currentCount + 1;
        localStorage.setItem(VISITORS_KEY, nextCount.toString());
        sessionStorage.setItem('euchre_visited_session', 'true');
      }
    } catch {
      // ignore
    }
  }, []);

  // Load saved profile or initialize
  const [profile, setProfile] = useState<PlayerProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      ...INITIAL_PLAYER_PROFILE,
      name: 'Euchre Sovereign',
      sovereigns: 15,
      claimedDailyDays: [1],
    };
  });

  // Painted Theme state
  const [paintedTheme, setPaintedTheme] = useState<string>(() => {
    try {
      return localStorage.getItem(THEME_KEY) || 'oil_painted';
    } catch {
      return 'oil_painted';
    }
  });

  // Main Menu Theme state
  const [mainMenuTheme, setMainMenuTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('euchre_main_menu_theme_v2') || 'theme_1';
    } catch {
      return 'theme_1';
    }
  });

  // Profile Theme state
  const [profileTheme, setProfileTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('euchre_profile_theme_v2') || 'profile_1';
    } catch {
      return 'profile_1';
    }
  });

  // In-Game Table Theme state
  const [inGameTheme, setInGameTheme] = useState<string>(() => {
    try {
      return localStorage.getItem('euchre_in_game_theme_v2') || 'in_game_1';
    } catch {
      return 'in_game_1';
    }
  });

  // Camera angle state (default directly overhead bird's-eye perspective for gameplay)
  const [cameraAngle, setCameraAngle] = useState<'table' | 'overhead' | 'cinematic' | 'first_person'>('overhead');

  // Screen Navigation: 'home' | 'map' | 'table' | 'single_player' | 'multiplayer' | 'live_video'
  const [currentScreen, setCurrentScreen] = useState<'home' | 'map' | 'table' | 'single_player' | 'multiplayer' | 'live_video'>('home');
  const [selectedTown, setSelectedTown] = useState<TownLocation>(TOWNS_DATA[0]);

  // Modals
  const [showMapModal, setShowMapModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showHamburgerModal, setShowHamburgerModal] = useState<boolean>(false);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [showHatsModal, setShowHatsModal] = useState<boolean>(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState<boolean>(false);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);
  const [showTopLeftModal, setShowTopLeftModal] = useState<boolean>(false);

  // 6 Outer Button Modals
  const [showSlotsModal, setShowSlotsModal] = useState<boolean>(false);
  const [showAssistantModal, setShowAssistantModal] = useState<boolean>(false);
  const [showDMsModal, setShowDMsModal] = useState<boolean>(false);
  const [dmsThreadId, setDmsThreadId] = useState<string | undefined>(undefined);
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [showLiveVideoModal, setShowLiveVideoModal] = useState<boolean>(false);
  const [showTwitchChat, setShowTwitchChat] = useState<boolean>(false);

  // New Modals
  const [showMailboxModal, setShowMailboxModal] = useState<boolean>(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState<boolean>(false);
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [showThemesModal, setShowThemesModal] = useState<boolean>(false);
  const [showFAQModal, setShowFAQModal] = useState<boolean>(false);
  const [showDailyDiceModal, setShowDailyDiceModal] = useState<boolean>(false);
  const [showLeaderboardModal, setShowLeaderboardModal] = useState<boolean>(false);
  const [showRulesGuideModal, setShowRulesGuideModal] = useState<boolean>(false);
  const [showWalkthroughOverlay, setShowWalkthroughOverlay] = useState<boolean>(false);
  const [showProgressionModal, setShowProgressionModal] = useState<boolean>(false);
  const [showMusicModal, setShowMusicModal] = useState<boolean>(false);
  const [showWatchAdsModal, setShowWatchAdsModal] = useState<boolean>(false);
  const [showSinglePlayerModal, setShowSinglePlayerModal] = useState<boolean>(false);
  const [showMultiplayerModal, setShowMultiplayerModal] = useState<boolean>(false);

  // Sync profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch {
      // ignore
    }
  }, [profile]);

  // Automatically close mini slots if entering campaign
  useEffect(() => {
    if (currentScreen === 'map' || currentScreen === 'table') {
      setShowSlotsModal(false);
    }
  }, [currentScreen]);

  const handleClaimFreeChips = () => {
    setProfile((prev) => ({
      ...prev,
      chips: prev.chips + 1000,
    }));
  };

  const handleClaimDailyReward = (chips: number, sovereigns: number, dayNum: number) => {
    setProfile((prev) => {
      const currentDays = new Set(prev.claimedDailyDays || []);
      currentDays.add(dayNum);
      return {
        ...prev,
        chips: prev.chips + chips,
        sovereigns: (prev.sovereigns || 0) + sovereigns,
        claimedDailyDays: Array.from(currentDays),
        stats: {
          ...prev.stats,
          dailyRewardsClaimed: currentDays.size,
        },
      };
    });
  };

  const handleResetProgress = () => {
    setProfile({
      ...INITIAL_PLAYER_PROFILE,
      name: 'Euchre Sovereign',
      sovereigns: 15,
      claimedDailyDays: [],
    });
    localStorage.removeItem(STORAGE_KEY);
    setCurrentScreen('home');
  };

  const [realtimeStats, setRealtimeStats] = useState<{ onlineNow: number; allTimeVisitors: number }>({
    onlineNow: 1,
    allTimeVisitors: 1,
  });

  const isIncomingSyncRef = useRef<boolean>(false);
  const lastSavedProfileJsonRef = useRef<string>(JSON.stringify(profile));

  // Real-Time Firebase Initialization
  useEffect(() => {
    testFirestoreConnection();

    const cleanupPresence = initRealtimePresence(profile.name, (stats) => {
      setRealtimeStats(stats);
    });

    const visitorId = getVisitorId();
    const cleanupProfile = subscribeRealtimeProfile(visitorId, (cloudProfile) => {
      if (cloudProfile && Object.keys(cloudProfile).length > 0) {
        setProfile((prev) => {
          const merged = { ...prev, ...cloudProfile };
          const mergedJson = JSON.stringify(merged);
          // Only update if genuinely different to eliminate re-render loops
          if (mergedJson === JSON.stringify(prev)) {
            return prev;
          }
          isIncomingSyncRef.current = true;
          lastSavedProfileJsonRef.current = mergedJson;
          return merged;
        });
      }
    });

    return () => {
      cleanupPresence();
      cleanupProfile();
    };
  }, []);

  // Sync profile state changes to Firebase Firestore with debounce and loop guard
  useEffect(() => {
    if (isIncomingSyncRef.current) {
      isIncomingSyncRef.current = false;
      return;
    }

    const currentJson = JSON.stringify(profile);
    if (currentJson === lastSavedProfileJsonRef.current) {
      return;
    }

    const debounceTimer = setTimeout(() => {
      lastSavedProfileJsonRef.current = currentJson;
      const visitorId = getVisitorId();
      saveRealtimeProfile(visitorId, profile).catch(() => null);
    }, 2000);

    return () => clearTimeout(debounceTimer);
  }, [profile]);

  // Track real active session playing time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setProfile((prev) => ({
        ...prev,
        stats: {
          ...prev.stats,
          timePlayedSeconds: (prev.stats?.timePlayedSeconds || 0) + 60,
        },
      }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col w-full h-screen bg-stone-950 text-stone-100 font-sans select-none overflow-hidden">
      {/* Top Google Ad Banner (Displayed at the top of the site outside active card table) */}
      {currentScreen !== 'table' && !showProfileModal && (
        <GoogleAdBanner
          onAdClickReward={() => {
            setProfile((prev) => ({
              ...prev,
              chips: prev.chips + 25,
            }));
          }}
        />
      )}



      {/* 6 Outer Fixed Floating Buttons around the screen (Home only) */}
      {currentScreen === 'home' && !showProfileModal && (
        <SixOuterButtons
          isGameplay={currentScreen === 'table'}
          isProfileOpen={showProfileModal}
          isHamburgerOpen={showHamburgerModal}
          isLiveVideoOpen={showTwitchChat}
          isDMsOpen={showDMsModal}
          isAssistantOpen={showAssistantModal}
          isSlotsOpen={showSlotsModal}
          onOpenProfile={() => setShowProfileModal(true)}
          onOpenHamburger={() => setShowHamburgerModal(true)}
          onOpenLiveVideo={() => setShowTwitchChat((prev) => !prev)}
          onOpenDMs={() => {
            setDmsThreadId(undefined);
            setShowDMsModal((prev) => !prev);
          }}
          onOpenAssistant={() => setShowAssistantModal(true)}
          onOpenSlots={() => setShowSlotsModal(true)}
          onOpenStats={() => setShowProfileModal(true)}
          onOpenRules={() => setShowRulesGuideModal(true)}
          onOpenMusic={() => setShowMusicModal(true)}
          onExitTable={() => setCurrentScreen('map')}
        />
      )}

      {/* Main View Screen Area */}
      <main className="flex-1 w-full h-full relative overflow-y-auto">
        {currentScreen === 'home' && (
          <div className={showProfileModal ? 'hidden' : 'contents'}>
            <HomeScreenHub
              playerProfile={profile}
              selectedTown={selectedTown}
              mainMenuTheme={mainMenuTheme}
              onOpenThemes={() => setShowThemesModal(true)}
              onStartGame={() => setCurrentScreen('map')} // Campaign mode opens 2.5D city world!
              onOpenMap={() => setCurrentScreen('map')}
              onOpenCampaign={() => setCurrentScreen('map')}
              onOpenProgression={() => setShowProgressionModal(true)}
              onOpenCalendar={() => setShowCalendarModal(true)}
              onOpenShop={() => setShowShopModal(true)}
              onOpenRules={() => setShowRulesGuideModal(true)}
              onOpenHats={() => setShowHatsModal(true)}
              onOpenProfile={() => setShowProfileModal(true)}
              onOpenProperties={() => setShowPropertiesModal(true)}
              onOpenHamburger={() => setShowHamburgerModal(true)}
              onOpenMusic={() => setShowMusicModal(true)}
              onOpenLiveVideo={() => setCurrentScreen('live_video')}
              onOpenSettings={() => setShowSettingsModal(true)}
              onOpenFAQ={() => setShowFAQModal(true)}
              onOpenDailyDice={() => setShowDailyDiceModal(true)}
              onOpenLeaderboard={() => setShowLeaderboardModal(true)}
              onOpenSinglePlayer={() => setCurrentScreen('single_player')}
              onOpenMultiplayer={() => setCurrentScreen('multiplayer')}
              onOpenSlots={() => setShowSlotsModal(true)}
              onOpenAssistant={() => setShowAssistantModal(true)}
              onlineNow={realtimeStats.onlineNow}
              allTimeVisitors={realtimeStats.allTimeVisitors}
            />
          </div>
        )}

        {currentScreen === 'single_player' && (
          <SinglePlayerScreen
            playerProfile={profile}
            onReturnToHome={() => setCurrentScreen('home')}
            onStartMatch={(config) => {
              setCurrentScreen('table');
            }}
          />
        )}

        {currentScreen === 'multiplayer' && (
          <MultiplayerScreen
            playerProfile={profile}
            onReturnToHome={() => setCurrentScreen('home')}
            onJoinTable={() => setCurrentScreen('table')}
          />
        )}

        {currentScreen === 'live_video' && (
          <YouTubeLiveScreen
            onReturnToHome={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'map' && (
          <CampaignWorldScreen
            playerProfile={profile}
            currentTown={selectedTown}
            onSelectTown={(town) => {
              setSelectedTown(town);
              setCurrentScreen('table');
            }}
            onOpenSettings={() => setShowSettingsModal(true)}
            onReturnToMainMenu={() => setCurrentScreen('home')}
            onOpenProperties={() => setShowPropertiesModal(true)}
            onOpenShop={() => setShowShopModal(true)}
            onOpenProgression={() => setShowProgressionModal(true)}
          />
        )}

        {currentScreen === 'table' && (
          <EuchreTable
            playerProfile={profile}
            currentTown={selectedTown}
            onExitTable={() => setCurrentScreen('map')}
            onReturnToMainMenu={() => setCurrentScreen('home')}
            onOpenSettings={() => setShowSettingsModal(true)}
            onOpenMusic={() => setShowMusicModal(true)}
            onOpenAchievements={() => setShowProgressionModal(true)}
            onUpdateProfile={(updated) => setProfile(updated)}
            cameraAngle={cameraAngle}
            inGameTheme={inGameTheme}
          />
        )}
      </main>

      {/* Twitch Live Chat Drawer Overlay (Only when not at table) */}
      {showTwitchChat && currentScreen !== 'table' && (
        <TwitchLiveChat onClose={() => setShowTwitchChat(false)} />
      )}

      {/* Modals */}
      <SlotsModal
        isOpen={showSlotsModal}
        onClose={() => setShowSlotsModal(false)}
        coins={profile.chips}
        onUpdateCoins={(newAmount) => setProfile((prev) => ({ ...prev, chips: newAmount }))}
      />

      <PalaceAssistantModal
        isOpen={showAssistantModal}
        onClose={() => setShowAssistantModal(false)}
        playerProfile={profile}
      />

      <DirectMessagesModal
        isOpen={showDMsModal}
        initialChatThreadId={dmsThreadId}
        onClose={() => {
          setShowDMsModal(false);
          setDmsThreadId(undefined);
        }}
      />

      <MailboxModal
        isOpen={showMailboxModal}
        onClose={() => setShowMailboxModal(false)}
        onOpenDMs={() => setShowDMsModal(true)}
        onAcceptChallenge={(challenge) => {
          const matchedTown = TOWNS_DATA.find((t) => t.id === challenge.townId) || TOWNS_DATA[0];
          setSelectedTown(matchedTown);
          setCurrentScreen('table');
        }}
      />

      <PlayerProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        playerProfile={profile}
        activeProfileThemeId={profileTheme}
        onOpenEditProfile={() => setShowEditProfileModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenDMs={(threadId) => {
          setDmsThreadId(threadId);
          setShowDMsModal(true);
        }}
        onUpdatePlayerProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />

      <EditProfileModal
        isOpen={showEditProfileModal}
        onClose={() => setShowEditProfileModal(false)}
        playerProfile={profile}
        onSaveProfile={(updated) => setProfile((prev) => ({ ...prev, ...updated }))}
      />

      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      <FAQModal
        isOpen={showFAQModal}
        onClose={() => setShowFAQModal(false)}
        playerProfile={profile}
      />

      <DailyDiceModal
        isOpen={showDailyDiceModal}
        onClose={() => setShowDailyDiceModal(false)}
        playerProfile={profile}
        onClaimReward={(tokenReward) =>
          setProfile((prev) => ({
            ...prev,
            sovereigns: (prev.sovereigns || 0) + tokenReward,
            stats: {
              ...prev.stats,
              diceRolled: (prev.stats?.diceRolled || 0) + 1,
            },
          }))
        }
      />

      <RoyalLeaderboardModal
        isOpen={showLeaderboardModal}
        onClose={() => setShowLeaderboardModal(false)}
        playerElo={profile.elo || 3240}
        playerName={profile.name || 'Texas Sovereign'}
      />

      <RulesGuideModal
        isOpen={showRulesGuideModal}
        onClose={() => setShowRulesGuideModal(false)}
        playerProfile={profile}
        onLaunchWalkthrough={() => setShowWalkthroughOverlay(true)}
      />

      <SiteWalkthroughOverlay
        isOpen={showWalkthroughOverlay}
        onClose={() => setShowWalkthroughOverlay(false)}
        playerProfile={profile}
      />

      <CampaignWorldMapModal
        isOpen={showMapModal}
        onClose={() => setShowMapModal(false)}
        playerProfile={profile}
        currentTownId={selectedTown?.id || 'el_paso'}
        onTravelToTown={(town) => {
          setSelectedTown(town);
          setCurrentScreen('table');
          setShowMapModal(false);
        }}
      />

      <DailyCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        playerProfile={profile}
        onClaimReward={handleClaimDailyReward}
      />

      <HamburgerMenuModal
        isOpen={showHamburgerModal}
        onClose={() => setShowHamburgerModal(false)}
        playerProfile={profile}
        onNavigateMap={() => setShowMapModal(true)}
        onOpenStats={() => setShowProfileModal(true)}
        onOpenProperties={() => setShowPropertiesModal(true)}
        onOpenShop={() => setShowShopModal(true)}
        onOpenCalendar={() => setShowCalendarModal(true)}
        onOpenRules={() => setShowRulesGuideModal(true)}
        onOpenMusic={() => setShowMusicModal(true)}
        onOpenThemes={() => setShowThemesModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenWatchAds={() => setShowWatchAdsModal(true)}
        onWatchAdReward={() =>
          setProfile((prev) => ({
            ...prev,
            chips: prev.chips + 25,
          }))
        }
        onResetProgress={handleResetProgress}
        cameraAngle={cameraAngle}
        onSetCameraAngle={setCameraAngle}
        paintedTheme={paintedTheme}
        onSetPaintedTheme={setPaintedTheme}
        isGameplay={currentScreen === 'table'}
      />

      <WatchAdsModal
        isOpen={showWatchAdsModal}
        onClose={() => setShowWatchAdsModal(false)}
        onClaimReward={(chips, sovereigns) => {
          setProfile((prev) => ({
            ...prev,
            chips: prev.chips + chips,
            sovereigns: (prev.sovereigns || 0) + sovereigns,
          }));
        }}
      />

      <ShopModal
        isOpen={showShopModal}
        onClose={() => setShowShopModal(false)}
        playerProfile={profile}
        onUpdateCoins={(newGold) => setProfile((prev) => ({ ...prev, gold: newGold }))}
      />

      <HatsShopModal
        isOpen={showHatsModal}
        onClose={() => setShowHatsModal(false)}
        playerProfile={profile}
        onEquipHat={(hatId) => {
          setProfile((prev) => {
            const updatedInventory = (prev.inventory || []).map((item) => {
              if (item.category === 'Hats') {
                return { ...item, equipped: item.id === hatId };
              }
              return item;
            });
            return {
              ...prev,
              currentHatId: hatId,
              inventory: updatedInventory,
            };
          });
        }}
        onBuyHat={(hat) => {
          setProfile((prev) => {
            const newItem: InventoryItem = {
              id: hat.id,
              name: hat.name,
              tier: hat.rarity === 'Legendary' ? 'legendary' : hat.rarity === 'Epic' ? 'rare' : hat.rarity === 'Rare' ? 'rare' : 'common',
              category: 'Hats',
              icon: hat.previewIcon || '🤠',
              acquiredAt: 'Palace Shop Purchase',
              equipped: false,
            };
            return {
              ...prev,
              gold: Math.max(0, prev.gold - (hat.costGold || 0)),
              chips: Math.max(0, prev.chips - (hat.costChips || 0)),
              unlockedHats: Array.from(new Set([...(prev.unlockedHats || []), hat.id])),
              inventory: [...(prev.inventory || []), newItem],
            };
          });
        }}
      />

      <PropertiesModal
        isOpen={showPropertiesModal}
        onClose={() => setShowPropertiesModal(false)}
        playerProfile={profile}
        onBuyProperty={(prop) =>
          setProfile((prev) => ({
            ...prev,
            chips: prev.chips - prop.cost,
            properties: {
              ...prev.properties,
              [prop.id]: { owned: true, level: 1, lastCollected: Date.now() },
            },
          }))
        }
        onUpgradeProperty={(prop) =>
          setProfile((prev) => {
            const level = prev.properties[prop.id]?.level || 1;
            return {
              ...prev,
              chips: prev.chips - Math.floor(prop.upgradeCost * Math.pow(1.6, level - 1)),
              properties: {
                ...prev.properties,
                [prop.id]: { ...prev.properties[prop.id], level: level + 1 },
              },
            };
          })
        }
        onCollectIncome={(totalIncome) =>
          setProfile((prev) => ({
            ...prev,
            chips: prev.chips + totalIncome,
          }))
        }
      />

      <StatsCareerModal
        isOpen={showStatsModal}
        onClose={() => setShowStatsModal(false)}
        playerProfile={profile}
        onResetProgress={handleResetProgress}
      />

      <TopLeftGovernorBonusModal
        isOpen={showTopLeftModal}
        onClose={() => setShowTopLeftModal(false)}
        playerProfile={profile}
        onClaimReward={(chips, gold) =>
          setProfile((prev) => ({ ...prev, chips: prev.chips + chips, gold: prev.gold + gold }))
        }
      />

      <ProgressionModal
        isOpen={showProgressionModal}
        onClose={() => setShowProgressionModal(false)}
        onRewardClaimed={(coins, xp) => {
          setProfile((prev) => ({
            ...prev,
            chips: prev.chips + coins,
            xp: (prev.xp || 0) + xp,
          }));
        }}
      />

      <ThemesModal
        isOpen={showThemesModal}
        onClose={() => setShowThemesModal(false)}
        coinsBalance={profile.chips}
        activeMainMenuThemeId={mainMenuTheme}
        activeProfileThemeId={profileTheme}
        activeInGameThemeId={inGameTheme}
        onApplyTheme={(themeId, category) => {
          if (category === 'main_menu') {
            setMainMenuTheme(themeId);
            try {
              localStorage.setItem('euchre_main_menu_theme_v2', themeId);
            } catch {}
          } else if (category === 'profile') {
            setProfileTheme(themeId);
            try {
              localStorage.setItem('euchre_profile_theme_v2', themeId);
            } catch {}
          } else if (category === 'in_game') {
            setInGameTheme(themeId);
            try {
              localStorage.setItem('euchre_in_game_theme_v2', themeId);
            } catch {}
          }
        }}
        onUnlockTheme={(themeId, costCoins) => {
          setProfile((prev) => ({
            ...prev,
            chips: Math.max(0, prev.chips - costCoins),
          }));
        }}
      />

      <MusicModal
        isOpen={showMusicModal}
        onClose={() => setShowMusicModal(false)}
      />
    </div>
  );
}
