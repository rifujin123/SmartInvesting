export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
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
