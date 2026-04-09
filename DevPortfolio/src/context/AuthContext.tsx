import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { authStorage, AuthSession, GitHubProfile } from '../services/auth/authStorage';
import { fetchGithubUserProfile } from '../services/auth/githubAuthService';
import { mapAuthError } from '../services/auth/authError';

interface AuthContextValue {
  isAuthenticated: boolean;
  isHydrated: boolean;
  githubLogin: string | null;
  profile: GitHubProfile | null;
  errorMessage: string | null;
  isLoggingIn: boolean;
  loginWithGithub: (username: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }

  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [githubLogin, setGithubLogin] = useState<string | null>(null);
  const [profile, setProfile] = useState<GitHubProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    const savedSession = authStorage.getSession();

    if (savedSession?.isAuthenticated && savedSession.profile) {
      setIsAuthenticated(true);
      setGithubLogin(savedSession.githubLogin);
      setProfile(savedSession.profile);
    }

    setIsHydrated(true);
  }, []);

  const persistSession = useCallback((session: AuthSession) => {
    authStorage.saveSession(session);
    setIsAuthenticated(session.isAuthenticated);
    setGithubLogin(session.githubLogin);
    setProfile(session.profile ?? null);
  }, []);

  const loginWithGithub = async (username: string) => {
    setIsLoggingIn(true);
    setErrorMessage(null);

    try {
      const githubProfile = await fetchGithubUserProfile(username);
      persistSession({
        isAuthenticated: true,
        githubLogin: githubProfile.login,
        savedAt: new Date().toISOString(),
        profile: githubProfile
      });
    } catch (error) {
      const authError = mapAuthError(error);
      setErrorMessage(authError.message);
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const refreshProfile = useCallback(async () => {
    if (!isAuthenticated || !githubLogin) {
      return;
    }

    try {
      const githubProfile = await fetchGithubUserProfile(githubLogin);

      persistSession({
        isAuthenticated: true,
        githubLogin: githubProfile.login,
        savedAt: new Date().toISOString(),
        profile: githubProfile
      });
    } catch (error) {
      const authError = mapAuthError(error);
      setErrorMessage(authError.message);
    }
  }, [githubLogin, isAuthenticated, persistSession]);

  const logout = () => {
    authStorage.clearSession();
    setIsAuthenticated(false);
    setGithubLogin(null);
    setProfile(null);
    setErrorMessage(null);
  };

  const clearError = () => setErrorMessage(null);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isHydrated,
        githubLogin,
        profile,
        errorMessage,
        isLoggingIn,
        loginWithGithub,
        refreshProfile,
        logout,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
