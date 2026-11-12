// Rubro o categoría de la empresa, agrupados para el select del perfil. Se guarda el nombre visible.
export const BUSINESS_CATEGORY_GROUPS = [
  { label: 'Gastronomía, Sabores y Vida Nocturna', options: ['Restaurantes y Bistrós', 'Cafeterías, Pastelerías y Salones de Té', 'Bares, Cervecerías y Pubs', 'Comida Rápida y Al Paso'] },
  { label: 'Tiendas, Productores y Comercio Minorista', options: ['Productores Locales y Emporios', 'Artesanías y Souvenirs', 'Moda, Calzado y Vestuario', 'Hogar, Decoración y Bazar', 'Tecnología y Telefonía', 'Mundo Animal (Pet Shops)'] },
  { label: 'Turismo, Experiencias y Tiempo Libre', options: ['Tours y Agencias Locales', 'Turismo Aventura y Alquiler', 'Alojamiento Turístico', 'Talleres y Experiencias Vivenciales'] },
  { label: 'Panoramas, Cultura y Espacios de Eventos', options: ['Centros Culturales y Galerías', 'Centros de Eventos, Quinchos y Salones', 'Recreación y Deporte', 'Espacios de Feria y Mercados'] },
  { label: 'Bienestar, Belleza y Cuidado Personal', options: ['Estética y Peluquería', 'Spas y Relajación', 'Salud y Suplementación Natural'] },
  { label: 'Servicios Profesionales y Técnicos de Barrio', options: ['Reparación y Servicio Técnico', 'Imprentas y Publicidad', 'Servicios Especializados (Inmobiliarias, Veterinaria, etc.)'] },
] as const;

export const BUSINESS_CATEGORIES = BUSINESS_CATEGORY_GROUPS.flatMap((group) => group.options);

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

// Las categorías anteriores (Cervecería, Café, etc.) ya no son válidas: hay que elegir una nueva.
export function isBusinessCategory(value: string | null | undefined): value is BusinessCategory {
  return (BUSINESS_CATEGORIES as readonly string[]).includes(value ?? '');
}

// Comodidades del micro-sitio (espejo de backend: src/common/constants/business.ts).

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
