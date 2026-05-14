import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ApiError } from "../services/api/types";
import { authService } from "../services/auth/authService";
import { biometricService } from "../services/auth/biometricService";
import { tokenStorage } from "../services/auth/tokenStorage";
import { ForgotPasswordRequest, LoginRequest, RegisterRequest } from "../services/auth/types";
import { profileService } from "../services/profile/profileService";
import { Profile } from "../services/profile/types";

const LAST_LOGIN_KEY = "@smartinvesting_last_login_completed";
const LAST_LOGIN_EMAIL_KEY = "@smartinvesting_last_login_email";

type AuthStatus = "booting" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  accessToken: string | null;
  refreshToken: string | null;
  user: Profile | null;
  isSubmitting: boolean;
  isBiometricSubmitting: boolean;
  isBiometricAvailable: boolean;
  biometricLabel: string;
  lastLoginEmail: string;
  error: string | null;
  login: (payload: LoginRequest) => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  forgotPassword: (payload: ForgotPasswordRequest) => Promise<string>;
  loadUser: () => Promise<Profile | null>;
  setUser: (user: Profile | null) => void;
  logout: () => Promise<void>;
  refreshBiometricAvailability: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<AuthStatus>("booting");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<Profile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBiometricSubmitting, setIsBiometricSubmitting] = useState(false);
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [biometricLabel, setBiometricLabel] = useState("Biometric Login");
  const [hasLoggedInBefore, setHasLoggedInBefore] = useState(false);
  const [lastLoginEmail, setLastLoginEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const refreshBiometricAvailability = useCallback(async () => {
    try {
      const [capabilities, biometricEnabled, biometricRefreshToken] = await Promise.all([
        biometricService.getBiometricCapabilities(),
        biometricService.getBiometricEnabled(),
        tokenStorage.getBiometricRefreshToken(),
      ]);

      setBiometricLabel(capabilities.label);
      setIsBiometricAvailable(capabilities.isAvailable && biometricEnabled && Boolean(biometricRefreshToken));
    } catch {
      setBiometricLabel("Biometric Login");
      setIsBiometricAvailable(false);
    }
  }, []);

  useEffect(() => {
    const hydrateSession = async () => {
      try {
        await refreshBiometricAvailability();
        const [storedTokens, hasPreviousLogin, savedEmail] = await Promise.all([
          tokenStorage.getTokens(),
          AsyncStorage.getItem(LAST_LOGIN_KEY),
          AsyncStorage.getItem(LAST_LOGIN_EMAIL_KEY),
        ]);
        setHasLoggedInBefore(hasPreviousLogin === "true" || Boolean(savedEmail));
        setLastLoginEmail(savedEmail ?? "");

        if (!storedTokens.refreshToken) {
          setStatus("unauthenticated");
          return;
        }

        const refreshedSession = await authService.refresh(storedTokens.refreshToken);
        await tokenStorage.saveTokens(refreshedSession.token, refreshedSession.refreshToken);
        const profile = await profileService.getMe(refreshedSession.token);
        setAccessToken(refreshedSession.token);
        setRefreshToken(refreshedSession.refreshToken);
        setUser(profile);
        setStatus("authenticated");
        await refreshBiometricAvailability();
      } catch {
        try {
          await tokenStorage.clearTokens();
        } catch {
          // Ignore local token cleanup failures during boot.
        }
        setAccessToken(null);
        setRefreshToken(null);
        setUser(null);
        setStatus("unauthenticated");
      }
    };

    void hydrateSession();
  }, [refreshBiometricAvailability]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const login = useCallback(async (payload: LoginRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const session = await authService.login(payload);
      await tokenStorage.saveTokens(session.token, session.refreshToken);
      const biometricEnabled = await biometricService.getBiometricEnabled();
      if (biometricEnabled) {
        await tokenStorage.saveBiometricRefreshToken(session.refreshToken);
      }
      await AsyncStorage.multiSet([
        [LAST_LOGIN_KEY, "true"],
        [LAST_LOGIN_EMAIL_KEY, payload.email.trim()],
      ]);
      setHasLoggedInBefore(true);
      setLastLoginEmail(payload.email.trim());
      setAccessToken(session.token);
      setRefreshToken(session.refreshToken);
      setStatus("authenticated");
      await refreshBiometricAvailability();
      try {
        const profile = await profileService.getMe(session.token);
        setUser(profile);
      } catch {
        setUser(null);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.getDisplayMessage("Login failed") : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, [refreshBiometricAvailability]);

  const loginWithBiometrics = useCallback(async () => {
    setIsBiometricSubmitting(true);
    setError(null);

    try {
      const [biometricRefreshToken, biometricEnabled, capabilities] = await Promise.all([
        tokenStorage.getBiometricRefreshToken(),
        biometricService.getBiometricEnabled(),
        biometricService.getBiometricCapabilities(),
      ]);

      if (!capabilities.isAvailable) {
        Alert.alert("Biometric Login Unavailable", "Set up Face ID or fingerprint on this device first.");
        return;
      }

      if (!biometricEnabled || !biometricRefreshToken) {
        Alert.alert(
          "Biometric Login Not Set Up",
          hasLoggedInBefore
            ? "Enable Biometric Login in Settings before using it."
            : "Sign in with email and password first, then enable Biometric Login in Settings.",
        );
        return;
      }

      const authenticated = await biometricService.authenticate(capabilities.label);

      if (!authenticated) {
        return;
      }

      const session = await authService.refresh(biometricRefreshToken);
      await Promise.all([
        tokenStorage.saveTokens(session.token, session.refreshToken),
        tokenStorage.saveBiometricRefreshToken(session.refreshToken),
      ]);
      setAccessToken(session.token);
      setRefreshToken(session.refreshToken);
      setStatus("authenticated");
      await refreshBiometricAvailability();
      try {
        const profile = await profileService.getMe(session.token);
        setUser(profile);
      } catch {
        setUser(null);
      }
    } catch (err) {
      const message = err instanceof ApiError ? err.getDisplayMessage("Biometric login failed") : err instanceof Error ? err.message : "Biometric login failed";
      setError(message);
      throw err;
    } finally {
      setIsBiometricSubmitting(false);
    }
  }, [hasLoggedInBefore, refreshBiometricAvailability]);

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

  const forgotPassword = useCallback(async (payload: ForgotPasswordRequest) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await authService.forgotPassword(payload);
      return response.message;
    } catch (err) {
      const message = err instanceof ApiError ? err.getDisplayMessage("Failed to send reset link") : "Failed to send reset link";
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
        await authService.logout(accessToken, {
          ...(refreshToken ? { refreshToken } : {}),
        });
      }
    } catch {
      // Ignore logout API failures; local logout should still succeed.
    } finally {
      await tokenStorage.clearTokens();
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
      setStatus("unauthenticated");
      await refreshBiometricAvailability();
      setIsSubmitting(false);
    }
  }, [accessToken, refreshToken, refreshBiometricAvailability]);

  const loadUser = useCallback(async () => {
    if (!accessToken) {
      setUser(null);
      return null;
    }

    const profile = await profileService.getMe(accessToken);
    setUser(profile);
    return profile;
  }, [accessToken]);

  const value = useMemo<AuthContextValue>(() => ({
    status,
    accessToken,
    refreshToken,
    user,
    isSubmitting,
    isBiometricSubmitting,
    isBiometricAvailable,
    biometricLabel,
    lastLoginEmail,
    error,
    login,
    loginWithBiometrics,
    register,
    forgotPassword,
    loadUser,
    setUser,
    logout,
    refreshBiometricAvailability,
    clearError,
  }), [status, accessToken, refreshToken, user, isSubmitting, isBiometricSubmitting, isBiometricAvailable, biometricLabel, lastLoginEmail, error, login, loginWithBiometrics, register, forgotPassword, loadUser, logout, refreshBiometricAvailability, clearError]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
