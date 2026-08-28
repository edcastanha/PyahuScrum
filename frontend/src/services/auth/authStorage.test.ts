import { authStorage } from './authStorage';

describe('authStorage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('saves and restores a session', () => {
    authStorage.saveSession({
      isAuthenticated: true,
      githubLogin: 'edson',
      savedAt: '2026-04-08T00:00:00.000Z'
    });

    expect(authStorage.getSession()).toEqual({
      isAuthenticated: true,
      githubLogin: 'edson',
      savedAt: '2026-04-08T00:00:00.000Z'
    });
  });

  it('clears a session', () => {
    authStorage.saveSession({
      isAuthenticated: true,
      githubLogin: 'edson',
      savedAt: '2026-04-08T00:00:00.000Z'
    });

    authStorage.clearSession();
    expect(authStorage.getSession()).toBeNull();
  });
});
