import { createHash } from 'crypto';
import { prisma } from './db';
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

const TOO_MANY = 'Demasiados intentos. Espera unos minutos e intenta de nuevo.';

// Límite compartido por todas las instancias, en Postgres. Para acciones sensibles: login, registro y contraseña.
// Si la base falla, deja pasar: un problema interno no debe bloquear a usuarios reales. Queda el límite en memoria.
export async function sharedRateLimit(key: string, limit: number, windowMs: number): Promise<void> {
  // En desarrollo todas las peticiones salen de la misma IP.
  if (process.env.NODE_ENV === 'development') return;
  rateLimit(key, limit, windowMs);

  let count: number;
  try {
    const hashed = createHash('sha256').update(key).digest('hex');
    const rows = await prisma.$queryRaw<{ count: number }[]>`
      INSERT INTO "rate_limits" ("key", "count", "resetAt")
      VALUES (${hashed}, 1, NOW() + ${windowMs}::double precision * INTERVAL '1 millisecond')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "rate_limits"."resetAt" <= NOW() THEN 1 ELSE "rate_limits"."count" + 1 END,
        "resetAt" = CASE WHEN "rate_limits"."resetAt" <= NOW() THEN EXCLUDED."resetAt" ELSE "rate_limits"."resetAt" END
      RETURNING "count"`;
    count = Number(rows[0]?.count ?? 0);
    // Limpieza ocasional de contadores vencidos.
    if (Math.random() < 0.01) await prisma.rateLimit.deleteMany({ where: { resetAt: { lt: new Date() } } });
  } catch (error) {
    console.error('Límite compartido no disponible:', error instanceof Error ? error.message : error);
    return;
  }
  if (count > limit) throw new HttpError(429, TOO_MANY);
}
