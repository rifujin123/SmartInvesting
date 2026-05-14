export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  allSessions?: boolean;
}

export interface MessageResponse {
  message: string;
}

export interface TokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface RegisterResponse {
  userId: string;
  email: string;
}
