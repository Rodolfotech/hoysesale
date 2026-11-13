// Secciones del inicio bajo "Eventos destacados". Sin 'use client': las usan el servidor y la página.
import { BUSINESS_CATEGORY_GROUPS, BUSINESS_DAYS } from '@/constants/business';
import { businessNow } from '@/lib/hours';

const groupOptions = (label: string): readonly string[] => BUSINESS_CATEGORY_GROUPS.find((group) => group.label === label)!.options;

// "Hoy se sale": eventos destacados que quien publica marcó para esa sección (Event.hoySeSale).
// "Experiencias todo el año": actividades que publican las empresas de turismo.
export const EXPERIENCE_CATEGORIES = groupOptions('Turismo, Experiencias y Tiempo Libre');

// Mismos campos públicos que el listado de eventos: Hoy se sale usa la tarjeta de Eventos destacados.
export interface HomeEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  imageUrl: string | null;
  locationName: string | null;
  address: string | null;
  city: string | null;
  isOnline: boolean;
  entryType: string | null;
  category: { id: string; name: string } | null;
  owner: { id: string; name: string; slug: string | null; avatar: string | null; comuna: string | null; instagramUsername: string | null; companyInstagram: string | null };
}

export interface HomeExperience extends HomeEvent {
  notes: string[]; // avisos para la visita (¡Te esperamos!, Sin reserva…)
  publicationEndDate: string | null; // hasta cuándo se muestra
  openDays: string[]; // días de BUSINESS_DAYS en que la empresa atiende según su horario; vacío si no lo publica
}

// Publicación reciente de un local: una novedad publicada (casilla Lo nuevo en la región) o, si no tiene,
// su último producto o servicio del micro-sitio.
export interface HomeNews {
  id: string;
  kind: 'novedad' | 'producto' | 'servicio';
  eventSlug: string | null; // novedad: abre su detalle
  notes: string[]; // avisos para la visita de una novedad
  title: string;
  description: string | null;
  imageUrl: string | null;
  price: number | null;
  createdAt: string;
  business: { name: string; slug: string | null; logoUrl: string | null; comuna: string | null };
}

export interface HomeSections {
  outings: HomeEvent[];
  experiences: HomeExperience[];
  news: HomeNews[];
}

export const ENTRY_TYPE_LABELS: Record<string, string> = { GRATIS: 'Gratis', CONSUMO_MINIMO: 'Consumo mínimo', COVER: 'Cover' };

// ---- Pestañas de "Hoy se sale", con la fecha de Chile ----

export type OutingRange = 'hoy' | 'finde' | 'proxima' | 'despues';
export const OUTING_RANGES: { id: OutingRange; label: string }[] = [
  { id: 'hoy', label: 'Hoy' },
  { id: 'finde', label: 'Este finde' },
  { id: 'proxima', label: 'Próxima semana' },
  { id: 'despues', label: 'Más adelante' }, // después de la próxima semana
];

// Suma días a una fecha "AAAA-MM-DD" sin depender de la zona horaria del navegador.
export function addDays(key: string, days: number): string {
  const d = new Date(`${key}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// Fechas (AAAA-MM-DD, Chile) que abarca cada pestaña. La semana va de lunes a domingo.
export function outingRange(range: OutingRange, now: Date = new Date()): { from: string; to: string } {
  const { date: today, day } = businessNow(now);
  const weekday = BUSINESS_DAYS.indexOf(day as (typeof BUSINESS_DAYS)[number]); // 0 = lunes
  const sunday = addDays(today, 6 - weekday);
  if (range === 'hoy') return { from: today, to: today };
  if (range === 'finde') {
    const friday = addDays(today, 4 - weekday);
    return { from: friday > today ? friday : today, to: sunday };
  }
  if (range === 'proxima') return { from: addDays(sunday, 1), to: addDays(sunday, 7) };
  return { from: addDays(sunday, 8), to: '9999-12-31' };
}

export function inOutingRange(date: string | Date, range: OutingRange, now: Date = new Date()): boolean {
  const key = businessNow(new Date(date)).date;
  const { from, to } = outingRange(range, now);
  return key >= from && key <= to;
}
