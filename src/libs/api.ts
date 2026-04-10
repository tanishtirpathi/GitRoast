
export const API_URL = "http://localhost:8000";

type ApiErrorPayload = {
  status: number;
  endpoint: string;
  method: string;
  data: unknown;
};

export class ApiError extends Error {
  status: number;
  endpoint: string;
  method: string;
  data: unknown;

  constructor(message: string, payload: ApiErrorPayload) {
    super(message);
    this.name = "ApiError";
    this.status = payload.status;
    this.endpoint = payload.endpoint;
    this.method = payload.method;
    this.data = payload.data;
  }
}

export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const method = (options.method ?? "GET").toUpperCase();

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get("content-type") ?? "";
    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    const logPayload = {
      endpoint,
      method,
      status: response.status,
      ok: response.ok,
      data,
    };

    if (!response.ok) {
      console.error("[apiFetch] Error", logPayload);
      const message =
        typeof data === "object" && data !== null && "message" in data
          ? String((data as { message: unknown }).message)
          : `Request failed (${response.status})`;

      throw new ApiError(message, {
        status: response.status,
        endpoint,
        method,
        data,
      });
    }

    console.log("[apiFetch] Success", logPayload);
  
    return data as T;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    console.error("[apiFetch] Network/Unexpected Error", {
      endpoint,
      method,
      error,
    });
    throw error;
  }
}