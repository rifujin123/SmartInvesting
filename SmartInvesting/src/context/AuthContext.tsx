import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { ApiError } from "../services/api/types";
import { authService } from "../services/auth/authService";
import { tokenStorage } from "../services/auth/tokenStorage";
import { LoginRequest, RegisterRequest } from "../services/auth/types";

type AuthStatus = "booting" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  isSubmitting: boolean;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const storedTokens = await tokenStorage.getTokens();

        if (!storedTokens.refreshToken) {
          setStatus("unauthenticated");
          return;
        }

        const refreshedSession = await authService.refresh(storedTokens.refreshToken);
        await tokenStorage.saveTokens(refreshedSession.token, refreshedSession.refreshToken);
        setAccessToken(refreshedSession.token);
        setRefreshToken(refreshedSession.refreshToken);
        setStatus("authenticated");
      } catch {
        await tokenStorage.clearTokens();
        setAccessToken(null);
        setRefreshToken(null);
        setStatus("unauthenticated");
      }
    };

    void hydrateSession();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await authService.login(payload);
      await tokenStorage.saveTokens(session.token, session.refreshToken);
      setAccessToken(session.token);
      setRefreshToken(session.refreshToken);
      setStatus("authenticated");
    } catch (err) {
      const message = err instanceof ApiError ? err.getDisplayMessage("Login failed") : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      await authService.register(payload);
      setStatus("unauthenticated");
    } catch (err) {
      const message = err instanceof ApiError ? err.getDisplayMessage("Registration failed") : "Registration failed";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      if (accessToken) {
        await authService.logout(accessToken, refreshToken ?? undefined);
      }
    } catch {
      // Ignore logout API failures; local logout should still succeed.
    } finally {
      await tokenStorage.clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setStatus("unauthenticated");
      setIsSubmitting(false);
    }
  }, [accessToken, refreshToken]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    accessToken,
    refreshToken,
    isSubmitting,
    error,
    login,
    register,
    logout,
    clearError,
  }), [status, accessToken, refreshToken, isSubmitting, error, login, register, logout, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
