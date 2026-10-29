// Formato de precios en pesos chilenos.
export function formatCLP(value: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(value);
}

// Enlace de WhatsApp con mensaje predeterminado.
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}

export const TAG_LABELS: Record<string, string> = {
  MAS_VENDIDO: 'Más vendido',
  DEL_DIA: 'Del día',
  REGALO: 'Regalo',
  NUEVO: 'Nuevo',
};
