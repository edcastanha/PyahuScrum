const AUTH_SESSION_KEY = 'devportfolio.auth.session';

export interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  location: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
}

export interface AuthSession {
  isAuthenticated: boolean;
  githubLogin: string;
  savedAt: string;
  profile?: GitHubProfile;
}

export const authStorage = {
  getSession(): AuthSession | null {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_KEY);

    if (!rawSession) {
      return null;
    }

    try {
      return JSON.parse(rawSession) as AuthSession;
    } catch {
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      return null;
    }
  },
  saveSession(session: AuthSession): void {
    window.localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
  },
  clearSession(): void {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }
};
