import { describe, expect, it } from 'vitest';
import { formatRut, isValidRut } from './rut';

describe('RUT', () => {
  it('acepta RUT válidos con o sin puntos y guion', () => {
    expect(isValidRut('11.111.111-1')).toBe(true);
    expect(isValidRut('111111111')).toBe(true);
    expect(isValidRut('76.086.428-5')).toBe(true);
    expect(isValidRut('10.000.013-k')).toBe(true);
  });

  it('rechaza dígito verificador incorrecto o formatos inválidos', () => {
    expect(isValidRut('11.111.111-2')).toBe(false);
    expect(isValidRut('abc')).toBe(false);
    expect(isValidRut('—')).toBe(false);
    expect(isValidRut('123-4')).toBe(false);
  });

  it('formatea con puntos y guion', () => {
    expect(formatRut('760864285')).toBe('76.086.428-5');
    expect(formatRut('10000013k')).toBe('10.000.013-K');
    expect(formatRut('texto')).toBe('texto');
  });
});
