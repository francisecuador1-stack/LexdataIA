const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function api<T = unknown>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include', // for refresh cookie
  });

  if (!res.ok) {
    // 401 auto-refresh: try refresh once, then retry the original request
    if (res.status === 401 && !path.includes('/auth/refresh') && !path.includes('/auth/login')) {
      const refreshed = await tryRefresh();
      if (refreshed) {
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${accessToken}`;
        const retryRes = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: 'include' });
        if (retryRes.ok) {
          if (retryRes.status === 204) return undefined as T;
          return retryRes.json() as Promise<T>;
        }
      }
      // Refresh failed — trigger logout
      if (_onAuthFailure) _onAuthFailure();
    }

    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Error', body.requestId);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Callback for auth failure (set by RequireAuth to trigger logout + redirect)
let _onAuthFailure: (() => void) | null = null;
export function onAuthFailure(cb: () => void) { _onAuthFailure = cb; }

let _refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts
  if (_refreshing) return _refreshing;
  _refreshing = (async () => {
    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const data = await res.json() as { accessToken?: string };
      if (data.accessToken) {
        accessToken = data.accessToken;
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      _refreshing = null;
    }
  })();
  return _refreshing;
}

// Convenience methods
export const get = <T>(path: string) => api<T>(path);
export const post = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
export const patch = <T>(path: string, body?: unknown) =>
  api<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined });
export const del = <T>(path: string) => api<T>(path, { method: 'DELETE' });

/**
 * Upload a file via multipart/form-data.
 * §8.3: preserves Authorization, does NOT set Content-Type (browser sets boundary).
 */
export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  onProgress?: (pct: number) => void,
): Promise<T> {
  const headers: Record<string, string> = {};
  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  // Use XMLHttpRequest for progress tracking if callback provided
  if (onProgress) {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `${API_BASE}${path}`);
      Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
      xhr.withCredentials = true;
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          const body = JSON.parse(xhr.responseText || '{}');
          reject(new ApiError(xhr.status, body.message ?? 'Upload error'));
        }
      };
      xhr.onerror = () => reject(new ApiError(0, 'Network error'));
      xhr.send(formData);
    });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    body: formData,
    credentials: 'include',
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }));
    throw new ApiError(res.status, body.message ?? 'Error');
  }

  return res.json() as Promise<T>;
}
