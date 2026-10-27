'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { login as loginApi } from '@/api/auth';
import { setToken, clearToken, getToken, setUser, getUser } from '@/lib/auth';
import type { LoginCredentials, AuthUser } from '@/types';

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<AuthUser | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getToken();
    const storedUser = getUser<AuthUser>();
    if (storedToken && storedUser) {
      setTokenState(storedToken);
      setUserState(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const responseUser = await loginApi(credentials);
    // DummyJSON now returns accessToken; older responses used token.
    const accessToken = responseUser.accessToken || responseUser.token;
    if (!accessToken) {
      throw new Error('Login response did not contain an access token. Please try again.');
    }
    const userData: AuthUser = { ...responseUser, token: accessToken };
    setToken(accessToken);
    setUser(userData);
    setTokenState(accessToken);
    setUserState(userData);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setTokenState(null);
    setUserState(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
