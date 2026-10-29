// Filtros y tipos de eventos: insignias (entryType, audience, indoor) y métricas (interacciones).
export const INTERACTION_TYPES = ['VIEW', 'DIRECTIONS', 'EXTERNAL_LINK'] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const ENTRY_TYPES = ['GRATIS', 'CONSUMO_MINIMO', 'COVER'] as const;
export const AUDIENCES = ['PAREJA', 'FAMILIA', 'GENERAL'] as const;

export type TimeSlot = 'tarde' | 'noche';

// Tarde: 16:00 a 20:59. Noche: 21:00 en adelante. Hora local de Chile.
export function matchesTimeSlot(date: Date, slot: TimeSlot): boolean {
  const hour = Number(
    new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', hour12: false }).format(date),
  );
  return slot === 'tarde' ? hour >= 16 && hour < 21 : hour >= 21;
}
