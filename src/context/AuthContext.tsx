import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { tokenStore, UNAUTHORIZED_EVENT } from '../api/client';
import { authApi } from '../api/endpoints';
import { AppRole, SMMUser } from '../types';

interface AuthContextType {
  token: string | null;
  user: SMMUser | null;
  role: AppRole;
  loading: boolean;
  login: (email: string, password: string) => Promise<SMMUser>;
  logout: () => void;
  refresh: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<SMMUser | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => tokenStore.get());
  const [user, setUser] = useState<SMMUser | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    tokenStore.clear();
    setToken(null);
    setUser(null);
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      setUser(await authApi.me());
    } catch {
      // Expired or revoked — client.ts already fired the unauthorized event.
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Restore the session on mount.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // One place handles every 401, wherever it came from.
  useEffect(() => {
    const onUnauthorized = () => logout();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await authApi.login(email, password);
    tokenStore.set(newToken);
    setToken(newToken);
    setUser(newUser);
    setLoading(false);
    return newUser;
  }, []);

  const doLogout = useCallback(() => {
    // Fire-and-forget: the audit entry is nice to have, the local logout is not
    // allowed to depend on it.
    void authApi.logout().catch(() => {});
    logout();
  }, [logout]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        role: (user?.role as AppRole) ?? 'smm',
        loading,
        login,
        logout: doLogout,
        refresh,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
