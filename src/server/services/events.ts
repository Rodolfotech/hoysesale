import { prisma } from '../db';
import { Prisma } from '@/generated/prisma/client';
import { forbidden, notFound, conflict } from '../http';
import { PUBLIC_USER_SELECT } from '../users/public-user';
import { eventSlug } from '../events/slug';
import { matchesTimeSlot, type InteractionType, type TimeSlot } from '../events/filters';
import { businessDayStart } from '@/lib/hours';
import type { z } from 'zod';
import type { CreateEventSchema, UpdateEventSchema } from '../validation';

// Máximo de eventos por página: un cliente no puede pedir todo el catálogo de una vez.
const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 12;

export type Requester = { id: string; role: string };

export type EventListFilters = {
  free?: boolean;
  audience?: string;
  indoor?: boolean;
  timeSlot?: TimeSlot;
};

// Ventana de publicación: todo listado público la aplica (ver CLAUDE.md).
export function publicationWindow(now: Date) {
  return {
    OR: [{ publicationEndDate: null }, { publicationEndDate: { gte: now } }],
    AND: [{ OR: [{ publicationStartDate: null }, { publicationStartDate: { lte: now } }] }],
  };
}

// Eventos vigentes: publicados y cuya fecha no pasó. Los eventos no tienen hora de término,
// así que cada uno sigue visible hasta que termina su día en Chile.
export function activeEvents(now: Date) {
  return { ...publicationWindow(now), date: { gte: businessDayStart(now) } };
}

export async function listEvents(city: string | undefined, page: number | undefined, limit: number | undefined, filters: EventListFilters) {
  const now = new Date();
  const safePage = page !== undefined && Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeLimit =
    limit !== undefined && Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const skip = (safePage - 1) * safeLimit;

  const where: Record<string, unknown> = activeEvents(now);
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (filters.free) where.entryType = 'GRATIS';
  if (filters.audience) where.audience = filters.audience;
  if (filters.indoor !== undefined) where.indoor = filters.indoor;

  // La franja horaria depende de la hora local de Chile: se filtra sobre la página obtenida.
  const [rows, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: { owner: { select: PUBLIC_USER_SELECT }, category: true },
      skip,
      take: safeLimit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.event.count({ where }),
  ]);

  const data = filters.timeSlot ? rows.filter((e) => matchesTimeSlot(e.date, filters.timeSlot!)) : rows;
  return { data, total, page: safePage, limit: safeLimit };
}

export async function registerInteraction(eventId: string, type: InteractionType) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
  if (!event) throw notFound('Evento no encontrado');
  await prisma.eventInteraction.create({ data: { eventId, type } });
}

export async function statsForOwner(ownerId: string) {
  const events = await prisma.event.findMany({
    where: { ownerId },
    select: { id: true, title: true, slug: true },
    orderBy: { createdAt: 'desc' },
  });
  const counts = await prisma.eventInteraction.groupBy({
    by: ['eventId', 'type'],
    where: { eventId: { in: events.map((e) => e.id) } },
    _count: { _all: true },
  });
  return events.map((e) => {
    const count = (type: InteractionType) => counts.find((c) => c.eventId === e.id && c.type === type)?._count._all ?? 0;
    return { ...e, views: count('VIEW'), directions: count('DIRECTIONS'), externalLinks: count('EXTERNAL_LINK') };
  });
}

export function findEventBySlug(slug: string) {
  return prisma.event.findUnique({
    where: { slug },
    include: {
      owner: { select: PUBLIC_USER_SELECT },
      category: true,
      attendees: true,
      media: { orderBy: { createdAt: 'desc' } },
    },
  });
}

export function eventsByOwner(ownerId: string) {
  return prisma.event.findMany({
    where: { ownerId },
    include: { owner: { select: PUBLIC_USER_SELECT }, category: true },
  });
}

async function resolveCategory(categoryName?: string | null): Promise<string | undefined> {
  if (!categoryName) return undefined;
  const existing = await prisma.category.findUnique({ where: { name: categoryName } });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name: categoryName } });
  return created.id;
}

export async function createEvent(ownerId: string, body: z.output<typeof CreateEventSchema>) {
  const categoryId = body.categoryId || (await resolveCategory(body.categoryName));
  try {
    return await prisma.event.create({
      data: {
        title: body.title,
        description: body.description,
        slug: body.slug || eventSlug(body.title),
        date: new Date(body.date),
        ownerId,
        categoryId,
        locationName: body.locationName,
        address: body.address,
        city: body.city,
        isOnline: body.isOnline ?? false,
        imageUrl: body.imageUrl,
        instagramMediaId: body.instagramMediaId,
        publicationStartDate: body.publicationStartDate ? new Date(body.publicationStartDate) : undefined,
        publicationEndDate: body.publicationEndDate ? new Date(body.publicationEndDate) : undefined,
        entryType: body.entryType,
        audience: body.audience,
        indoor: body.indoor,
        amenities: body.amenities ?? Prisma.DbNull,
      },
      include: { owner: { select: PUBLIC_USER_SELECT }, category: true },
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw conflict('Ya existe un evento con ese slug');
    throw e;
  }
}

export async function updateEvent(id: string, body: z.output<typeof UpdateEventSchema>, requester: Requester) {
  await assertCanManage(id, requester);
  const { categoryName, date, publicationStartDate, publicationEndDate, amenities, ...rest } = body;
  const data: Record<string, unknown> = { ...rest };
  // Un campo Json no acepta null: para borrarlo hay que usar Prisma.DbNull.
  if (amenities !== undefined) data.amenities = amenities === null ? Prisma.DbNull : amenities;
  if (date) data.date = new Date(date);
  if (publicationStartDate) data.publicationStartDate = new Date(publicationStartDate);
  // null borra la fecha de término (el evento queda visible sin fin).
  if (publicationEndDate !== undefined) data.publicationEndDate = publicationEndDate ? new Date(publicationEndDate) : null;
  if (categoryName) data.categoryId = await resolveCategory(categoryName);
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(id: string, requester: Requester) {
  await assertCanManage(id, requester);
  return prisma.event.delete({ where: { id } });
}

// Solo el dueño del evento o un ADMIN puede modificarlo o borrarlo.
async function assertCanManage(id: string, requester: Requester) {
  const event = await prisma.event.findUnique({ where: { id }, select: { ownerId: true } });
  if (!event) throw notFound('Evento no encontrado');
  if (event.ownerId !== requester.id && requester.role !== 'ADMIN') {
    throw forbidden('No puedes modificar este evento');
  }
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002';
}
