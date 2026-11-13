import { prisma } from '../db';
import { EVENTS_NOT_ALLOWED_MESSAGE, PLACEMENT_LABELS, allowedPlacements, canPublishEvents, type Placement } from '@/lib/business-rules';
import { Prisma } from '@/generated/prisma/client';
import { badRequest, forbidden, notFound, conflict } from '../http';
import { PUBLIC_USER_SELECT } from '../users/public-user';
import { mapEmbedUrl } from '@/lib/map-embed';
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
  type?: 'destacado' | 'todo-el-ano'; // destacado: casilla Eventos destacados y fecha vigente; todo-el-ano: experiencias
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
// Experiencias todo el año y Lo nuevo en la región no dependen de su fecha: las limita solo su fecha de término.
export function activeEvents(now: Date) {
  const window = publicationWindow(now);
  return { ...window, AND: [...window.AND, { OR: [{ yearRound: true }, { news: true }, { date: { gte: businessDayStart(now) } }] }] };
}

// Experiencias y novedades duran como máximo un año desde que se publican (o desde su fecha si no tienen inicio).
const YEAR_MS = 367 * 24 * 60 * 60 * 1000; // un año y un margen por las zonas horarias

function assertLongWindow(start: Date, end: Date | null | undefined) {
  if (!end) throw badRequest('Esta publicación necesita fecha de término (Visible hasta)');
  if (end.getTime() - start.getTime() > YEAR_MS) throw badRequest('Esta publicación puede estar visible como máximo un año');
  if (end < start) throw badRequest('La fecha de término no puede ser anterior al inicio');
}

type Placements = Record<Placement, boolean>;

// Dónde se publica: al menos una casilla, y solo las que permite el tipo de empresa (business-rules.ts).
function assertPlacements(chosen: Placements, allowed: Placement[]) {
  const marked = (Object.keys(chosen) as Placement[]).filter((p) => chosen[p]);
  if (marked.length === 0) throw badRequest('Elige dónde se publicará');
  const notAllowed = marked.find((p) => !allowed.includes(p));
  if (notAllowed) throw forbidden(`Tu empresa no puede publicar en ${PLACEMENT_LABELS[notAllowed]}`);
}

export async function listEvents(city: string | undefined, page: number | undefined, limit: number | undefined, filters: EventListFilters) {
  const now = new Date();
  const safePage = page !== undefined && Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeLimit =
    limit !== undefined && Number.isFinite(limit) && limit >= 1 ? Math.min(Math.floor(limit), MAX_PAGE_SIZE) : DEFAULT_PAGE_SIZE;
  const skip = (safePage - 1) * safeLimit;

  const where: Record<string, unknown> = activeEvents(now);
  if (city) where.city = { equals: city, mode: 'insensitive' };
  if (filters.type === 'destacado') Object.assign(where, { featured: true, date: { gte: businessDayStart(now) } });
  if (filters.type === 'todo-el-ano') where.yearRound = true;
  // Los listados de eventos no muestran lo que solo va a Lo nuevo en la región.
  if (!filters.type) where.AND = [...(where.AND as object[]), { OR: [{ featured: true }, { hoySeSale: true }, { yearRound: true }] }];
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

export async function findEventBySlug(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      owner: { select: { ...PUBLIC_USER_SELECT, mapUrl: true, companyAddress: true, hiddenTabs: true, contactInAllTabs: true } },
      category: true,
      attendees: true,
      media: { orderBy: { createdAt: 'desc' } },
    },
  });
  if (!event) return null;

  // Estos datos solo sirven para ubicar el mapa: el visitante recibe la URL ya armada.
  const { mapUrl, companyAddress, hiddenTabs, contactInAllTabs, ...owner } = event.owner;
  // Igual que en el micro-sitio: la dirección no se revela si el dueño ocultó Contáctanos.
  const addressHidden = hiddenTabs.includes('contactanos') && !contactInAllTabs;
  const ownPlace = event.locationName || (event.address && /[a-z]/i.test(event.address) && !event.address.startsWith('http') ? event.address : null);
  const place = (value: string | null) => (value ? [value, event.city].filter(Boolean).join(', ') : null);
  return {
    ...event,
    owner,
    mapEmbedUrl: ownPlace
      ? mapEmbedUrl(null, place(ownPlace))
      : mapEmbedUrl(mapUrl, place(addressHidden ? null : companyAddress), event.city),
  };
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

// Una empresa solo publica eventos de la comuna con que se registró.
async function ownerComuna(ownerId: string): Promise<string> {
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { comuna: true } });
  if (!owner?.comuna) throw badRequest('Completa la comuna de tu empresa en tu perfil para publicar eventos');
  return owner.comuna;
}

// Solo publican eventos las categorías de los grupos 1 a 5 sin giro de comercio funcional (business-rules.ts).
async function assertCanPublishEvents(ownerId: string) {
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { category: true, companyGiro: true } });
  if (!canPublishEvents(owner?.category, owner?.companyGiro)) throw forbidden(EVENTS_NOT_ALLOWED_MESSAGE);
}

function assertSameComuna(city: string | undefined, comuna: string) {
  if (city !== undefined && city !== comuna) throw badRequest(`Solo puedes publicar eventos en tu comuna (${comuna})`);
}

