import { doc, setDoc, onSnapshot, getDoc, collection, getDocs } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExhausted, checkAndSetQuotaExhausted } from '../lib/firebase';
import { PlayerProfile, InventoryItem } from '../types/poker';

// Real community members seeded in Firestore if directory is empty
export const COMMUNITY_SEED_MEMBERS: Partial<PlayerProfile & { userId: string }>[] = [
  {
    userId: 'comm_amina_ace',
    name: 'Amina Ace',
    username: 'AminaAce',
    bio: 'Queen of Hearts. San Antonio tournament finalist.',
    mascot: '🦊',
    level: 14,
    xp: 42000,
    chips: 1850000,
    gold: 320,
    sovereigns: 840,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction', 'lakeview', 'fairhaven'],
    followers: ['comm_dice_mage', 'comm_dallas_dan', 'comm_lonestar_lola'],
    following: ['comm_priya_plays', 'comm_governor_gus'],
    friends: ['comm_dice_mage', 'comm_dallas_dan'],
    stats: {
      handsPlayed: 342,
      handsWon: 231,
      tournamentsPlayed: 14,
      tournamentsWon: 5,
      bossesDefeated: 6,
      biggestPotWon: 45000,
      totalChipsWon: 2840000,
      euchreSweeps: 48,
      lonerWins: 32,
      perfectRounds: 18,
      pawnCaptures: 124,
      diceRolled: 86,
      longestStreak: 9,
      currentStreak: 3,
      timePlayedSeconds: 43200,
      fastestWinSeconds: 184,
      dailyRewardsClaimed: 22,
      medalsUnlocked: 10,
    },
    inventory: [
      { id: 'inv_amina_hat', name: 'Bandido Feather Fedora', tier: 'rare', category: 'Hats', icon: '🤠', equipped: true },
      { id: 'inv_amina_badge', name: 'Alamo Alamo Bandana', tier: 'rare', category: 'Pawns', icon: '🧣', equipped: true },
      { id: 'inv_amina_deck', name: 'San Antonio Silver Deck', tier: 'legendary', category: 'Decks', icon: '🃏', equipped: true },
    ],
  },
  {
    userId: 'comm_dice_mage',
    name: 'Dice Mage',
    username: 'DiceMage',
    bio: 'Yahtzee roller by day, Euchre trick counter by night.',
    mascot: '🎲',
    level: 9,
    xp: 24500,
    chips: 760000,
    gold: 140,
    sovereigns: 410,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing'],
    followers: ['comm_amina_ace', 'comm_prairie_pete'],
    following: ['comm_amina_ace', 'comm_governor_gus'],
    friends: ['comm_amina_ace'],
    stats: {
      handsPlayed: 184,
      handsWon: 112,
      tournamentsPlayed: 8,
      tournamentsWon: 2,
      bossesDefeated: 3,
      biggestPotWon: 22000,
      totalChipsWon: 980000,
      euchreSweeps: 22,
      lonerWins: 14,
      perfectRounds: 8,
      pawnCaptures: 62,
      diceRolled: 140,
      longestStreak: 6,
      currentStreak: 2,
      timePlayedSeconds: 28800,
      fastestWinSeconds: 210,
      dailyRewardsClaimed: 18,
      medalsUnlocked: 6,
    },
    inventory: [
      { id: 'inv_dice_hat', name: 'Bronze Gambler Hat', tier: 'common', category: 'Hats', icon: '🎩', equipped: true },
      { id: 'inv_dice_deck', name: 'Austin Circuit Deck', tier: 'rare', category: 'Decks', icon: '🎴', equipped: true },
    ],
  },
  {
    userId: 'comm_priya_plays',
    name: 'Priya Plays',
    username: 'PriyaPlays',
    bio: 'Leading loners in Houston. Streaming cards every weekend!',
    mascot: '⭐',
    level: 12,
    xp: 36000,
    chips: 1420000,
    gold: 280,
    sovereigns: 670,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction', 'lakeview'],
    followers: ['comm_amina_ace', 'comm_lonestar_lola', 'comm_cardsharp_sam'],
    following: ['comm_dallas_dan', 'comm_governor_gus'],
    friends: ['comm_lonestar_lola'],
    stats: {
      handsPlayed: 268,
      handsWon: 178,
      tournamentsPlayed: 11,
      tournamentsWon: 4,
      bossesDefeated: 5,
      biggestPotWon: 38000,
      totalChipsWon: 1890000,
      euchreSweeps: 36,
      lonerWins: 25,
      perfectRounds: 14,
      pawnCaptures: 94,
      diceRolled: 92,
      longestStreak: 8,
      currentStreak: 4,
      timePlayedSeconds: 38400,
      fastestWinSeconds: 168,
      dailyRewardsClaimed: 26,
      medalsUnlocked: 8,
    },
    inventory: [
      { id: 'inv_priya_hat', name: 'Stetson Classic Silver', tier: 'rare', category: 'Hats', icon: '🤠', equipped: true },
      { id: 'inv_priya_spurs', name: 'Houston Astro Spurs', tier: 'legendary', category: 'Pawns', icon: '👢', equipped: true },
    ],
  },
  {
    userId: 'comm_dallas_dan',
    name: 'Dallas Dan',
    username: 'DallasDan',
    bio: 'High stakes only. If you don’t order up, get out of the way.',
    mascot: '🤠',
    level: 18,
    xp: 68000,
    chips: 3890000,
    gold: 650,
    sovereigns: 1850,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction', 'lakeview', 'fairhaven', 'old_crown', 'kingsport'],
    followers: ['comm_amina_ace', 'comm_priya_plays', 'comm_prairie_pete', 'comm_cardsharp_sam'],
    following: ['comm_governor_gus', 'comm_lonestar_lola'],
    friends: ['comm_amina_ace', 'comm_governor_gus'],
    stats: {
      handsPlayed: 512,
      handsWon: 368,
      tournamentsPlayed: 22,
      tournamentsWon: 9,
      bossesDefeated: 8,
      biggestPotWon: 85000,
      totalChipsWon: 6200000,
      euchreSweeps: 84,
      lonerWins: 58,
      perfectRounds: 34,
      pawnCaptures: 198,
      diceRolled: 110,
      longestStreak: 12,
      currentStreak: 5,
      timePlayedSeconds: 68400,
      fastestWinSeconds: 142,
      dailyRewardsClaimed: 35,
      medalsUnlocked: 12,
    },
    inventory: [
      { id: 'inv_dan_hat', name: 'High Roller Stetson', tier: 'legendary', category: 'Hats', icon: '👑', equipped: true },
      { id: 'inv_dan_ring', name: 'Governor Diamond Ring', tier: 'legendary', category: 'Trophies', icon: '💍', equipped: true },
    ],
  },
  {
    userId: 'comm_lonestar_lola',
    name: 'LoneStar Lola',
    username: 'LoneStarLola',
    bio: 'Fort Worth Stockyards regular. Texas state champion runner-up.',
    mascot: '🐴',
    level: 22,
    xp: 94000,
    chips: 5200000,
    gold: 890,
    sovereigns: 2900,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction', 'lakeview', 'fairhaven', 'old_crown', 'kingsport', 'grand_club_city'],
    followers: ['comm_amina_ace', 'comm_priya_plays', 'comm_dallas_dan', 'comm_cardsharp_sam'],
    following: ['comm_governor_gus', 'comm_amina_ace'],
    friends: ['comm_priya_plays', 'comm_governor_gus'],
    stats: {
      handsPlayed: 680,
      handsWon: 492,
      tournamentsPlayed: 28,
      tournamentsWon: 13,
      bossesDefeated: 9,
      biggestPotWon: 120000,
      totalChipsWon: 8900000,
      euchreSweeps: 112,
      lonerWins: 78,
      perfectRounds: 46,
      pawnCaptures: 260,
      diceRolled: 165,
      longestStreak: 15,
      currentStreak: 7,
      timePlayedSeconds: 92000,
      fastestWinSeconds: 125,
      dailyRewardsClaimed: 48,
      medalsUnlocked: 14,
    },
    inventory: [
      { id: 'inv_lola_crown', name: 'Sovereign Dragon Crown', tier: 'god', category: 'Hats', icon: '🐉', equipped: true },
      { id: 'inv_lola_cape', name: 'Royal Velvet Cape', tier: 'legendary', category: 'Felts', icon: '✨', equipped: true },
    ],
  },
  {
    userId: 'comm_cardsharp_sam',
    name: 'CardSharp Sam',
    username: 'CardSharpSam',
    bio: 'Never bet against the Left Bower.',
    mascot: '🃏',
    level: 11,
    xp: 31000,
    chips: 1150000,
    gold: 210,
    sovereigns: 520,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction'],
    followers: ['comm_prairie_pete'],
    following: ['comm_priya_plays', 'comm_lonestar_lola'],
    friends: [],
    stats: {
      handsPlayed: 220,
      handsWon: 142,
      tournamentsPlayed: 9,
      tournamentsWon: 3,
      bossesDefeated: 4,
      biggestPotWon: 32000,
      totalChipsWon: 1450000,
      euchreSweeps: 28,
      lonerWins: 18,
      perfectRounds: 11,
      pawnCaptures: 82,
      diceRolled: 74,
      longestStreak: 7,
      currentStreak: 1,
      timePlayedSeconds: 31200,
      fastestWinSeconds: 195,
      dailyRewardsClaimed: 19,
      medalsUnlocked: 7,
    },
    inventory: [
      { id: 'inv_sam_hat', name: 'Sheriff Silver Stetson', tier: 'rare', category: 'Hats', icon: '🤠', equipped: true },
    ],
  },
  {
    userId: 'comm_governor_gus',
    name: 'Governor Gus',
    username: 'GovernorGus',
    bio: 'Supreme Sovereign of Crown Capital. Reigning Texas Euchre Grandmaster.',
    mascot: '👑',
    level: 30,
    xp: 185000,
    chips: 12500000,
    gold: 2400,
    sovereigns: 8500,
    conqueredTowns: ['pine_hollow', 'riverbend', 'maple_crossing', 'iron_junction', 'lakeview', 'fairhaven', 'old_crown', 'kingsport', 'grand_club_city', 'crown_capital'],
    followers: ['comm_amina_ace', 'comm_dice_mage', 'comm_priya_plays', 'comm_dallas_dan', 'comm_lonestar_lola', 'comm_cardsharp_sam'],
    following: ['comm_lonestar_lola', 'comm_dallas_dan'],
    friends: ['comm_lonestar_lola', 'comm_dallas_dan'],
    stats: {
      handsPlayed: 1240,
      handsWon: 980,
      tournamentsPlayed: 45,
      tournamentsWon: 26,
      bossesDefeated: 10,
      biggestPotWon: 350000,
      totalChipsWon: 24500000,
      euchreSweeps: 245,
      lonerWins: 182,
      perfectRounds: 95,
      pawnCaptures: 520,
      diceRolled: 280,
      longestStreak: 21,
      currentStreak: 12,
      timePlayedSeconds: 184000,
      fastestWinSeconds: 98,
      dailyRewardsClaimed: 60,
      medalsUnlocked: 16,
    },
    inventory: [
      { id: 'inv_gus_crown', name: 'Imperial Sovereign Crown', tier: 'god', category: 'Hats', icon: '👑', equipped: true },
      { id: 'inv_gus_trident', name: 'Corpus Christi Golden Trident', tier: 'god', category: 'Trophies', icon: '🔱', equipped: true },
      { id: 'inv_gus_felt', name: 'Grandmaster Gold Woven Felt', tier: 'god', category: 'Felts', icon: '✨', equipped: true },
    ],
  },
];

