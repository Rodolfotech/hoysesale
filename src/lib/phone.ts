// Teléfono para mostrar: +56933331333 → "+569 3333 1333". Sin 'use client': lo usa la página del negocio (servidor).
// Si no tiene el formato de móvil chileno, se muestra tal como está guardado.
export function formatPhone(stored: string | null | undefined): string {
  const value = stored ?? '';
  const match = value.match(/^\+569(\d{4})(\d{4})$/);
  return match ? `+569 ${match[1]} ${match[2]}` : value;
}
