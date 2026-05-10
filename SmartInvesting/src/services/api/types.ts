export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string | null;
  errors: string[] | null;
  timestamp: string;
}

export class ApiError extends Error {
  status?: number;
  errors?: string[];

  constructor(message: string, status?: number, errors?: string[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }

  getDisplayMessage(fallback = "Request failed") {
    if (this.errors?.length) {
      return this.errors.join("\n");
    }

    return this.message || fallback;
  }
}
