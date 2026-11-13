// Reglas por categoría de la empresa. Sin 'use client': las usan el servidor y los formularios.
import { BUSINESS_CATEGORIES, isBusinessCategory } from '@/constants/business';
import { GIROS_SII, giroLabel } from '@/constants/giros';
import { HIDEABLE_TABS, type HideableTab } from '@/lib/business';

// Cada categoría tiene un tipo que define sus pestañas iniciales y si publica eventos.
// Si una categoría aparece en dos listas, manda la regla más reciente: servicios > productos > eventos.

// Servicios con reserva de horas, turnos o cotización: muestran Servicios y no publican eventos.
export const SERVICE_CATEGORIES: readonly string[] = [
  // Gastronomía (reserva de mesa, salón privado, banquetería por encargo)
  'Restaurantes y Bistrós', 'Cafeterías, Pastelerías y Salones de Té',
  // Talleres productivos (encargos, reparación o ajuste)
  'Artesanías y Souvenirs', 'Moda, Calzado y Vestuario',
  // Bienestar
  'Estética y Peluquería', 'Spas y Relajación',
  // Servicios profesionales y técnicos (talleres, reparación, imprentas, veterinarias, inmobiliarias, cerrajerías)
  'Reparación y Servicio Técnico', 'Imprentas y Publicidad', 'Servicios Especializados (Inmobiliarias, Veterinaria, etc.)',
];

// Productos físicos: muestran Productos y no publican eventos.
export const PRODUCT_CATEGORIES: readonly string[] = [
  'Bares, Cervecerías y Pubs', 'Comida Rápida y Al Paso',
  'Productores Locales y Emporios', 'Hogar, Decoración y Bazar', 'Tecnología y Telefonía', 'Mundo Animal (Pet Shops)',
  'Salud y Suplementación Natural',
];

// Las que publican eventos: todas las demás (Turismo, Experiencias y Tiempo Libre; Panoramas, Cultura y Espacios de Eventos).
export const EVENT_CATEGORIES: readonly string[] = BUSINESS_CATEGORIES.filter(
  (category) => !SERVICE_CATEGORIES.includes(category) && !PRODUCT_CATEGORIES.includes(category),
);

// Comercio funcional (atiende por demanda o urgencia): no publica eventos aunque su categoría lo permita.
// Son los giros de servicios de barrio y las ferreterías.
const FUNCTIONAL_GIROS = new Set<string>([
  ...GIROS_SII.find((group) => group.id === 'servicios-barrio')!.giros.map(giroLabel),
  ...GIROS_SII.flatMap((group) => group.giros).filter((giro) => giro.codigo === '475201').map(giroLabel),
]);

export const EVENTS_NOT_ALLOWED_MESSAGE = 'Elige la categoría de tu empresa en tu perfil para publicar eventos.';

// Publican eventos todas las empresas con una categoría válida (13-11-2026: antes solo Turismo y Panoramas).
// El giro ya no lo impide. Experiencias todo el año sigue reservado a Turismo (src/lib/home.ts).
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- el giro se conserva en la firma: lo pasan el servidor y la interfaz
export function canPublishEvents(category: string | null | undefined, _giro?: string | null): boolean {
  return isBusinessCategory(category);
}

// Empresa de eventos: categoría de Turismo o Panoramas sin giro de comercio funcional.
// Define la pestaña Eventos del micro-sitio y dónde puede publicar.
function hasEventsTab(category: string | null | undefined, giro: string | null | undefined): boolean {
  return EVENT_CATEGORIES.includes(category ?? '') && !FUNCTIONAL_GIROS.has(giro ?? '');
}

const TOURISM_CATEGORIES: readonly string[] = BUSINESS_CATEGORIES.slice(
  BUSINESS_CATEGORIES.indexOf('Tours y Agencias Locales'), BUSINESS_CATEGORIES.indexOf('Talleres y Experiencias Vivenciales') + 1,
);

// Dónde puede publicar cada empresa (casillas de "¿Dónde se publicará?"). El servidor aplica lo mismo.
// - Empresas de eventos (Turismo y Panoramas): Eventos destacados y Hoy se sale; Turismo además Experiencias todo el año.
// - Las demás (servicios, productos y giros de comercio funcional): Experiencias todo el año y Lo nuevo en la región.
// - Sin categoría válida: nada.
export type Placement = 'featured' | 'hoySeSale' | 'yearRound' | 'news';
export const PLACEMENT_LABELS: Record<Placement, string> = {
  featured: 'Eventos destacados', hoySeSale: 'Hoy se sale', yearRound: 'Experiencias todo el año', news: 'Novedades', // Novedades se muestra en "Lo nuevo en la región"
};

// Avisos para la visita: reemplazan "El evento es gratuito" en las empresas que publican Novedades.
// Se guardan en Event.amenities.
export const VISIT_NOTES = [
  { id: 'te-esperamos', label: '¡Te esperamos!' },
  { id: 'sin-reserva', label: 'Sin reserva' },
  { id: 'orden-llegada', label: 'Por orden de llegada' },
  { id: 'ven-a-conocernos', label: 'Ven a conocernos' },
] as const;
export type VisitNote = (typeof VISIT_NOTES)[number]['id'];
export const VISIT_NOTE_IDS = VISIT_NOTES.map((note) => note.id) as [VisitNote, ...VisitNote[]];

// Lee los avisos guardados, ignorando cualquier otro valor.
export function visitNoteLabels(saved: unknown): string[] {
  const ids = Array.isArray(saved) ? saved : [];
  return VISIT_NOTES.filter((note) => ids.includes(note.id)).map((note) => note.label);
}

export function allowedPlacements(category: string | null | undefined, giro: string | null | undefined): Placement[] {
  if (!isBusinessCategory(category)) return [];
  if (hasEventsTab(category, giro)) return TOURISM_CATEGORIES.includes(category) ? ['featured', 'hoySeSale', 'yearRound'] : ['featured', 'hoySeSale'];
  return ['yearRound', 'news'];
}

// Pestañas disponibles según el tipo de categoría (Nosotros siempre está). Las demás no existen para la empresa:
// no las ve nadie, ni el dueño, y su contenido no se envía. Si cambia la categoría, cambian las pestañas.
// - Servicios: Contáctanos, Horario, Nosotros, Reseñas y Servicios.
// - Productos: Contáctanos, Horario, Nosotros, Productos y Reseñas.
// - Eventos: Contáctanos, Eventos, Horario, Nosotros y Reseñas.
// - Sin categoría válida (o de eventos con giro funcional): Contáctanos, Horario, Nosotros y Reseñas.
const BASE_TABS: HideableTab[] = ['contactanos', 'horario', 'resenas'];

export function availableTabs(category: string | null | undefined, giro: string | null | undefined): HideableTab[] {
  if (SERVICE_CATEGORIES.includes(category ?? '')) return [...BASE_TABS, 'servicios'];
  if (PRODUCT_CATEGORIES.includes(category ?? '')) return [...BASE_TABS, 'productos'];
  if (hasEventsTab(category, giro)) return [...BASE_TABS, 'eventos'];
  return BASE_TABS;
}

export function unavailableTabs(category: string | null | undefined, giro: string | null | undefined): HideableTab[] {
  const available = availableTabs(category, giro);
  return HIDEABLE_TABS.filter((tab) => !available.includes(tab));
}
