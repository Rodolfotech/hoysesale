import { describe, expect, it } from 'vitest';
import { companyRutError, formatRut, formatRutInput, isCompanyRut, isValidRut } from './rut';

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

  it('exige RUT de persona jurídica para la empresa', () => {
    expect(isCompanyRut('76.086.428-5')).toBe(true);
    expect(isCompanyRut('74.656.565-8')).toBe(true);
    expect(isCompanyRut('11.111.111-1')).toBe(false); // persona natural
    expect(isCompanyRut('74.656.565-7')).toBe(false); // dígito verificador incorrecto
    expect(companyRutError('76.086.428-5')).toBeNull();
    expect(companyRutError('74.656.565-7')).toMatch(/dígito verificador/);
    expect(companyRutError('11.111.111-1')).toMatch(/persona jurídica/);
  });

  it('formatea mientras se escribe', () => {
    expect(formatRutInput('7')).toBe('7');
    expect(formatRutInput('74')).toBe('7-4');
    expect(formatRutInput('740004')).toBe('74.000-4');
    expect(formatRutInput('740008885')).toBe('74.000.888-5');
    expect(formatRutInput('74086428-5')).toBe('74.086.428-5');
    expect(formatRutInput('74.000.888-55')).toBe('74.000.888-5'); // máximo 9 caracteres
    expect(formatRutInput('10000013k')).toBe('10.000.013-K');
    expect(formatRutInput('7k4a.-')).toBe('7-4'); // la K solo va al final
  });

  it('formatea con puntos y guion', () => {
    expect(formatRut('760864285')).toBe('76.086.428-5');
    expect(formatRut('10000013k')).toBe('10.000.013-K');
    expect(formatRut('texto')).toBe('texto');
  });
});
