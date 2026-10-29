// Categorías y comodidades del micro-sitio (espejo de backend: src/common/constants/business.ts).
export const BUSINESS_CATEGORIES = [
  'Cervecería', 'Centro Cultural', 'Productora', 'Gastronomía', 'Bar', 'Café', 'Galería', 'Tienda', 'Otro',
] as const;

export const BUSINESS_AMENITIES = [
  'estacionamiento', 'pet-friendly', 'apto-ninos', 'opciones-veganas', 'opciones-celiacas', 'climatizacion', 'bajo-techo',
] as const;

export const AMENITY_LABELS: Record<string, string> = {
  estacionamiento: 'Estacionamiento',
  'pet-friendly': 'Pet-friendly',
  'apto-ninos': 'Apto para niños',
  'opciones-veganas': 'Opciones veganas',
  'opciones-celiacas': 'Opciones celíacas',
  climatizacion: 'Climatizado',
  'bajo-techo': 'Bajo techo',
};

// Días de la semana para los horarios del negocio (en orden).
export const BUSINESS_DAYS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'] as const;
