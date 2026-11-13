import { prisma } from '../db';
import { activeEvents } from './events';
import { businessDayStart } from '@/lib/hours';
import { BUSINESS_DAYS } from '@/constants/business';
import { PRODUCT_CATEGORIES, SERVICE_CATEGORIES, visitNoteLabels } from '@/lib/business-rules';
import { parseShifts, type BusinessHours } from '@/lib/hours';
import { type HomeEvent, type HomeNews, type HomeSections } from '@/lib/home';

const OUTINGS_MAX = 60; // próximos eventos marcados para Hoy se sale, por fecha
const EXPERIENCES_MAX = 12;
const NEWS_MAX = 8;
const NEWS_CANDIDATES = 40; // se toman varias para dejar una por local

// Solo datos públicos de la empresa: los mismos que muestra su micro-sitio.
const OWNER_SELECT = { id: true, name: true, slug: true, avatar: true, comuna: true, instagramUsername: true, companyInstagram: true } as const;
const EVENT_SELECT = {
  id: true, title: true, slug: true, description: true, date: true, imageUrl: true, locationName: true,
  address: true, city: true, isOnline: true, entryType: true, category: { select: { id: true, name: true } },
} as const;

// Días con atención según el horario del micro-sitio (nada si el dueño ocultó el horario).
function openDays(hours: unknown, hiddenTabs: string[]): string[] {
  if (hiddenTabs.includes('horario') || !hours || typeof hours !== 'object') return [];
  const h = hours as BusinessHours;
  return BUSINESS_DAYS.filter((day) => parseShifts(h[day]).length > 0);
}

export async function homeSections(now: Date = new Date()): Promise<HomeSections> {
  // La pestaña Eventos oculta no impide aparecer aquí, igual que en "Eventos destacados".
  const [outings, experiences, posts, products, services] = await Promise.all([
    prisma.event.findMany({
      where: { ...activeEvents(now), hoySeSale: true, date: { gte: businessDayStart(now) } },
      select: { ...EVENT_SELECT, owner: { select: OWNER_SELECT } },
      orderBy: { date: 'asc' },
      take: OUTINGS_MAX,
    }),
    prisma.event.findMany({
      where: { ...activeEvents(now), yearRound: true },
      select: { ...EVENT_SELECT, publicationEndDate: true, amenities: true, owner: { select: { ...OWNER_SELECT, hours: true, hiddenTabs: true } } },
      orderBy: { createdAt: 'desc' },
      take: EXPERIENCES_MAX,
    }),
    // Novedades publicadas con la casilla Lo nuevo en la región.
    prisma.event.findMany({
      where: { ...activeEvents(now), news: true },
      select: { id: true, slug: true, title: true, description: true, imageUrl: true, createdAt: true, amenities: true, owner: { select: { name: true, slug: true, logoUrl: true, comuna: true } } },
      orderBy: { createdAt: 'desc' },
      take: NEWS_CANDIDATES,
    }),
    // Y el catálogo: productos y servicios de locales comerciales (con dirección y micro-sitio) que los muestran.
    prisma.businessProduct.findMany({
      where: { owner: { category: { in: [...PRODUCT_CATEGORIES] }, slug: { not: null }, companyAddress: { not: null }, NOT: { hiddenTabs: { has: 'productos' } } } },
      select: { id: true, name: true, description: true, imageUrl: true, price: true, createdAt: true, owner: { select: { name: true, slug: true, logoUrl: true, comuna: true } } },
      orderBy: { createdAt: 'desc' },
      take: NEWS_CANDIDATES,
    }),
    prisma.businessService.findMany({
      where: { owner: { category: { in: [...SERVICE_CATEGORIES] }, slug: { not: null }, companyAddress: { not: null }, NOT: { hiddenTabs: { has: 'servicios' } } } },
      select: { id: true, title: true, description: true, imageUrl: true, createdAt: true, owner: { select: { name: true, slug: true, logoUrl: true, comuna: true } } },
      orderBy: { createdAt: 'desc' },
      take: NEWS_CANDIDATES,
    }),
  ]);

  const toEvent = (e: (typeof outings)[number]): HomeEvent => ({ ...e, date: e.date.toISOString() });

  // Primero las novedades publicadas; el catálogo completa con los locales que no publicaron. Una por local.
  const byDate = (a: HomeNews, b: HomeNews) => b.createdAt.localeCompare(a.createdAt);
  const published: HomeNews[] = posts.map((p) => ({
    id: p.id, kind: 'novedad', eventSlug: p.slug, notes: visitNoteLabels(p.amenities), title: p.title, description: p.description, imageUrl: p.imageUrl, price: null,
    createdAt: p.createdAt.toISOString(), business: p.owner,
  }));
  const catalog: HomeNews[] = [
    ...products.map((p) => ({ id: p.id, kind: 'producto' as const, eventSlug: null, notes: [], title: p.name, description: p.description, imageUrl: p.imageUrl, price: p.price, createdAt: p.createdAt.toISOString(), business: p.owner })),
    ...services.map((s) => ({ id: s.id, kind: 'servicio' as const, eventSlug: null, notes: [], title: s.title, description: s.description, imageUrl: s.imageUrl, price: null, createdAt: s.createdAt.toISOString(), business: s.owner })),
  ].sort(byDate);
  const seen = new Set<string>();
  const news = [...published.sort(byDate), ...catalog]
    .filter((n) => { const key = n.business.slug ?? n.business.name; return !seen.has(key) && !!seen.add(key); })
    .slice(0, NEWS_MAX);

  return {
    outings: outings.map(toEvent),
    experiences: experiences.map(({ owner: { hours, hiddenTabs, ...owner }, publicationEndDate, amenities, ...e }) => ({
      ...toEvent({ ...e, owner }), publicationEndDate: publicationEndDate?.toISOString() ?? null, openDays: openDays(hours, hiddenTabs),
      notes: visitNoteLabels(amenities),
    })),
    news,
  };
}
