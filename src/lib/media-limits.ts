// Límites de imagen compartidos por el servidor y el formulario.
// Vercel limita el cuerpo de una petición a 4,5 MB; las imágenes llegan hasta 4 MB.
// El logo del negocio tiene un máximo propio de 10 KB.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const LOGO_MAX_BYTES = 10 * 1024;

// Formatos de logo y su extensión. SVG queda fuera porque puede llevar código.
export const LOGO_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

// Formatos de portada y su extensión. Las extensiones .jpg y .jpeg son el mismo tipo.
export const COVER_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/webp': 'webp',
};

// Las imágenes de productos y servicios solo se aceptan en WEBP.
export const WEBP_TYPES = ['image/webp'];

// La portada tiene medida exacta y un peso máximo propio.
export const COVER_MAX_BYTES = 90 * 1024;
export const COVER_SIZE = { width: 1200, height: 400 };

// Imágenes de productos y servicios: solo WEBP.
export const ITEM_IMAGE_MAX_BYTES = 2 * 1024 * 1024;

// Fotos del negocio para "Nosotros".
export const ABOUT_MAX_IMAGES = 3;