export function subscribeRealtimeProfile(
  userId: string,
  onProfileUpdate: (profileData: Partial<PlayerProfile>) => void
) {
  if (!userId) return () => {};

  const profileRef = doc(db, 'user_profiles', userId);

  return onSnapshot(profileRef, (docSnap) => {
    if (docSnap.exists()) {
      onProfileUpdate(docSnap.data() as Partial<PlayerProfile>);
    }
  }, (err) => {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.GET, `user_profiles/${userId}`);
    }
  });
}

export async function saveRealtimeProfile(userId: string, profile: PlayerProfile) {
  if (!userId || isFirestoreQuotaExhausted) return;

  try {
    const profileRef = doc(db, 'user_profiles', userId);
    await setDoc(profileRef, {
      userId,
      name: profile.name || 'Euchre Sovereign',
      username: profile.username || 'PalaceQueen99',
      bio: profile.bio || 'One card, one chip, one brilliant line at a time.',
      avatar: profile.customAvatarUrl || profile.mascot || '🤠',
      level: profile.level ?? 1,
      xp: profile.xp ?? 0,
      chips: profile.chips ?? 1000,
      gold: profile.gold ?? 25,
      sovereigns: profile.sovereigns ?? 15,
      followers: profile.followers || [],
      following: profile.following || [],
      friends: profile.friends || [],
      friendRequests: profile.friendRequests || [],
      inventory: profile.inventory || [],
      stats: profile.stats || {},
      conqueredTowns: profile.conqueredTowns || [],
      claimedDailyDays: profile.claimedDailyDays || [],
      currentHatId: profile.currentHatId || 'none',
      unlockedHats: profile.unlockedHats || ['none'],
      characterConfig: profile.characterConfig || {},
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.WRITE, `user_profiles/${userId}`);
    }
  }
}

