import { doc, setDoc, updateDoc, onSnapshot, collection, increment, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, isFirestoreQuotaExhausted, checkAndSetQuotaExhausted } from '../lib/firebase';

const VISITOR_ID_KEY = 'euchre_realtime_visitor_id';
const UNIQUE_COUNTED_KEY = 'euchre_unique_counted';
const VISITORS_KEY = 'euchre_all_time_visitors';

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) {
    id = `patron_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(VISITOR_ID_KEY, id);
  }
  return id;
}

export interface PresenceStats {
  onlineNow: number;
  allTimeVisitors: number;
}

export function initRealtimePresence(userName: string, onStatsUpdate: (stats: PresenceStats) => void) {
  const visitorId = getVisitorId();
  const presenceRef = doc(db, 'presence', visitorId);
  const uniqueVisitorRef = doc(db, 'unique_visitors', visitorId);
  const globalStatsRef = doc(db, 'stats', 'global');

  let allTimeCount = parseInt(localStorage.getItem(VISITORS_KEY) || '1482912', 10);
  let onlineCount = 1;

  // Immediately send initial local stats
  onStatsUpdate({
    onlineNow: onlineCount,
    allTimeVisitors: allTimeCount,
  });

  let heartbeat: any = null;

  // 1. Record visitor and increment all-time unique visitors if new (only if quota not exhausted)
  const registerPresence = async () => {
    if (isFirestoreQuotaExhausted) return;
    try {
      const alreadyCounted = localStorage.getItem(UNIQUE_COUNTED_KEY);
      let isNewUnique = !alreadyCounted;

      if (isNewUnique) {
        try {
          const uniqueSnap = await getDoc(uniqueVisitorRef);
          if (uniqueSnap.exists()) {
            isNewUnique = false;
            localStorage.setItem(UNIQUE_COUNTED_KEY, 'true');
          }
        } catch {
          // ignore read error
        }
      }

      // Record / refresh presence record
      await setDoc(presenceRef, {
        visitorId,
        name: userName || 'Saloon Patron',
        online: true,
        lastSeen: new Date().toISOString(),
      }, { merge: true });

      // If new unique visitor, store in unique_visitors and increment global counter
      if (isNewUnique) {
        localStorage.setItem(UNIQUE_COUNTED_KEY, 'true');
        await setDoc(uniqueVisitorRef, {
          visitorId,
          name: userName || 'Saloon Patron',
          firstSeen: new Date().toISOString(),
        }, { merge: true });

        await setDoc(globalStatsRef, {
          allTimeVisitors: increment(1),
          updatedAt: new Date().toISOString(),
        }, { merge: true }).catch(() => null);
      }
    } catch (err) {
      if (checkAndSetQuotaExhausted(err)) {
        if (heartbeat) clearInterval(heartbeat);
      } else {
        handleFirestoreError(err, OperationType.WRITE, 'presence');
      }
    }
  };

  registerPresence();

  // Heartbeat every 60 seconds to keep visitor active
  heartbeat = setInterval(() => {
    if (isFirestoreQuotaExhausted) {
      clearInterval(heartbeat);
      return;
    }
    updateDoc(presenceRef, {
      online: true,
      lastSeen: new Date().toISOString(),
    }).catch((err) => {
      if (checkAndSetQuotaExhausted(err)) {
        clearInterval(heartbeat);
      }
    });
  }, 60000);

  // Set offline on unload
  const handleUnload = () => {
    if (isFirestoreQuotaExhausted) return;
    updateDoc(presenceRef, {
      online: false,
      lastSeen: new Date().toISOString(),
    }).catch(() => null);
  };
  window.addEventListener('beforeunload', handleUnload);

  // Listen to global stats for true unique all-time visitor count
  const unsubStats = onSnapshot(globalStatsRef, (docSnap) => {
    if (docSnap.exists() && typeof docSnap.data().allTimeVisitors === 'number') {
      allTimeCount = docSnap.data().allTimeVisitors;
      try {
        localStorage.setItem(VISITORS_KEY, allTimeCount.toString());
      } catch {}
      onStatsUpdate({
        onlineNow: onlineCount,
        allTimeVisitors: allTimeCount,
      });
    }
  }, (err) => {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.GET, 'stats/global');
    }
  });

  // Listen to active presence records for real-time online count
  const unsubPresence = onSnapshot(collection(db, 'presence'), (snapshot) => {
    const now = Date.now();
    let activeCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.online) {
        const lastSeenMs = new Date(data.lastSeen).getTime();
        if (now - lastSeenMs < 120000) { // active within 2m
          activeCount++;
        }
      }
    });

    onlineCount = Math.max(activeCount, 1);
    onStatsUpdate({
      onlineNow: onlineCount,
      allTimeVisitors: allTimeCount,
    });
  }, (err) => {
    if (!checkAndSetQuotaExhausted(err)) {
      handleFirestoreError(err, OperationType.GET, 'presence');
    }
  });

  return () => {
    if (heartbeat) clearInterval(heartbeat);
    window.removeEventListener('beforeunload', handleUnload);
    unsubStats();
    unsubPresence();
  };
}
