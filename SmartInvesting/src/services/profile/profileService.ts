import { API_BASE_URL } from "../api/config";
import { request } from "../api/client";
import { ApiError, ApiResponse } from "../api/types";
import { ChangeEmailRequest, ChangePasswordRequest, Profile, UpdateProfileRequest } from "./types";

export const profileService = {
  getMe(token: string) {
    return request<Profile>("/api/profile/me", {
      token,
    });
  },

  updateProfile(token: string, payload: UpdateProfileRequest) {
    return request<Profile>("/api/profile/me", {
      method: "PUT",
      token,
      body: payload,
    });
  },

  changeEmail(token: string, payload: ChangeEmailRequest) {
    return request<Profile>("/api/profile/email", {
      method: "PUT",
      token,
      body: payload,
    });
  },

  changePassword(token: string, payload: ChangePasswordRequest) {
    return request<null>("/api/profile/password", {
      method: "PUT",
      token,
      body: payload,
    });
  },

  async uploadAvatar(token: string, uri: string) {
    const formData = new FormData();
    formData.append("file", {
      uri,
      name: "avatar.jpg",
      type: "image/jpeg",
    } as unknown as Blob);

    const response = await fetch(`${API_BASE_URL}/api/profile/me/avatar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const text = await response.text();
    let payload: ApiResponse<Profile> | null = null;

    if (text) {
      try {
        payload = JSON.parse(text) as ApiResponse<Profile>;
      } catch {
        payload = null;
      }
    }

    if (!response.ok || !payload?.success || !payload.data) {
      const message =
        payload?.message ??
        payload?.errors?.[0] ??
        (text && !payload ? text : null) ??
        "Avatar upload failed";

      throw new ApiError(message, response.status, payload?.errors ?? undefined);
    }

    return payload.data;
  },
};
