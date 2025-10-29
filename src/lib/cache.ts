// Simple namespaced localStorage cache with TTL

type CacheEntry<T> = {
  value: T;
  ts: number; // stored at
  ttl: number; // milliseconds
};

export const persistentCache = {
  // Set a value with TTL
  set<T>(key: string, value: T, ttlMs: number): void {
    if (typeof window === 'undefined') return;
    try {
      const entry: CacheEntry<T> = { value, ts: Date.now(), ttl: ttlMs };
      localStorage.setItem(key, JSON.stringify(entry));
    } catch {}
  },

  // Get a value if fresh; otherwise null
  getFresh<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (!entry || typeof entry.ts !== 'number' || typeof entry.ttl !== 'number') return null;
      if (Date.now() - entry.ts > entry.ttl) return null;
      return entry.value as T;
    } catch {
      return null;
    }
  },

  // Remove an entry
  remove(key: string): void {
    if (typeof window === 'undefined') return;
    try { localStorage.removeItem(key); } catch {}
  },

  // Clear entries matching prefix
  clearPrefix(prefix: string): void {
    if (typeof window === 'undefined') return;
    try {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(prefix))
        .forEach((k) => localStorage.removeItem(k));
    } catch {}
  }
};


