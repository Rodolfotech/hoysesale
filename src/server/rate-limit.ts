import { HttpError } from './http';

type Bucket = { count: number; resetAt: number };

// Contadores en memoria de cada instancia. En serverless no son globales (igual que el limitador anterior).
const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

// Detrás de un proxy (Vercel) la IP real es la última de X-Forwarded-For (equivale a TRUST_PROXY=1).
export function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',').pop()!.trim();
  return req.headers.get('x-real-ip') ?? 'unknown';
}

export function rateLimit(key: string, limit: number, windowMs: number): void {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  bucket.count += 1;
  if (bucket.count > limit) throw new HttpError(429, 'Demasiadas peticiones, intenta más tarde');
}