export async function createEvent(ownerId: string, body: z.output<typeof CreateEventSchema>) {
  const comuna = await ownerComuna(ownerId);
  assertSameComuna(body.city, comuna);
  await assertCanPublishEvents(ownerId);
  const owner = await prisma.user.findUnique({ where: { id: ownerId }, select: { category: true, companyGiro: true } });
  const allowed = allowedPlacements(owner?.category, owner?.companyGiro);
  const placements: Placements = {
    featured: body.featured ?? allowed.includes('featured'),
    hoySeSale: body.hoySeSale ?? false,
    yearRound: body.yearRound ?? false,
    news: body.news ?? false,
  };
  assertPlacements(placements, allowed);
  if (placements.yearRound || placements.news) {
    const end = body.publicationEndDate ? new Date(body.publicationEndDate) : null;
    assertLongWindow(body.publicationStartDate ? new Date(body.publicationStartDate) : new Date(body.date), end);
  }
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
        city: comuna,
        isOnline: body.isOnline ?? false,
        imageUrl: body.imageUrl,
        instagramMediaId: body.instagramMediaId,
        publicationStartDate: body.publicationStartDate ? new Date(body.publicationStartDate) : undefined,
        publicationEndDate: body.publicationEndDate ? new Date(body.publicationEndDate) : undefined,
        entryType: body.entryType,
        audience: body.audience,
        indoor: body.indoor,
        amenities: body.amenities ?? Prisma.DbNull,
        ...placements,
      },
      include: { owner: { select: PUBLIC_USER_SELECT }, category: true },
    });
  } catch (e) {
    if (isUniqueViolation(e)) throw conflict('Ya existe un evento con ese slug');
    throw e;
  }
}

export async function updateEvent(id: string, body: z.output<typeof UpdateEventSchema>, requester: Requester) {
  const ownerId = await assertCanManage(id, requester);
  // Vale también cuando edita un administrador: manda la comuna del dueño del evento.
  if (body.city !== undefined) assertSameComuna(body.city, await ownerComuna(ownerId));
  const { categoryName, date, publicationStartDate, publicationEndDate, amenities, ...rest } = body;
  const data: Record<string, unknown> = { ...rest };
  // Un campo Json no acepta null: para borrarlo hay que usar Prisma.DbNull.
  if (amenities !== undefined) data.amenities = amenities === null ? Prisma.DbNull : amenities;
  if (date) data.date = new Date(date);
  if (publicationStartDate) data.publicationStartDate = new Date(publicationStartDate);
  // null borra la fecha de término (el evento queda visible sin fin).
  if (publicationEndDate !== undefined) data.publicationEndDate = publicationEndDate ? new Date(publicationEndDate) : null;
  if (categoryName) data.categoryId = await resolveCategory(categoryName);
  // Dónde se publica: las mismas reglas que al crear. Una casilla que ya estaba marcada se puede conservar
  // aunque la empresa haya cambiado de tipo; solo se rechaza marcar una nueva que no le corresponde.
  const touchesPlacement = body.featured !== undefined || body.hoySeSale !== undefined || body.yearRound !== undefined || body.news !== undefined;
  if (touchesPlacement || publicationStartDate !== undefined || publicationEndDate !== undefined) {
    const current = await prisma.event.findUnique({
      where: { id },
      select: {
        featured: true, hoySeSale: true, yearRound: true, news: true, date: true, publicationStartDate: true, publicationEndDate: true,
        owner: { select: { category: true, companyGiro: true } },
      },
    });
    if (current) {
      const placements: Placements = {
        featured: body.featured ?? current.featured,
        hoySeSale: body.hoySeSale ?? current.hoySeSale,
        yearRound: body.yearRound ?? current.yearRound,
        news: body.news ?? current.news,
      };
      const allowed = allowedPlacements(current.owner.category, current.owner.companyGiro);
      const kept = (Object.keys(placements) as Placement[]).filter((p) => current[p] && placements[p]);
      assertPlacements(placements, [...allowed, ...kept]);
      if (placements.yearRound || placements.news) {
        const start = (data.publicationStartDate as Date | undefined) ?? current.publicationStartDate ?? current.date;
        const end = publicationEndDate !== undefined ? (data.publicationEndDate as Date | null) : current.publicationEndDate;
        assertLongWindow(start, end);
      }
    }
  }
  return prisma.event.update({ where: { id }, data });
}

export async function deleteEvent(id: string, requester: Requester) {
  await assertCanManage(id, requester);
  return prisma.event.delete({ where: { id } });
}

// Solo el dueño del evento o un ADMIN puede modificarlo o borrarlo.
async function assertCanManage(id: string, requester: Requester): Promise<string> {
  const event = await prisma.event.findUnique({ where: { id }, select: { ownerId: true } });
  if (!event) throw notFound('Evento no encontrado');
  if (event.ownerId !== requester.id && requester.role !== 'ADMIN') {
    throw forbidden('No puedes modificar este evento');
  }
  return event.ownerId;
}

function isUniqueViolation(e: unknown): boolean {
  return typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002';
}
