const BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:4000/api/v1";
const REFRESH_TOKEN_KEY = "homesync_refresh_token";

let accessToken: string | null = null;

export function setTokens(access: string, refresh: string): void {
  accessToken = access;
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
}

export function clearTokens(): void {
  accessToken = null;
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export interface RefreshResult<U = unknown> {
  user: U;
  access_token: string;
  refresh_token: string;
}

// Refresh tokens are single-use, so concurrent callers (app boot, several requests
// hitting an expired access token at once) must share one in-flight request.
let refreshInFlight: Promise<RefreshResult | null> | null = null;

export function refreshSession<U = unknown>(): Promise<RefreshResult<U> | null> {
  refreshInFlight ??= (async () => {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) return null;

    try {
      const res = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
      if (!res.ok) {
        clearTokens();
        return null;
      }
      const json = await res.json() as { data: RefreshResult };
      setTokens(json.data.access_token, json.data.refresh_token);
      return json.data;
    } catch {
      // Network failure — keep the refresh token so a later attempt can succeed
      return null;
    }
  })().finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight as Promise<RefreshResult<U> | null>;
}

async function tryRefresh(): Promise<boolean> {
  return (await refreshSession()) !== null;
}

async function apiRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  retry = true
): Promise<T> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const json = await res.json() as { data?: T; error?: { code: string; message: string } };

  if (res.status === 401 && retry && accessToken) {
    // Don't refresh+retry for business-logic 401s (e.g. wrong current password).
    // Only treat UNAUTHORIZED as a session-expiry that warrants a token refresh.
    const code = json.error?.code;
    if (code !== "INVALID_CREDENTIALS") {
      const refreshed = await tryRefresh();
      if (refreshed) return apiRequest<T>(method, path, body, false);
      clearTokens();
      window.location.href = "/login";
      throw new Error("Session expired. Please log in again.");
    }
  }

  if (!res.ok) {
    throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  }

  return json.data as T;
}

export const api = {
  get:    <T>(path: string)                  => apiRequest<T>("GET",    path),
  post:   <T>(path: string, body?: unknown)  => apiRequest<T>("POST",   path, body),
  patch:  <T>(path: string, body?: unknown)  => apiRequest<T>("PATCH",  path, body),
  delete: <T>(path: string)                  => apiRequest<T>("DELETE", path),
};
