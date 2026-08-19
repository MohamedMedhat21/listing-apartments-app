'use client';

import type { UserSummary } from '@apartments/shared';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { ApiError } from '@/lib/api/client';
import { createBrowserApiClient } from '@/lib/api/browser';
import {
  clearStoredAccessToken,
  getStoredAccessToken,
  setStoredAccessToken,
} from '@/lib/auth/storage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  user: UserSummary | null;
  status: AuthStatus;
  accessToken: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getStoredAccessToken() ? 'loading' : 'unauthenticated',
  );
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const logout = useCallback(() => {
    clearStoredAccessToken();
    setAccessToken(null);
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = getStoredAccessToken();

    if (!token) {
      return;
    }

    createBrowserApiClient()
      .getCurrentUser(token)
      .then((currentUser) => {
        if (cancelled) {
          return;
        }

        setAccessToken(token);
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        if (error instanceof ApiError && error.status === 401) {
          clearStoredAccessToken();
        }

        setAccessToken(null);
        setUser(null);
        setStatus('unauthenticated');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await createBrowserApiClient().login({ email, password });
    setStoredAccessToken(response.accessToken);
    setAccessToken(response.accessToken);
    setUser(response.user);
    setStatus('authenticated');
  }, []);

  const value = useMemo(
    () => ({
      user,
      status,
      accessToken,
      login,
      logout,
    }),
    [accessToken, login, logout, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider.');
  }

  return context;
}
