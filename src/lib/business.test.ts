import { describe, expect, it } from 'vitest';
import { redactHiddenTabs, type Business } from './business';

const business = {
  hiddenTabs: [],
  contactInAllTabs: false,
  companyAddress: 'Calle 1',
  companyPhone: '+56934567890',
  companyInstagram: '@negocio',
  website: 'https://negocio.cl',
  hours: { lunes: '09:00-18:00' },
  events: [{ id: 'e' }],
  products: [{ id: 'p' }],
  services: [{ id: 's' }],
  reviews: [{ id: 'r' }],
} as unknown as Business;

const hide = (...hiddenTabs: string[]) => ({ ...business, hiddenTabs }) as Business;

describe('redactHiddenTabs', () => {
  it('no cambia nada si no hay pestañas ocultas', () => {
    expect(redactHiddenTabs(business)).toEqual(business);
  });

  it('quita solo el contenido de las pestañas ocultas', () => {
    const result = redactHiddenTabs(hide('productos', 'horario'));
    expect(result.products).toEqual([]);
    expect(result.hours).toBeNull();
    expect(result.services).toEqual(business.services);
    expect(result.events).toEqual(business.events);
    expect(result.reviews).toEqual(business.reviews);
  });

  it('quita eventos, servicios y reseñas ocultos', () => {
    const result = redactHiddenTabs(hide('eventos', 'servicios', 'resenas'));
    expect(result.events).toEqual([]);
    expect(result.services).toEqual([]);
    expect(result.reviews).toEqual([]);
  });

  it('quita los datos de contacto si Contáctanos está oculta', () => {
    const result = redactHiddenTabs(hide('contactanos'));
    expect(result.companyAddress).toBeNull();
    expect(result.companyPhone).toBeNull();
    expect(result.companyInstagram).toBeNull();
    expect(result.website).toBeNull();
  });

  it('los conserva si el dueño pidió mostrarlos en todas las pestañas', () => {
    const result = redactHiddenTabs({ ...hide('contactanos'), contactInAllTabs: true });
    expect(result.companyAddress).toBe('Calle 1');
  });
});
