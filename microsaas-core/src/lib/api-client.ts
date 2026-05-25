const API_BASE = process.env.NEXT_PUBLIC_AGENT_API_URL || "http://localhost:3001";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
  userId?: string,
  userEmail?: string
): Promise<T> {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE}${endpoint}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (userId) headers["x-user-id"] = userId;
  if (userEmail) headers["x-user-email"] = userEmail;

  try {
    const res = await fetch(url, { ...options, headers });

    if (res.status === 402) {
      throw new ApiError("Créditos insuficientes", 402);
    }

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new ApiError(
        errorData.error || errorData.message || `HTTP ${res.status}`,
        res.status,
        errorData
      );
    }

    return await res.json();
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      err instanceof Error ? err.message : "Erro de conexão",
      0
    );
  }
}

export const api = {
  get: <T>(endpoint: string, userId?: string, userEmail?: string) =>
    request<T>(endpoint, { method: "GET" }, userId, userEmail),

  post: <T>(endpoint: string, body: unknown, userId?: string, userEmail?: string) =>
    request<T>(endpoint, { method: "POST", body: JSON.stringify(body) }, userId, userEmail),

  patch: <T>(endpoint: string, body: unknown, userId?: string, userEmail?: string) =>
    request<T>(endpoint, { method: "PATCH", body: JSON.stringify(body) }, userId, userEmail),

  delete: <T>(endpoint: string, userId?: string, userEmail?: string) =>
    request<T>(endpoint, { method: "DELETE" }, userId, userEmail),
};
