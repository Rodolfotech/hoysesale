import type { prisma as prismaClient } from '../db';

// Rutas del sitio que no pueden usarse como slug de negocio (hoysesale.cl/<slug>).
export const RESERVED_SLUGS = new Set([
  'eventos', 'categorias', 'comunas', 'login', 'register', 'registro', 'profile', 'perfil',
  'create-event', 'forgot-password', 'reset-password', 'privacidad', 'terminosdelservicio',
  'eliminacion-datos', 'panel-g9k2x', 'admin', 'api', 'auth', 'social', 'uploads', 'health', 'negocios',
]);

// Formato permitido para la URL del negocio: 3 a 60 caracteres, minúsculas, números y guiones.
export const BUSINESS_SLUG_PATTERN = /^[a-z0-9](?:[a-z0-9-]{1,58}[a-z0-9])$/;

// Normaliza un nombre a slug: sin acentos, minúsculas, solo [a-z0-9-], máximo 60 caracteres.
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

type Db = typeof prismaClient;

// Valida un slug elegido. Devuelve el motivo de rechazo o null si es válido.
// conflict = true cuando ya existe (409); false cuando el valor no está permitido (400).
export async function slugProblem(
  db: Db,
  slug: string,
  ownerId?: string,
): Promise<{ message: string; conflict: boolean } | null> {
  if (!BUSINESS_SLUG_PATTERN.test(slug)) {
    return { message: 'La URL solo puede tener letras minúsculas, números y guiones (3 a 60 caracteres)', conflict: false };
  }
  if (RESERVED_SLUGS.has(slug)) return { message: 'Esa URL está reservada', conflict: false };
  const categories = await db.category.findMany({ select: { name: true } });
  if (categories.some((c) => slugify(c.name) === slug)) {
    return { message: 'Esa URL coincide con una categoría', conflict: false };
  }
  const taken = await db.user.findUnique({ where: { slug }, select: { id: true } });
  if (taken && taken.id !== ownerId) return { message: 'Esa URL ya está en uso', conflict: true };
  return null;
}
