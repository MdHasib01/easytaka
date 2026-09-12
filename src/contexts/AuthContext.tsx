import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADMIN_TOKEN_KEY, ApiError, TOKEN_KEY, api, tokenStore } from '../lib/api';
import type { AuthSession } from '../types';

type SessionResponse = AuthSession & { token: string };

interface AuthValue {
  session: AuthSession | null;
  loading: boolean;
  /** True while a platform admin is logged in as a brand and can switch back. */
  canReturnToAdmin: boolean;
  login(email: string, password: string): Promise<AuthSession>;
  register(form: FormData | Record<string, any>): Promise<AuthSession>;
  logout(): void;
  loginAsBrand(brandId: string): Promise<AuthSession>;
  returnToAdmin(): Promise<AuthSession | null>;
  refresh(): Promise<AuthSession | null>;
}

const AuthContext = createContext<AuthValue | null>(null);

const stripToken = ({ token: _token, ...session }: SessionResponse): AuthSession => session;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const clear = useCallback(() => {
    tokenStore.set(TOKEN_KEY, null);
    tokenStore.set(ADMIN_TOKEN_KEY, null);
    setSession(null);
  }, []);

  const refresh = useCallback(async (): Promise<AuthSession | null> => {
    if (!tokenStore.get(TOKEN_KEY)) {
      setSession(null);
      return null;
    }
    try {
      const me = await api<AuthSession>('/auth/me');
      setSession(me);
      return me;
    } catch (err) {
      if (!(err instanceof ApiError) || (err.status !== 401 && err.status !== 403)) {
        setSession(null);
        return null;
      }
      // An expired brand session drops back to the admin's own session.
      const adminToken = tokenStore.get(ADMIN_TOKEN_KEY);
      if (adminToken && adminToken !== tokenStore.get(TOKEN_KEY)) {
        tokenStore.set(TOKEN_KEY, adminToken);
        tokenStore.set(ADMIN_TOKEN_KEY, null);
        return refresh();
      }
      clear();
      return null;
    }
  }, [clear]);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const start = useCallback((res: SessionResponse) => {
    tokenStore.set(TOKEN_KEY, res.token);
    const next = stripToken(res);
    setSession(next);
    return next;
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      session,
      loading,
      canReturnToAdmin: Boolean(session?.impersonating && tokenStore.get(ADMIN_TOKEN_KEY)),

      async login(email, password) {
        const res = await api<SessionResponse>('/auth/login', { method: 'POST', body: { email, password } });
        tokenStore.set(ADMIN_TOKEN_KEY, null);
        return start(res);
      },

      async register(form) {
        const res = await api<SessionResponse>('/auth/register', { method: 'POST', body: form });
        tokenStore.set(ADMIN_TOKEN_KEY, null);
        return start(res);
      },

      logout: clear,

      async loginAsBrand(brandId) {
        const adminToken = tokenStore.get(TOKEN_KEY);
        const res = await api<SessionResponse>('/auth/impersonate', { method: 'POST', body: { brandId } });
        tokenStore.set(ADMIN_TOKEN_KEY, adminToken);
        return start(res);
      },

      async returnToAdmin() {
        const adminToken = tokenStore.get(ADMIN_TOKEN_KEY);
        if (!adminToken) {
          clear();
          return null;
        }
        tokenStore.set(TOKEN_KEY, adminToken);
        tokenStore.set(ADMIN_TOKEN_KEY, null);
        return refresh();
      },

      refresh,
    }),
    [session, loading, start, clear, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
