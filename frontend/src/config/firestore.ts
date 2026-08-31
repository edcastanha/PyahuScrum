// Configuração do Firebase — lida de variáveis de ambiente injetadas no build.
//
// Desenvolvimento local: copie frontend/.env.example para frontend/.env.local e preencha.
// Homolog/Prod: injetadas como ARG no Dockerfile via docker-compose.
//
// Nunca commitar valores reais aqui — todas as chaves vêm de env vars.

export const FIREBASE_CONFIG = {
  apiKey:            process.env.REACT_APP_FIREBASE_API_KEY            || '',
  authDomain:        process.env.REACT_APP_FIREBASE_AUTH_DOMAIN        || '',
  projectId:         process.env.REACT_APP_FIREBASE_PROJECT_ID         || '',
  storageBucket:     process.env.REACT_APP_FIREBASE_STORAGE_BUCKET     || '',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '',
  appId:             process.env.REACT_APP_FIREBASE_APP_ID             || '',
};

// Emulador local (apenas dev)
export const USE_EMULATOR = process.env.REACT_APP_USE_EMULATOR === 'true';
export const FIRESTORE_EMULATOR_HOST = process.env.REACT_APP_FIRESTORE_EMULATOR_HOST || 'localhost';
const parsedPort = Number(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT);
export const FIRESTORE_EMULATOR_PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;

// Legado — mantido para não quebrar imports antigos
export const FIRESTORE_PROJECT_ID = FIREBASE_CONFIG.projectId;
export const FIRESTORE_EMULATOR_SSL = false;
