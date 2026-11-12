import { describe, expect, it } from 'vitest';
import { BUSINESS_CATEGORIES } from '@/constants/business';
import { EVENT_CATEGORIES, PRODUCT_CATEGORIES, SERVICE_CATEGORIES, availableTabs, canPublishEvents, unavailableTabs } from './business-rules';

describe('reglas por categoría', () => {
  it('cada categoría tiene un solo tipo', () => {
    const all = [...SERVICE_CATEGORIES, ...PRODUCT_CATEGORIES, ...EVENT_CATEGORIES];
    expect(new Set(all).size).toBe(all.length);
    expect([...all].sort()).toEqual([...BUSINESS_CATEGORIES].sort());
    expect([SERVICE_CATEGORIES.length, PRODUCT_CATEGORIES.length, EVENT_CATEGORIES.length]).toEqual([9, 7, 8]);
  });

  it('publican eventos solo Turismo y Panoramas', () => {
    expect(canPublishEvents('Tours y Agencias Locales', 'Agencias de viajes (791100)')).toBe(true);
    expect(canPublishEvents('Centros Culturales y Galerías', null)).toBe(true);
  });

  it('no publican servicios, productos, comercio funcional ni cuentas sin categoría válida', () => {
    expect(canPublishEvents('Restaurantes y Bistrós', null)).toBe(false);
    expect(canPublishEvents('Estética y Peluquería', null)).toBe(false);
    expect(canPublishEvents('Bares, Cervecerías y Pubs', null)).toBe(false);
    expect(canPublishEvents('Recreación y Deporte', 'Cerrajerías (802000)')).toBe(false);
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
