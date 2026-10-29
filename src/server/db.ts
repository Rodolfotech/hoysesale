import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '@/generated/prisma/client';

// En Vercel cada instancia es una función aislada: pocas conexiones por instancia para no agotar el pooler de Supabase.
function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
    max: process.env.VERCEL ? 1 : 10,
    idleTimeoutMillis: process.env.VERCEL ? 5000 : 10000,
  });
  // aboutImages se omite en todas las consultas por defecto: la columna no existe aún en producción (ver SPEC.md).
  // Se vuelve a incluir cuando se apliquen las migraciones y se quite esta regla.
  return new PrismaClient({ adapter: new PrismaPg(pool), omit: { user: { aboutImages: true } } });
}

// Un solo cliente por proceso: el hot reload de `next dev` no debe abrir pools nuevos en cada recarga.
const globalForPrisma = globalThis as unknown as { prisma?: ReturnType<typeof createPrismaClient> };

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
