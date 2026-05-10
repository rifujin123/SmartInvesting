import { request } from "../api/client";
import { LoginRequest, RegisterRequest, RegisterResponse, TokenResponse } from "./types";

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

  refresh(refreshToken: string) {
    return request<TokenResponse>("/api/auth/refresh", {
      method: "POST",
      body: { refreshToken },
    });
  },

  logout(token: string, refreshToken?: string) {
    return request<null>("/api/auth/logout", {
      method: "POST",
      token,
      body: refreshToken ? { refreshToken } : undefined,
    });
  },
};
