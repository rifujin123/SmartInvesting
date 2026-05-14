export interface Profile {
  id: string;
  email: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  avatarUrl: string | null;
  riskProfile: number;
}

export interface UpdateProfileRequest {
  firstName?: string | null;
  lastName?: string | null;
  userName: string;
  avatarUrl?: string | null;
}

export interface ChangeEmailRequest {
  newEmail: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}


