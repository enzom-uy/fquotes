// Use the local proxy instead of calling Railway directly
// The proxy at /api/[...path].ts will forward to the backend
// In browser: use relative URL (/api)
// In SSR: use absolute URL (window is undefined in SSR)
export const BACKEND_URL =
  typeof window !== "undefined"
    ? "/api"
    : (import.meta.env.PUBLIC_FRONTEND_URL || "http://localhost:3001") + "/api";

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export { ApiError };

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      // response body is not JSON
    }
    const message =
      (data as { message?: string })?.message ||
      `Request failed with status ${response.status}`;
    throw new ApiError(response.status, message, data);
  }
  return response.json() as Promise<T>;
}

export const api = {
  async get<T>(path: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      ...options,
      credentials: "include",
    });
    return await handleResponse<T>(res);
  },

  async post<T>(
    path: string,
    body: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
      body: JSON.stringify(body),
    });
    return await handleResponse<T>(res);
  },

  async patch<T>(
    path: string,
    body: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      ...options,
      body: JSON.stringify(body),
    });
    return await handleResponse<T>(res);
  },

  async delete<T>(
    path: string,
    body?: unknown,
    options?: RequestInit,
  ): Promise<T> {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "DELETE",
      ...(body !== undefined && {
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
      credentials: "include",
      ...options,
    });
    return await handleResponse<T>(res);
  },
};
