// Configuração do Firebase — Projeto pyahu-scrum (real, não emulador)
//
// Desenvolvimento local: pode usar emulador setando REACT_APP_USE_EMULATOR=true
// Homolog/Prod: usa Firestore real no projeto pyahu-scrum

export const FIREBASE_CONFIG = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || 'AIzaSyAs0bH4VYB6CayvqrMfTEZjNv9AYt99Uro',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || 'pyahu-scrum.firebaseapp.com',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || 'pyahu-scrum',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || 'pyahu-scrum.firebasestorage.app',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '365029905997',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || '1:365029905997:web:ae14e549e67127fc82ae04',
};

// Emulador local (apenas dev)
export const USE_EMULATOR = process.env.REACT_APP_USE_EMULATOR === 'true';
export const FIRESTORE_EMULATOR_HOST = process.env.REACT_APP_FIRESTORE_EMULATOR_HOST || 'localhost';
const parsedPort = Number(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT);
export const FIRESTORE_EMULATOR_PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;

// Legado — mantido para não quebrar imports antigos
export const FIRESTORE_PROJECT_ID = FIREBASE_CONFIG.projectId;
export const FIRESTORE_EMULATOR_SSL = false;
