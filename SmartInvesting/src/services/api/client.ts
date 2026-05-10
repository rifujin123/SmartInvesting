import { API_BASE_URL } from "./config";
import { ApiError, ApiResponse } from "./types";

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
  token?: string;
}

export async function request<T>(
  path: string,
  { method = "GET", body, token }: RequestOptions = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload: ApiResponse<T> | null = null;

  if (text) {
    try {
      payload = JSON.parse(text) as ApiResponse<T>;
    } catch {
      payload = null;
    }
  }

  if (!response.ok || !payload?.success) {
    const message =
      payload?.message ??
      payload?.errors?.[0] ??
      (response.status === 429 ? "Too many requests. Please try again shortly." : null) ??
      (text && !payload ? text : null) ??
      "Request failed";

    throw new ApiError(message, response.status, payload?.errors ?? undefined);
  }

  return payload.data as T;
}
