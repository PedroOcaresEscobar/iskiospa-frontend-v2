const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const normalizePath = (path: string) =>
  path.startsWith("/") ? path : `/${path}`;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const { getAccessToken } = await import("@/services/authStorage");
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${normalizePath(path)}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
    credentials: options?.credentials ?? "include",
    ...options,
  });

  if (!response.ok) {
    if (response.status === 401) {
      const { clearAuthStorage } = await import("@/services/authStorage");
      clearAuthStorage();
    }
    const message = await response.text();
    const error = new Error(message || "Error en la solicitud");
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<T>;
}
