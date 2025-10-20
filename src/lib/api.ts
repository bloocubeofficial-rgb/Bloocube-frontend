// lib/api.ts
import { loadingManager } from '@/lib/loading';
import { getApiBase } from '@/lib/config';

export const apiFetch = async (path: string, options: RequestInit = {}) => {
  loadingManager.start();
  try {
    const base = getApiBase();
    return await fetch(`${base}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...options,
    credentials: 'include'
    });
  } finally {
    loadingManager.done();
  }
}

export const apiJson = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  const res = await apiFetch(path, options);
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.message || 'Request failed');
  return res.json();
};

// AI Service direct client (bypasses backend, uses env-configured URL + API key header)
const getAiBase = (): string => {
  const base = (process as any).env.NEXT_PUBLIC_AI_SERVICE_URL || (globalThis as any)?.NEXT_PUBLIC_AI_SERVICE_URL;
  if (!base) throw new Error('NEXT_PUBLIC_AI_SERVICE_URL is not set');
  return (base as string).replace(/\/$/, '');
};

export const aiServiceJson = async <T = unknown>(path: string, options: RequestInit = {}): Promise<T> => {
  loadingManager.start();
  try {
    const base = getAiBase();
    const apiKey = (process as any).env.NEXT_PUBLIC_AI_SERVICE_API_KEY || (globalThis as any)?.NEXT_PUBLIC_AI_SERVICE_API_KEY;
    const res = await fetch(`${base}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { 'x-api-key': apiKey as string } : {})
      },
      credentials: 'include',
      ...options,
    });
    if (!res.ok) {
      let msg = 'AI request failed';
      try { msg = (await res.json()).message || msg; } catch {}
      throw new Error(msg);
    }
    return res.json();
  } finally {
    loadingManager.done();
  }
};