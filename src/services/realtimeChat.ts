import { collection, query, orderBy, limit, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExhausted, checkAndSetQuotaExhausted } from '../lib/firebase';

export interface RealtimeChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  channelId: string;
  createdAt: string;
}

export function subscribeRealtimeMessages(
  channelId: string,
  onMessages: (msgs: RealtimeChatMessage[]) => void
) {
  const messagesRef = collection(db, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'), limit(100));

  return onSnapshot(q, (snapshot) => {
    const list: RealtimeChatMessage[] = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data() as RealtimeChatMessage;
      if (!channelId || data.channelId === channelId || channelId === 'global') {
        list.push({ ...data, id: docSnap.id });
      }
    });
    onMessages(list);
  }, (err) => {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.GET, 'messages');
    }
  });
}

export async function sendRealtimeMessage(msg: Omit<RealtimeChatMessage, 'id' | 'createdAt'>) {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const newMsg: RealtimeChatMessage = {
    ...msg,
    id: msgId,
    createdAt: new Date().toISOString(),
  };

  if (isFirestoreQuotaExhausted) {
    return newMsg;
  }

  try {
    await setDoc(doc(db, 'messages', msgId), newMsg);
    return newMsg;
  } catch (err) {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.WRITE, 'messages');
    }
    return newMsg;
  }
}