export async function loadRealtimeProfile(userId: string): Promise<Partial<PlayerProfile> | null> {
  if (!userId) return null;
  try {
    const profileRef = doc(db, 'user_profiles', userId);
    const docSnap = await getDoc(profileRef);
    if (docSnap.exists()) {
      return docSnap.data() as Partial<PlayerProfile>;
    }
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.GET, `user_profiles/${userId}`);
    }
  }
  return null;
}

// Ensure community members exist in Firestore and return all real members
export async function getCommunityProfiles(): Promise<(Partial<PlayerProfile> & { userId: string })[]> {
  if (isFirestoreQuotaExhausted) {
    return COMMUNITY_SEED_MEMBERS as (Partial<PlayerProfile> & { userId: string })[];
  }

  try {
    const profilesCol = collection(db, 'user_profiles');
    const snapshot = await getDocs(profilesCol);

    if (snapshot.size < 4) {
      return COMMUNITY_SEED_MEMBERS as (Partial<PlayerProfile> & { userId: string })[];
    }

    const profiles: (Partial<PlayerProfile> & { userId: string })[] = [];
    snapshot.forEach((snap) => {
      const data = snap.data();
      profiles.push({ ...data, userId: snap.id } as Partial<PlayerProfile> & { userId: string });
    });

    return profiles;
  } catch (err) {
    checkAndSetQuotaExhausted(err);
    return COMMUNITY_SEED_MEMBERS as (Partial<PlayerProfile> & { userId: string })[];
  }
}

