import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  };
}

export let isFirestoreQuotaExhausted = false;

export function checkAndSetQuotaExhausted(error: unknown): boolean {
  const errMsg = error instanceof Error ? error.message : String(error);
  const errCode = (error as any)?.code || '';
  if (errCode === 'resource-exhausted' || errMsg.includes('resource-exhausted') || errMsg.includes('Quota limit exceeded')) {
    if (!isFirestoreQuotaExhausted) {
      isFirestoreQuotaExhausted = true;
      console.warn('Firestore daily write quota reached; switched seamlessly to local-first mode.');
    }
    return true;
  }
  return false;
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  if (checkAndSetQuotaExhausted(error)) {
    return;
  }
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'presence', 'test_connection'));
  } catch (error) {
    if (checkAndSetQuotaExhausted(error)) {
      return;
    }
    if (error instanceof Error && error.message.includes('offline')) {
      console.warn("Firestore connection notice: client offline or syncing.");
    }
  }
}
