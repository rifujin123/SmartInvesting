import { request } from "../api/client";
import {
  ForgotPasswordRequest,
  LoginRequest,
  LogoutRequest,
  MessageResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  TokenResponse,
} from "./types";

export const authService = {
  login(payload: LoginRequest) {
    return request<TokenResponse>("/api/auth/login", {
      method: "POST",
      body: payload,
    });
  },

  register(payload: RegisterRequest) {
    return request<RegisterResponse>("/api/auth/register", {
      method: "POST",
      body: payload,
    });
  },

  forgotPassword(payload: ForgotPasswordRequest) {
    return request<MessageResponse>("/api/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  },

  resetPassword(payload: ResetPasswordRequest) {
    return request<MessageResponse>("/api/auth/reset-password", {
      method: "POST",
      body: payload,
    });
  },

  refresh(refreshToken: string) {
    return request<TokenResponse>("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  logout(token: string, payload?: LogoutRequest) {
    return request<null>("/api/auth/logout", {
      method: "POST",
      token,
      body: payload,
    });
  },
};
