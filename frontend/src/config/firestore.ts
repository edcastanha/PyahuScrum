export const FIRESTORE_PROJECT_ID =
  process.env.REACT_APP_FIRESTORE_PROJECT_ID || 'pyahu-scrum-local';

export const FIRESTORE_EMULATOR_HOST = process.env.REACT_APP_FIRESTORE_EMULATOR_HOST || 'localhost';

const parsedPort = Number(process.env.REACT_APP_FIRESTORE_EMULATOR_PORT);
export const FIRESTORE_EMULATOR_PORT = Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080;