// Follow / Unfollow logic that updates both parties in Firestore
export async function toggleFollowUser(
  currentUserId: string,
  targetUserId: string,
  currentFollowing: string[]
): Promise<string[]> {
  const isFollowing = currentFollowing.includes(targetUserId);
  const nextFollowing = isFollowing
    ? currentFollowing.filter((id) => id !== targetUserId)
    : [...currentFollowing, targetUserId];

  if (isFirestoreQuotaExhausted) {
    return nextFollowing;
  }

  try {
    // 1. Update current user's following list
    const currentUserRef = doc(db, 'user_profiles', currentUserId);
    await setDoc(currentUserRef, { following: nextFollowing, updatedAt: new Date().toISOString() }, { merge: true });

    // 2. Update target user's followers list in Firestore
    const targetUserRef = doc(db, 'user_profiles', targetUserId);
    const targetSnap = await getDoc(targetUserRef);
    if (targetSnap.exists()) {
      const targetData = targetSnap.data();
      const targetFollowers: string[] = targetData.followers || [];
      const updatedFollowers = isFollowing
        ? targetFollowers.filter((id) => id !== currentUserId)
        : targetFollowers.includes(currentUserId)
        ? targetFollowers
        : [...targetFollowers, currentUserId];
      await setDoc(targetUserRef, { followers: updatedFollowers, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.WRITE, `user_profiles/${currentUserId}`);
    }
  }

  return nextFollowing;
}

// Friend / Unfriend logic that updates both parties in Firestore
export async function toggleFriendUser(
  currentUserId: string,
  targetUserId: string,
  currentFriends: string[]
): Promise<string[]> {
  const isFriend = currentFriends.includes(targetUserId);
  const nextFriends = isFriend
    ? currentFriends.filter((id) => id !== targetUserId)
    : [...currentFriends, targetUserId];

  if (isFirestoreQuotaExhausted) {
    return nextFriends;
  }

  try {
    // 1. Update current user's friends list
    const currentUserRef = doc(db, 'user_profiles', currentUserId);
    await setDoc(currentUserRef, { friends: nextFriends, updatedAt: new Date().toISOString() }, { merge: true });

    // 2. Update target user's friends list
    const targetUserRef = doc(db, 'user_profiles', targetUserId);
    const targetSnap = await getDoc(targetUserRef);
    if (targetSnap.exists()) {
      const targetData = targetSnap.data();
      const targetFriends: string[] = targetData.friends || [];
      const updatedFriends = isFriend
        ? targetFriends.filter((id) => id !== currentUserId)
        : targetFriends.includes(currentUserId)
        ? targetFriends
        : [...targetFriends, currentUserId];
      await setDoc(targetUserRef, { friends: updatedFriends, updatedAt: new Date().toISOString() }, { merge: true });
    }
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.WRITE, `user_profiles/${currentUserId}`);
    }
  }

  return nextFriends;
}

// Equip or unequip an inventory item and persist to Firestore
export async function toggleEquipItem(
  userId: string,
  itemId: string,
  inventory: InventoryItem[]
): Promise<InventoryItem[]> {
  const targetItem = inventory.find((i) => i.id === itemId);
  if (!targetItem) return inventory;

  const nextEquipped = !targetItem.equipped;
  const updatedInventory = inventory.map((item) => {
    if (item.id === itemId) {
      return { ...item, equipped: nextEquipped };
    }
    // If equipping, unequip other items in same category for single slots (like Hats, Felts, Decks)
    if (nextEquipped && item.category === targetItem.category && item.category !== 'Awards' && item.category !== 'Trophies') {
      return { ...item, equipped: false };
    }
    return item;
  });

  if (isFirestoreQuotaExhausted) {
    return updatedInventory;
  }

  try {
    const userRef = doc(db, 'user_profiles', userId);
    await setDoc(userRef, { inventory: updatedInventory, updatedAt: new Date().toISOString() }, { merge: true });
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.WRITE, `user_profiles/${userId}`);
    }
  }

  return updatedInventory;
}
