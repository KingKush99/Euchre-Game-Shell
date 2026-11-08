export interface MailboxFriendRequest {
  id: string;
  name: string;
  username: string;
  avatar: string;
  level: number;
  time: string;
  status: 'pending' | 'accepted' | 'declined';
  city: string;
}

export interface MailboxMessage {
  id: string;
  senderName: string;
  senderUsername: string;
  avatar: string;
  text: string;
  time: string;
  unread: boolean;
  tableChallenge?: {
    townId: string;
    townName: string;
    stake: number;
    mode: 'cash' | 'tournament' | 'boss_duel';
  };
}

export interface MailboxProfileVisit {
  id: string;
  visitorName: string;
  visitorUsername: string;
  avatar: string;
  level: number;
  time: string;
  viewedDeck: string;
  townTitle: string;
}

export interface MailboxSystemGift {
  id: string;
  title: string;
  description: string;
  chipsReward: number;
  sovereignsReward: number;
  time: string;
  claimed: boolean;
  icon: string;
}

export interface MailboxState {
  friends: MailboxFriendRequest[];
  messages: MailboxMessage[];
  visits: MailboxProfileVisit[];
  systemGifts: MailboxSystemGift[];
}

const STORAGE_KEY_MAILBOX = 'euchre_real_mailbox_state_v2';

export const INITIAL_MAILBOX_STATE: MailboxState = {
  friends: [
    {
      id: 'fr_1',
      name: 'Texas Gunslinger',
      username: 'TexasGunslinger',
      avatar: '🤠',
      level: 7,
      time: '12m ago',
      status: 'pending',
      city: 'Pine Hollow',
    },
    {
      id: 'fr_2',
      name: 'Austin Ace',
      username: 'AustinAce_99',
      avatar: '🕶️',
      level: 11,
      time: '1h ago',
      status: 'pending',
      city: 'Riverbend',
    },
    {
      id: 'fr_3',
      name: 'Palace Queen',
      username: 'PalaceQueen99',
      avatar: '🦊',
      level: 9,
      time: '3h ago',
      status: 'pending',
      city: 'Kingsport',
    },
  ],
  messages: [
    {
      id: 'msg_1',
      senderName: 'Elder Silas',
      senderUsername: 'ElderSilas',
      avatar: '🤠',
      text: 'Good deal today in Pine Hollow! Ready for a 4-player cash match at the Card House?',
      time: '8m ago',
      unread: true,
      tableChallenge: {
        townId: 'pine_hollow',
        townName: 'Pine Hollow Card House',
        stake: 50,
        mode: 'cash',
      },
    },
    {
      id: 'msg_2',
      senderName: 'Captain Vance',
      senderUsername: 'CaptainVance',
      avatar: '⛵',
      text: 'The River Table tournament is kicking off soon. 750 chip prize pool is waiting!',
      time: '45m ago',
      unread: true,
      tableChallenge: {
        townId: 'riverbend',
        townName: 'The River Table',
        stake: 150,
        mode: 'tournament',
      },
    },
    {
      id: 'msg_3',
      senderName: 'Amina Ace',
      senderUsername: 'AminaAce',
      avatar: '🐅',
      text: 'Loved watching your loner call earlier! Join me for a game whenever you are online.',
      time: '2h ago',
      unread: false,
    },
  ],
  visits: [
    {
      id: 'vis_1',
      visitorName: 'Houston Grandmaster',
      visitorUsername: 'HoustonBoss',
      avatar: '👑',
      level: 14,
      time: '5m ago',
      viewedDeck: 'Royal Sovereign 24k Deck',
      townTitle: 'Crown City Champion',
    },
    {
      id: 'vis_2',
      visitorName: 'El Paso Pete',
      visitorUsername: 'ElPasoPete',
      avatar: '🌵',
      level: 8,
      time: '22m ago',
      viewedDeck: 'Vintage Bison Western Deck',
      townTitle: 'Desert Outlaw',
    },
    {
      id: 'vis_3',
      visitorName: 'San Antonio Sam',
      visitorUsername: 'SanAntonioSam',
      avatar: '⭐',
      level: 16,
      time: '1h ago',
      viewedDeck: 'Ruby Velvet Tournament Deck',
      townTitle: 'Lone Star Legend',
    },
    {
      id: 'vis_4',
      visitorName: 'Dallas Dealer',
      visitorUsername: 'DallasDealer',
      avatar: '🎩',
      level: 10,
      time: '3h ago',
      viewedDeck: 'Classic Green Baize Deck',
      townTitle: 'Saloon Manager',
    },
  ],
  systemGifts: [
    {
      id: 'gift_1',
      title: 'Daily Saloon Governor Stipend',
      description: 'The Pine Hollow council has awarded you complimentary card chips for daily campaign play.',
      chipsReward: 350,
      sovereignsReward: 15,
      time: '10m ago',
      claimed: false,
      icon: '🎁',
    },
    {
      id: 'gift_2',
      title: 'Trick Taker Milestone Bonus',
      description: 'Congratulations on sweeping 5 tricks in your last Euchre session!',
      chipsReward: 500,
      sovereignsReward: 25,
      time: '2h ago',
      claimed: false,
      icon: '🏆',
    },
  ],
};

export function loadMailboxState(): MailboxState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_MAILBOX);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // fallback
  }
  return INITIAL_MAILBOX_STATE;
}

export function saveMailboxState(state: MailboxState): void {
  try {
    localStorage.setItem(STORAGE_KEY_MAILBOX, JSON.stringify(state));
  } catch {
    // ignore
  }
}
