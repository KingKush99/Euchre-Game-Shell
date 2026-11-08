// Real-time Multiplayer Synchronization Engine for Euchre Saloon
// Uses BroadcastChannel API for multi-tab real-time sync + local room persistence

export interface MultiplayerRoomPlayer {
  id: string;
  name: string;
  avatar: string;
  seatIndex: number; // 0: South (Host), 1: West, 2: North (Partner), 3: East
  team: 1 | 2;
  isReady: boolean;
  isHost: boolean;
  ping: number;
}

export interface MultiplayerRoom {
  code: string;
  name: string;
  hostId: string;
  players: MultiplayerRoomPlayer[];
  maxPlayers: number;
  targetScore: number;
  rulesPreset: string;
  isPrivate: boolean;
  password?: string;
  status: 'lobby' | 'playing' | 'ended';
  createdAt: number;
}

export interface MultiplayerMessage {
  type:
    | 'PLAYER_JOINED'
    | 'PLAYER_LEFT'
    | 'PLAYER_READY'
    | 'START_GAME'
    | 'CARD_PLAYED'
    | 'BID_MADE'
    | 'CHAT_MESSAGE'
    | 'EMOTE_SENT'
    | 'SYNC_STATE';
  roomCode: string;
  senderId: string;
  senderName: string;
  payload: any;
  timestamp: number;
}

class MultiplayerSyncManager {
  private channel: BroadcastChannel | null = null;
  private listeners: ((msg: MultiplayerMessage) => void)[] = [];
  private currentRoomCode: string | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.channel = new BroadcastChannel('euchre_multiplayer_sync');
      this.channel.onmessage = (event: MessageEvent<MultiplayerMessage>) => {
        if (!this.currentRoomCode || event.data.roomCode === this.currentRoomCode) {
          this.listeners.forEach((listener) => listener(event.data));
        }
      };
    }
  }

  public setRoom(roomCode: string | null) {
    this.currentRoomCode = roomCode;
  }

  public getRoom(roomCode: string): MultiplayerRoom | null {
    try {
      const raw = localStorage.getItem(`euchre_room_${roomCode}`);
      if (raw) return JSON.parse(raw);
    } catch {}
    return null;
  }

  public saveRoom(room: MultiplayerRoom) {
    try {
      localStorage.setItem(`euchre_room_${room.code}`, JSON.stringify(room));
    } catch {}
  }

  public listPublicRooms(): MultiplayerRoom[] {
    const rooms: MultiplayerRoom[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('euchre_room_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const room: MultiplayerRoom = JSON.parse(raw);
            // filter rooms created in last 24h
            if (Date.now() - room.createdAt < 24 * 60 * 60 * 1000) {
              rooms.push(room);
            }
          }
        }
      }
    } catch {}

    // If no active rooms exist, provide lively sample community lobbies
    if (rooms.length === 0) {
      return [
        {
          code: 'TEXAS-409',
          name: 'The Lone Star Saloon',
          hostId: 'host-1',
          players: [
            { id: 'host-1', name: 'TexasJack', avatar: '🤠', seatIndex: 0, team: 1, isReady: true, isHost: true, ping: 24 },
            { id: 'p-2', name: 'SaloonSally', avatar: '💃', seatIndex: 1, team: 2, isReady: true, isHost: false, ping: 32 },
            { id: 'p-3', name: 'DocHolliday', avatar: '🎩', seatIndex: 2, team: 1, isReady: false, isHost: false, ping: 28 },
          ],
          maxPlayers: 4,
          targetScore: 10,
          rulesPreset: 'Standard 4 Player',
          isPrivate: false,
          status: 'lobby',
          createdAt: Date.now(),
        },
        {
          code: 'GOLD-882',
          name: 'High Stakes Frontier Cup',
          hostId: 'host-2',
          players: [
            { id: 'host-2', name: 'GoldenMaverick', avatar: '👑', seatIndex: 0, team: 1, isReady: true, isHost: true, ping: 19 },
            { id: 'p-4', name: 'BanditBob', avatar: '🕶️', seatIndex: 1, team: 2, isReady: true, isHost: false, ping: 45 },
          ],
          maxPlayers: 4,
          targetScore: 10,
          rulesPreset: 'Stick the Dealer',
          isPrivate: false,
          status: 'lobby',
          createdAt: Date.now() - 60000,
        },
      ];
    }
    return rooms;
  }

  public broadcast(msg: Omit<MultiplayerMessage, 'timestamp'>) {
    const fullMsg: MultiplayerMessage = {
      ...msg,
      timestamp: Date.now(),
    };

    if (this.channel) {
      this.channel.postMessage(fullMsg);
    }
    // Also trigger local listeners
    this.listeners.forEach((listener) => listener(fullMsg));
  }

  public subscribe(callback: (msg: MultiplayerMessage) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }
}

export const multiplayerSync = new MultiplayerSyncManager();
