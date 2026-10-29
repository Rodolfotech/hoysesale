import { randomUUID } from 'crypto';
import { Prisma } from '@/generated/prisma/client';
import { prisma } from '../db';
import { badRequest, conflict, notFound } from '../http';
import { slugify, slugProblem } from '../businesses/slug';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, getMediaStorage } from '../storage';
import type { z } from 'zod';
import type { Business } from '@/lib/business';
import type { BusinessItemSchema, BusinessPageSchema, BusinessReviewSchema } from '../validation';

type BusinessPage = z.output<typeof BusinessPageSchema>;
type BusinessItem = z.output<typeof BusinessItemSchema>;
export type BusinessItemType = 'products' | 'services' | 'highlights';

// Campos públicos del negocio. Nunca se exponen correo, contraseña ni tokens.
const PUBLIC_BUSINESS_SELECT = {
  id: true,
  name: true,
  slug: true,
  category: true,
  logoUrl: true,
  coverUrl: true,
  businessDescription: true,
  hours: true,
  amenities: true,
  whatsappReservations: true,
  mapUrl: true,
  comuna: true,
  city: true,
  companyAddress: true,
  companyInstagram: true,
  website: true,
  companyPhone: true,
  createdAt: true,
} as const;

const PRODUCT_TAGS: readonly string[] = ['MAS_VENDIDO', 'DEL_DIA', 'REGALO', 'NUEVO'];

// Lista pública de negocios (slugs) para el sitemap. Tope igual al del sitemap de Google.
export function listBusinessSlugs() {
  return prisma.user.findMany({
    where: { slug: { not: null } },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: 'desc' },
    take: 5000,
  });
}

// Micro-sitio público: datos, eventos vigentes, productos, servicios, destacados y reseñas.
export async function getPublicBusiness(slug: string) {
  const business = await prisma.user.findUnique({ where: { slug }, select: PUBLIC_BUSINESS_SELECT });
  if (!business) return null;

  const now = new Date();
  const ownerId = business.id;
  const order = [{ sortOrder: 'asc' as const }, { createdAt: 'asc' as const }];
  const [events, products, services, highlights, reviews, aggregate] = await Promise.all([
    prisma.event.findMany({
      where: {
        ownerId,
        OR: [{ publicationEndDate: null }, { publicationEndDate: { gte: now } }],
        AND: [{ OR: [{ publicationStartDate: null }, { publicationStartDate: { lte: now } }] }],
      },
      orderBy: { date: 'asc' },
      select: { id: true, title: true, slug: true, date: true, imageUrl: true, address: true, city: true, description: true, entryType: true, indoor: true },
    }),
    prisma.businessProduct.findMany({ where: { ownerId }, orderBy: order }),
    prisma.businessService.findMany({ where: { ownerId }, orderBy: order }),
    prisma.businessHighlight.findMany({ where: { ownerId }, orderBy: order }),
    prisma.businessReview.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { id: true, rating: true, comment: true, createdAt: true, author: { select: { name: true, avatar: true } } },
    }),
    prisma.businessReview.aggregate({ where: { ownerId }, _avg: { rating: true }, _count: { _all: true } }),
  ]);

  // El id interno no se devuelve (el micro-sitio se identifica por su slug).
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _id, createdAt, ...publicBusiness } = business;
  const years = Math.floor((now.getTime() - createdAt.getTime()) / (365 * 24 * 60 * 60 * 1000));
  return {
    ...publicBusiness,
    stats: {
      rating: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : null,
      reviewCount: aggregate._count._all,
      years,
    },
    events,
    products,
    services,
    highlights,
    reviews,
  };
}

// Los campos Json no aceptan null: para borrarlos hay que usar Prisma.DbNull.
function userData(fields: Omit<BusinessPage, "slug">): Prisma.UserUpdateInput {
  const { hours, amenities, ...rest } = fields;
  return {
    ...rest,
    ...(hours !== undefined && { hours: hours === null ? Prisma.DbNull : hours }),
    ...(amenities !== undefined && { amenities: amenities === null ? Prisma.DbNull : amenities }),
  };
}

// Crea la página del negocio con la URL que elige el cliente (una sola vez por cuenta).
export async function createBusinessPage(userId: string, dto: BusinessPage) {
  const current = await prisma.user.findUnique({ where: { id: userId }, select: { slug: true, name: true } });
  if (!current) throw badRequest('Usuario no encontrado');
  if (current.slug) throw conflict('Ya tienes una página creada');

  const { slug: rawSlug, ...fields } = dto;
  const slug = (rawSlug ?? slugify(fields.name ?? current.name)).trim().toLowerCase();
  await assertSlugAvailable(slug, userId);

  return prisma.user.update({ where: { id: userId }, data: { ...userData(fields), slug }, select: PUBLIC_BUSINESS_SELECT });
}

// Edición del propio micro-sitio. El slug se puede cambiar, con las mismas validaciones.
export async function updateOwnBusiness(userId: string, dto: BusinessPage) {
  const { slug: rawSlug, ...fields } = dto;
  const data = userData(fields);
  if (rawSlug !== undefined) {
    const slug = rawSlug.trim().toLowerCase();
    await assertSlugAvailable(slug, userId);
    data.slug = slug;
  }
  return prisma.user.update({ where: { id: userId }, data, select: PUBLIC_BUSINESS_SELECT });
}

async function assertSlugAvailable(slug: string, ownerId: string) {
  const problem = await slugProblem(prisma, slug, ownerId);
  if (problem) throw problem.conflict ? conflict(problem.message) : badRequest(problem.message);
}

