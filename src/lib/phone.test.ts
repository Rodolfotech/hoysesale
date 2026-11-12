import { describe, expect, it } from 'vitest';
import { formatPhone } from './phone';

describe('formatPhone', () => {
  it('separa el prefijo y los 8 dígitos en grupos de 4', () => {
    expect(formatPhone('+56933331333')).toBe('+569 3333 1333');
  });

  it('deja igual lo que no es un móvil chileno', () => {
    expect(formatPhone('6546454612')).toBe('6546454612');
    expect(formatPhone(null)).toBe('');
  });
});
