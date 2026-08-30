import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  Firestore,
  connectFirestoreEmulator,
  getFirestore,
} from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT, FIRESTORE_PROJECT_ID } from '../../config/firestore';

export interface PipelineStatusUpdate {
  status: string;
  readme?: string;
  adrs?: string[];
  tickets?: string[];
  perguntas_abertas?: Array<{
    id: string;
    texto: string;
    opcoes: string[];
    permite_texto: boolean;
  }>;
  rodada_atual?: number;
  pronto?: boolean;
  // Artefatos para download (CONCLUIDO)
  artefatos?: {
    spec?: string;
    prd?: string;
    adrs?: string[];
    tickets?: string[];
  };
  raw_idea?: string;
}

export interface ProjectListItem {
  id: string;
  raw_idea: string;
  status: string;
}

export interface RodadaHistorico {
  numero: number;
  perguntas: Array<{
    id: string;
    texto: string;
    opcoes: string[];
    permite_texto: boolean;
  }>;
  respostas: Array<{
    pergunta_id: string;
    opcao: string | null;
    texto: string | null;
  }>;
  respondida: boolean;
}

let firestoreInstance: Firestore | null = null;

function getFirestoreClient(): Firestore {
  if (firestoreInstance) return firestoreInstance;
  const app = getApps().length ? getApp() : initializeApp({ projectId: FIRESTORE_PROJECT_ID });
  const db = getFirestore(app);
  connectFirestoreEmulator(db, FIRESTORE_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  firestoreInstance = db;
  return db;
}

/** Assina o documento de um único projeto (para o modal). */
export function subscribeToProjectStatus(
  projectId: string,
  onUpdate: (update: PipelineStatusUpdate) => void,
): () => void {
  const ref = doc(getFirestoreClient(), 'projects', projectId);
  return onSnapshot(ref, snap => {
    const data = snap.data();
    if (data) onUpdate(data as PipelineStatusUpdate);
  });
}

/** Assina a coleção de projetos filtrada por lista de status. */
export function subscribeToProjectsByStatus(
  statuses: string[],
  onUpdate: (projects: ProjectListItem[]) => void,
): () => void {
  const db = getFirestoreClient();
  const q = query(
    collection(db, 'projects'),
    where('status', 'in', statuses),
  );
  return onSnapshot(q, snap => {
    const list: ProjectListItem[] = snap.docs.map(d => ({
      id: d.id,
      raw_idea: (d.data()['raw_idea'] as string) || '(sem descrição)',
      status: (d.data()['status'] as string) || '',
    }));
    onUpdate(list);
  });
}

/** Assina a subcoleção elicitacao/{rodada} de um projeto para obter o histórico. */
export function subscribeToRodadas(
  projectId: string,
  onUpdate: (rodadas: RodadaHistorico[]) => void,
): () => void {
  const db = getFirestoreClient();
  const col = collection(db, 'projects', projectId, 'elicitacao');
  return onSnapshot(col, snap => {
    const rodadas: RodadaHistorico[] = snap.docs
      .map(d => {
        const data = d.data();
        return {
          numero: Number(d.id),
          perguntas: (data['perguntas'] as RodadaHistorico['perguntas']) || [],
          respostas: (data['respostas'] as RodadaHistorico['respostas']) || [],
          respondida: !!(data['respondida'] as boolean),
        };
      })
      .sort((a, b) => a.numero - b.numero);
    onUpdate(rodadas);
  });
}