// Sube el logo o la portada del negocio y guarda su URL.
export async function uploadBusinessImage(userId: string, kind: 'logo' | 'cover', file: File) {
  const ext = ALLOWED_IMAGE_TYPES[file.type];
  if (!ext) throw badRequest('Formato no permitido (usa jpeg, png o webp)');
  if (file.size > MAX_IMAGE_BYTES) throw badRequest('La imagen supera el máximo de 4 MB');

  const buffer = Buffer.from(await file.arrayBuffer());
  const url = await getMediaStorage().upload(`${userId}/business/${kind}-${randomUUID()}.${ext}`, buffer, file.type);
  return prisma.user.update({
    where: { id: userId },
    data: kind === 'logo' ? { logoUrl: url } : { coverUrl: url },
    select: PUBLIC_BUSINESS_SELECT,
  });
}

// Productos, servicios y destacados del dueño.
export async function addBusinessItem(userId: string, type: BusinessItemType, dto: BusinessItem) {
  const data = itemData(type, dto, false);
  switch (type) {
    case 'products':
      return prisma.businessProduct.create({ data: { ...data, ownerId: userId } as never });
    case 'services':
      return prisma.businessService.create({ data: { ...data, ownerId: userId } as never });
    case 'highlights':
      return prisma.businessHighlight.create({ data: { ...data, ownerId: userId } as never });
  }
}

export async function updateBusinessItem(userId: string, type: BusinessItemType, id: string, dto: BusinessItem) {
  await assertOwnedItem(userId, type, id);
  const data = itemData(type, dto, true) as never;
  switch (type) {
    case 'products':
      return prisma.businessProduct.update({ where: { id }, data });
    case 'services':
      return prisma.businessService.update({ where: { id }, data });
    case 'highlights':
      return prisma.businessHighlight.update({ where: { id }, data });
  }
}

export async function deleteBusinessItem(userId: string, type: BusinessItemType, id: string) {
  await assertOwnedItem(userId, type, id);
  switch (type) {
    case 'products':
      await prisma.businessProduct.delete({ where: { id } });
      return;
    case 'services':
      await prisma.businessService.delete({ where: { id } });
      return;
    case 'highlights':
      await prisma.businessHighlight.delete({ where: { id } });
      return;
  }
}

// Reseña de un visitante autenticado. Una por usuario y negocio (se actualiza si ya existe).
export async function reviewBusiness(authorId: string, slug: string, dto: z.output<typeof BusinessReviewSchema>) {
  const owner = await prisma.user.findUnique({ where: { slug }, select: { id: true } });
  if (!owner) throw notFound('Negocio no encontrado');
  if (owner.id === authorId) throw badRequest('No puedes reseñar tu propio negocio');

  return prisma.businessReview.upsert({
    where: { ownerId_authorId: { ownerId: owner.id, authorId } },
    update: { rating: dto.rating, comment: dto.comment ?? null },
    create: { ownerId: owner.id, authorId, rating: dto.rating, comment: dto.comment ?? null },
    select: { id: true, rating: true, comment: true, createdAt: true },
  });
}

export function isBusinessItemType(value: string): value is BusinessItemType {
  return value === 'products' || value === 'services' || value === 'highlights';
}

async function assertOwnedItem(userId: string, type: BusinessItemType, id: string) {
  const owner = await findItemOwner(type, id);
  if (!owner) throw notFound('Elemento no encontrado');
  if (owner.ownerId !== userId) throw badRequest('No puedes modificar este elemento');
}

function findItemOwner(type: BusinessItemType, id: string) {
  const select = { ownerId: true } as const;
  switch (type) {
    case 'products':
      return prisma.businessProduct.findUnique({ where: { id }, select });
    case 'services':
      return prisma.businessService.findUnique({ where: { id }, select });
    case 'highlights':
      return prisma.businessHighlight.findUnique({ where: { id }, select });
  }
}

// Convierte el DTO en datos de la fila. En una actualización (partial) solo entran los campos enviados.
function itemData(type: BusinessItemType, dto: BusinessItem, partial: boolean): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (type === 'products') {
    if (!partial && !dto.name) throw badRequest('El producto necesita un nombre');
    if (dto.name !== undefined) out.name = dto.name.trim();
    if (dto.price !== undefined) out.price = dto.price;
    if (dto.imageUrl !== undefined) out.imageUrl = dto.imageUrl;
    if (dto.tag !== undefined) {
      if (dto.tag && !PRODUCT_TAGS.includes(dto.tag)) throw badRequest('Etiqueta no válida');
      out.tag = dto.tag || null;
    }
  } else {
    if (!partial && !dto.title) throw badRequest('Falta el título');
    if (dto.title !== undefined) out.title = dto.title.trim();
    if (type === 'highlights') {
      if (!partial && !dto.imageUrl) throw badRequest('El destacado necesita una imagen');
      if (dto.imageUrl !== undefined) out.imageUrl = dto.imageUrl;
    }
  }
  if (dto.description !== undefined) out.description = dto.description || null;
  if (dto.sortOrder !== undefined) out.sortOrder = dto.sortOrder;
  return out;
}

// Para las páginas del micro-sitio: las fechas viajan como texto, igual que en la respuesta JSON de la API.
export async function getBusinessPage(slug: string): Promise<Business | null> {
  const business = await getPublicBusiness(slug);
  return business ? (JSON.parse(JSON.stringify(business)) as Business) : null;
}
