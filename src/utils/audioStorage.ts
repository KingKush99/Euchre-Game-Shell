import { GameTrack } from '../types/music';

const DB_NAME = 'euchre_saloon_audio_db_v1';
const STORE_NAME = 'audio_tracks';
const METADATA_STORE = 'track_metadata';

let dbInstance: IDBDatabase | null = null;

export async function getAudioDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 2);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(METADATA_STORE)) {
        db.createObjectStore(METADATA_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result;
      resolve(dbInstance);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
}

export async function storeTrackAudio(trackId: string, audioBlob: Blob, metadata?: Partial<GameTrack>): Promise<void> {
  const db = await getAudioDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
    const audioStore = tx.objectStore(STORE_NAME);
    const metaStore = tx.objectStore(METADATA_STORE);

    audioStore.put({ id: trackId, blob: audioBlob, updatedAt: Date.now() });

    if (metadata) {
      metaStore.put({ id: trackId, metadata, updatedAt: Date.now() });
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTrackAudio(trackId: string): Promise<Blob | null> {
  try {
    const db = await getAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(trackId);

      req.onsuccess = () => {
        if (req.result && req.result.blob) {
          resolve(req.result.blob);
        } else {
          resolve(null);
        }
      };

      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function getAllCustomTrackMetadata(): Promise<GameTrack[]> {
  try {
    const db = await getAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction([METADATA_STORE], 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result || [];
        const tracks = results.map((r: { id: string; metadata: GameTrack }) => r.metadata);
        resolve(tracks);
      };

      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function deleteTrackAudio(trackId: string): Promise<void> {
  try {
    const db = await getAudioDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME, METADATA_STORE], 'readwrite');
      tx.objectStore(STORE_NAME).delete(trackId);
      tx.objectStore(METADATA_STORE).delete(trackId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // ignore
  }
}

export async function getAllStoredTrackIds(): Promise<string[]> {
  try {
    const db = await getAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction([STORE_NAME], 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAllKeys();

      req.onsuccess = () => {
        resolve((req.result || []) as string[]);
      };

      req.onerror = () => resolve([]);
    });
  } catch {
    return [];
  }
}

export async function getAllStoredTrackMetadataMap(): Promise<Record<string, Partial<GameTrack>>> {
  try {
    const db = await getAudioDB();
    return new Promise((resolve) => {
      const tx = db.transaction([METADATA_STORE], 'readonly');
      const store = tx.objectStore(METADATA_STORE);
      const req = store.getAll();

      req.onsuccess = () => {
        const results = req.result || [];
        const map: Record<string, Partial<GameTrack>> = {};
        results.forEach((r: { id: string; metadata: Partial<GameTrack> }) => {
          if (r.id && r.metadata) {
            map[r.id] = r.metadata;
          }
        });
        resolve(map);
      };

      req.onerror = () => resolve({});
    });
  } catch {
    return {};
  }
}

export async function hasStoredAudio(trackId: string): Promise<boolean> {
  const blob = await getTrackAudio(trackId);
  return !!blob;
}
