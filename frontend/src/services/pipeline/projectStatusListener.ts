import { getApp, getApps, initializeApp } from 'firebase/app';
import { Firestore, connectFirestoreEmulator, doc, getFirestore, onSnapshot } from 'firebase/firestore';

import { FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT, FIRESTORE_PROJECT_ID } from '../../config/firestore';

export interface PipelineStatusUpdate {
  status: string;
  readme?: string;
  adrs?: string[];
  tickets?: string[];
}

let firestoreInstance: Firestore | null = null;

function getFirestoreClient(): Firestore {
  if (firestoreInstance) {
    return firestoreInstance;
  }

  const app = getApps().length ? getApp() : initializeApp({ projectId: FIRESTORE_PROJECT_ID });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  firestoreInstance = db;
  return db;
}

/** Wrapper isolado em volta do onSnapshot() do Firestore: o resto do
 * frontend nunca importa o SDK diretamente. Retorna a função de unsubscribe. */
export function subscribeToProjectStatus(
  projectId: string,
  onUpdate: (update: PipelineStatusUpdate) => void
): () => void {
  const ref = doc(getFirestoreClient(), 'projects', projectId);
  return onSnapshot(ref, snapshot => {
    const data = snapshot.data();
    if (data) {
      onUpdate(data as PipelineStatusUpdate);
    }
  });
}
