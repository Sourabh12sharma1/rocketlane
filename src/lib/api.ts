export const TOKEN_KEY = "rocketlane_token";

export function apiPath(path: string): string {
  if (path.startsWith("/api")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `/api${suffix}`;
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers);
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(apiPath(path), { ...options, headers });
}
