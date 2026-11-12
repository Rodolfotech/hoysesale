// RUT chileno: cuerpo de 7 u 8 dígitos y dígito verificador (0-9 o K), calculado con módulo 11.
// Sin 'use client': lo usan el formulario del perfil y la validación del servidor.
function parts(value: string): { body: string; dv: string } | null {
  const clean = value.replace(/[.\s-]/g, '').toUpperCase();
  const match = clean.match(/^(\d{7,8})([\dK])$/);
  return match ? { body: match[1], dv: match[2] } : null;
}

function checkDigit(body: string): string {
  let sum = 0;
  let factor = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += Number(body[i]) * factor;
    factor = factor === 7 ? 2 : factor + 1;
  }
  const rest = 11 - (sum % 11);
  return rest === 11 ? '0' : rest === 10 ? 'K' : String(rest);
}

export function isValidRut(value: string): boolean {
  const rut = parts(value);
  return rut !== null && checkDigit(rut.body) === rut.dv;
}

// El SII asigna a las personas jurídicas (SpA, Ltda., SA, EIRL, fundaciones) RUT desde 50.000.000.
// Los menores corresponden a personas naturales.
export const COMPANY_RUT_MIN = 50_000_000;

export function isCompanyRut(value: string): boolean {
  const rut = parts(value);
  return isValidRut(value) && rut !== null && Number(rut.body) >= COMPANY_RUT_MIN;
}

// Mensaje del RUT de la empresa, o null si es válido. Lo usan el perfil y el servidor.
export function companyRutError(value: string): string | null {
  if (!isValidRut(value)) return 'El RUT de la empresa no es válido. Revisa el dígito verificador (el número después del guion).';
  if (!isCompanyRut(value)) return 'El RUT de la empresa debe ser de persona jurídica (desde 50.000.000).';
  return null;
}

// Formatea mientras se escribe: deja solo dígitos y una K final (máx. 9) y agrega puntos y guion.
// "740004" → "74.000-4", "740008885" → "74.000.888-5".
export function formatRutInput(value: string): string {
  const clean = value.toUpperCase().replace(/[^0-9K]/g, '');
  const digits = clean.replace(/K/g, '');
  const endsWithK = clean.endsWith('K') && digits.length >= 7;
  const chars = (endsWithK ? digits + 'K' : digits).slice(0, 9);
  if (chars.length < 2) return chars;
  const body = chars.slice(0, -1).replace(/\B(?=(\d{3})+$)/g, '.');
  return `${body}-${chars.slice(-1)}`;
}

// Formato con puntos y guion: 76.123.456-K. Devuelve el valor original si no es un RUT.
export function formatRut(value: string): string {
  const rut = parts(value);
  return rut ? `${rut.body.replace(/\B(?=(\d{3})+$)/g, '.')}-${rut.dv}` : value;
}
