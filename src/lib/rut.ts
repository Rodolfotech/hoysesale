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

// Formato con puntos y guion: 76.123.456-K. Devuelve el valor original si no es un RUT.
export function formatRut(value: string): string {
  const rut = parts(value);
  return rut ? `${rut.body.replace(/\B(?=(\d{3})+$)/g, '.')}-${rut.dv}` : value;
}
