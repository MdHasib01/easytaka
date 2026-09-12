/// <reference types="vite/client" />

function resolveApiBaseUrl(): string {
  const envUrl = (
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_SERVER_URL
  )?.trim();

  if (!envUrl) return '/api';

  // Strip trailing slashes
  const clean = envUrl.replace(/\/+$/, '');

  // If full URL (http://... or https://...), ensure it ends with /api since backend routes are mounted at /api
  if (/^https?:\/\//i.test(clean)) {
    return clean.endsWith('/api') ? clean : `${clean}/api`;
  }

  // If relative path, ensure it ends with /api (defaults to /api)
  if (clean === '' || clean === '/') return '/api';
  return clean.endsWith('/api') ? clean : `${clean}/api`;
}

export const BASE_URL = resolveApiBaseUrl();
export const API_URL = BASE_URL;

export const TOKEN_KEY = 'et_token';
/** The platform admin's own token, kept while they are logged in as a brand. */
export const ADMIN_TOKEN_KEY = 'et_admin_token';

export const tokenStore = {
  get(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string | null) {
    try {
      if (value) localStorage.setItem(key, value);
      else localStorage.removeItem(key);
    } catch {
      // Storage unavailable (private mode); the session just won't survive a reload.
    }
  },
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public code?: string,
    public details?: { path: string; message: string }[],
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
}

export async function api<T>(path: string, { method = 'GET', body }: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  const token = tokenStore.get(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  let payload: BodyInit | undefined;
  if (body instanceof FormData) {
    payload = body;
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }

  // Normalize path: avoid duplicate /api if path already has it, and ensure leading slash
  const normalizedPath = path.startsWith('/api/') ? path.slice(4) : path === '/api' ? '' : path;
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : normalizedPath ? `/${normalizedPath}` : '';

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${cleanPath}`, { method, headers, body: payload });
  } catch {
    throw new ApiError(0, 'Cannot reach the server. Check that the API is running.');
  }

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.message ?? `Request failed (${res.status})`, data?.code, data?.details);
  }
  return data as T;
}

/** WebSocket URL for a path under the API base, e.g. wsUrl('/ws'). */
export function wsUrl(path: string): string {
  const normalizedPath = path.startsWith('/api/') ? path.slice(4) : path === '/api' ? '' : path;
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : normalizedPath ? `/${normalizedPath}` : '';
  const base = BASE_URL.startsWith('http') ? BASE_URL : `${window.location.origin}${BASE_URL}`;
  return base.replace(/^http/, 'ws') + cleanPath;
}

/** First field-level validation message, falling back to the error message. */
export function errorMessage(err: unknown): string {
  if (err instanceof ApiError) return err.details?.[0]?.message ?? err.message;
  return err instanceof Error ? err.message : 'Something went wrong';
}
