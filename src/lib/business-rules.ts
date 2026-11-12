// Reglas por categoría de la empresa. Sin 'use client': las usan el servidor y los formularios.
import { BUSINESS_CATEGORIES } from '@/constants/business';
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

export const EVENTS_NOT_ALLOWED_MESSAGE = 'Tu categoría o giro no permite publicar eventos. Solo publican eventos las categorías de Turismo, Experiencias y Tiempo Libre, y de Panoramas, Cultura y Espacios de Eventos.';

export function canPublishEvents(category: string | null | undefined, giro: string | null | undefined): boolean {
  return EVENT_CATEGORIES.includes(category ?? '') && !FUNCTIONAL_GIROS.has(giro ?? '');
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
  if (canPublishEvents(category, giro)) return [...BASE_TABS, 'eventos'];
  return BASE_TABS;
}

export function unavailableTabs(category: string | null | undefined, giro: string | null | undefined): HideableTab[] {
  const available = availableTabs(category, giro);
  return HIDEABLE_TABS.filter((tab) => !available.includes(tab));
}
