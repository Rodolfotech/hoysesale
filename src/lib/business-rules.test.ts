import { describe, expect, it } from 'vitest';
import { BUSINESS_CATEGORIES } from '@/constants/business';
import { EVENT_CATEGORIES, PRODUCT_CATEGORIES, SERVICE_CATEGORIES, allowedPlacements, availableTabs, canPublishEvents, unavailableTabs } from './business-rules';

describe('reglas por categoría', () => {
  it('cada categoría tiene un solo tipo', () => {
    const all = [...SERVICE_CATEGORIES, ...PRODUCT_CATEGORIES, ...EVENT_CATEGORIES];
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...BUSINESS_CATEGORIES].sort());
    expect([SERVICE_CATEGORIES.length, PRODUCT_CATEGORIES.length, EVENT_CATEGORIES.length]).toEqual([9, 7, 8]);
  });

  it('dónde puede publicar cada tipo de empresa', () => {
    expect(allowedPlacements('Tours y Agencias Locales', null)).toEqual(['featured', 'hoySeSale', 'yearRound']);
    expect(allowedPlacements('Centros Culturales y Galerías', null)).toEqual(['featured', 'hoySeSale']);
    expect(allowedPlacements('Restaurantes y Bistrós', null)).toEqual(['yearRound', 'news']);
    expect(allowedPlacements('Bares, Cervecerías y Pubs', null)).toEqual(['yearRound', 'news']);
    // Categoría de eventos con giro de comercio funcional: publica como un local.
    expect(allowedPlacements('Recreación y Deporte', 'Cerrajerías (802000)')).toEqual(['yearRound', 'news']);
    expect(allowedPlacements('Café', null)).toEqual([]);
    expect(allowedPlacements(null, null)).toEqual([]);
  });

  it('publican eventos Turismo y Panoramas', () => {
    expect(canPublishEvents('Tours y Agencias Locales', 'Agencias de viajes (791100)')).toBe(true);
    expect(canPublishEvents('Centros Culturales y Galerías', null)).toBe(true);
  });

  it('publican también servicios, productos y comercio funcional; no las cuentas sin categoría válida', () => {
    expect(canPublishEvents('Restaurantes y Bistrós', null)).toBe(true);
    expect(canPublishEvents('Estética y Peluquería', null)).toBe(true);
    expect(canPublishEvents('Bares, Cervecerías y Pubs', null)).toBe(true);
    expect(canPublishEvents('Recreación y Deporte', 'Cerrajerías (802000)')).toBe(true);
    expect(canPublishEvents('Café', null)).toBe(false); // categoría antigua
    expect(canPublishEvents(null, null)).toBe(false);
  });

  it('pestañas disponibles según el tipo de categoría', () => {
    expect(availableTabs('Spas y Relajación', null)).toEqual(['contactanos', 'horario', 'resenas', 'servicios']);
    expect(availableTabs('Tecnología y Telefonía', null)).toEqual(['contactanos', 'horario', 'resenas', 'productos']);
    expect(availableTabs('Turismo Aventura y Alquiler', null)).toEqual(['contactanos', 'horario', 'resenas', 'eventos']);
    expect(availableTabs('Recreación y Deporte', 'Cerrajerías (802000)')).toEqual(['contactanos', 'horario', 'resenas']);
    expect(availableTabs(null, null)).toEqual(['contactanos', 'horario', 'resenas']);
    expect(unavailableTabs('Restaurantes y Bistrós', null)).toEqual(['eventos', 'productos']);
  });
});
