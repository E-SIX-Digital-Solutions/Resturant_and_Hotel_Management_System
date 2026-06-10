import type { ApiResponse } from "../types";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000/api";

export class ApiError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hotel-admin-token");
};

export const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {};
  const token = getAuthToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
};

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);

  if (!(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result?.success) {
    const detail =
      Array.isArray(result.error) && result.error.length > 0
        ? result.error
            .map((e) => e.message)
            .filter(Boolean)
            .join(", ")
        : null;
    throw new ApiError(
      detail || result.message || "Request failed",
      response.status,
    );
  }

  return result.data;
}

export const buildQueryString = (
  params: Record<string, string | undefined>,
) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && value.trim() !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};
