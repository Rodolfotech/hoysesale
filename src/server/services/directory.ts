import { prisma } from '../db';
import { BUSINESS_CATEGORIES } from '@/constants/business';

// Listado público de comercios (/comercios): solo cuentas con micro-sitio, activas y con una categoría válida.
// Solo se devuelven los campos que ya se muestran en el micro-sitio.
export function listPublicBusinesses() {
  return prisma.user.findMany({
    where: {
      isActive: true,
      slug: { not: null },
      category: { in: [...BUSINESS_CATEGORIES] },
    },
    select: {
      name: true,
      slug: true,
      category: true,
      logoUrl: true,
      logoShape: true,
      comuna: true,
    },
    orderBy: { name: 'asc' },
    take: 500,
  });
}
