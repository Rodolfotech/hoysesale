const TTL_MS = 10 * 60 * 1000; // 10 minutos

interface Entry {
  data: unknown;
  ts: number;
}

function makeKey(params: object): string {
  return `hss_ev_${JSON.stringify(params)}`;
}

export function getCached<T>(params: object): T | null {
  try {
    const raw = localStorage.getItem(makeKey(params));
    if (!raw) return null;
    const entry: Entry = JSON.parse(raw);
    if (Date.now() - entry.ts > TTL_MS) {
      localStorage.removeItem(makeKey(params));
      return null;
    }
    return entry.data as T;
  } catch {
    return null;
  }
}

export function setCached(params: object, data: unknown): void {
  try {
    localStorage.setItem(makeKey(params), JSON.stringify({ data, ts: Date.now() }));
  } catch {}
}

export function clearCache(): void {
  try {
    const keys = Object.keys(localStorage).filter(k => k.startsWith('hss_ev_'));
    keys.forEach(k => localStorage.removeItem(k));
  } catch {}
}
