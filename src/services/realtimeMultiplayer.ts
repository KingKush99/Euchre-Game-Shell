import { collection, doc, setDoc, updateDoc, onSnapshot, query, limit, getDoc, deleteDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Card, Suit } from '../types/poker';

export interface MultiplayerPlayer {
  id: string;
  name: string;
  avatar: string;
  seatIndex: number;
  team: 1 | 2;
  isHost?: boolean;
  isReady?: boolean;
  cards?: Card[];
  score?: number;
}

export interface RealtimeRoomState {
  roomId: string;
  roomName: string;
  hostId: string;
  maxPlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  players: MultiplayerPlayer[];
  currentTurnSeat: number;
  trumpSuit: Suit | null;
  upCard: Card | null;
  makerSeat: number | null;
  makerTeam: 1 | 2 | null;
  isLoner: boolean;
  playedCards: { seatIndex: number; card: Card }[];
  leadSuit: Suit | null;
  tricksWon: [number, number]; // [Team 1, Team 2]
  matchScore: [number, number]; // [Team 1, Team 2]
  createdAt: string;
  updatedAt: string;
}

// 1. Subscribe to all active rooms in lobby
export function subscribeMultiplayerLobby(onRoomsChange: (rooms: RealtimeRoomState[]) => void) {
  const roomsRef = collection(db, 'multiplayer_rooms');
  const q = query(roomsRef, limit(30));

  return onSnapshot(q, (snapshot) => {
    const list: RealtimeRoomState[] = [];
    snapshot.docs.forEach((docSnap) => {
      list.push(docSnap.data() as RealtimeRoomState);
    });
    onRoomsChange(list);
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, 'multiplayer_rooms');
  });
}

// 2. Subscribe to a specific active room
export function subscribeRoomState(roomId: string, onUpdate: (room: RealtimeRoomState | null) => void) {
  if (!roomId) return () => {};
  const roomRef = doc(db, 'multiplayer_rooms', roomId);

  return onSnapshot(roomRef, (docSnap) => {
    if (docSnap.exists()) {
      onUpdate(docSnap.data() as RealtimeRoomState);
    } else {
      onUpdate(null);
    }
  }, (err) => {
    handleFirestoreError(err, OperationType.GET, `multiplayer_rooms/${roomId}`);
  });
}

// 3. Create room
export async function createRealtimeRoom(
  roomName: string,
  hostPlayer: { id: string; name: string; avatar: string }
): Promise<RealtimeRoomState> {
  const roomId = `room_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const roomRef = doc(db, 'multiplayer_rooms', roomId);

  const initialRoom: RealtimeRoomState = {
    roomId,
    roomName: roomName || `${hostPlayer.name}'s High Roller Table`,
    hostId: hostPlayer.id,
    maxPlayers: 4,
    status: 'waiting',
    players: [
      {
        id: hostPlayer.id,
        name: hostPlayer.name,
        avatar: hostPlayer.avatar,
        seatIndex: 0,
        team: 1,
        isHost: true,
        isReady: true,
      },
    ],
    currentTurnSeat: 0,
    trumpSuit: null,
    upCard: null,
    makerSeat: null,
    makerTeam: null,
    isLoner: false,
    playedCards: [],
    leadSuit: null,
    tricksWon: [0, 0],
    matchScore: [0, 0],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    await setDoc(roomRef, initialRoom);
    return initialRoom;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `multiplayer_rooms/${roomId}`);
    throw err;
  }
}

// 4. Join room
export async function joinRealtimeRoom(
  roomId: string,
  player: { id: string; name: string; avatar: string }
) {
  const roomRef = doc(db, 'multiplayer_rooms', roomId);
  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) throw new Error('Room not found');

    const roomData = snap.data() as RealtimeRoomState;
    const existingPlayer = roomData.players.find((p) => p.id === player.id);

    if (existingPlayer) return roomData;

    if (roomData.players.length >= 4) {
      throw new Error('Table is full (4/4 players)');
    }

    const nextSeat = roomData.players.length;
    const newPlayer: MultiplayerPlayer = {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      seatIndex: nextSeat,
      team: (nextSeat % 2 === 0 ? 1 : 2) as 1 | 2,
      isReady: true,
    };

    const updatedPlayers = [...roomData.players, newPlayer];
    const updatePayload: Partial<RealtimeRoomState> = {
      players: updatedPlayers,
      updatedAt: new Date().toISOString(),
    };

    if (updatedPlayers.length === 4 && roomData.status === 'waiting') {
      updatePayload.status = 'in_progress';
    }

    await updateDoc(roomRef, updatePayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `multiplayer_rooms/${roomId}`);
    throw err;
  }
}

// 5. Play a card in real-time match
export async function playCardRealtime(
  roomId: string,
  seatIndex: number,
  card: Card,
  nextTurnSeat: number,
  leadSuit: Suit | null,
  tricksWon?: [number, number]
) {
  const roomRef = doc(db, 'multiplayer_rooms', roomId);
  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data() as RealtimeRoomState;
    const updatedPlayed = [...data.playedCards, { seatIndex, card }];

    await updateDoc(roomRef, {
      playedCards: updatedPlayed,
      currentTurnSeat: nextTurnSeat,
      leadSuit: data.playedCards.length === 0 ? card.suit : data.leadSuit,
      tricksWon: tricksWon || data.tricksWon,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `multiplayer_rooms/${roomId}`);
  }
}

// 6. Reset round / trick in real-time
export async function updateRealtimeMatchState(
  roomId: string,
  updates: Partial<RealtimeRoomState>
) {
  const roomRef = doc(db, 'multiplayer_rooms', roomId);
  try {
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `multiplayer_rooms/${roomId}`);
  }
}

// 7. Leave / close room
export async function leaveRealtimeRoom(roomId: string, playerId: string) {
  const roomRef = doc(db, 'multiplayer_rooms', roomId);
  try {
    const snap = await getDoc(roomRef);
    if (!snap.exists()) return;

    const data = snap.data() as RealtimeRoomState;
    if (data.hostId === playerId) {
      await deleteDoc(roomRef);
    } else {
      const remaining = data.players.filter((p) => p.id !== playerId);
      await updateDoc(roomRef, {
        players: remaining,
        updatedAt: new Date().toISOString(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `multiplayer_rooms/${roomId}`);
  }
}
