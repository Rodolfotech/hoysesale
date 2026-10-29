// Límites de imagen compartidos por el servidor y el formulario.
// Vercel limita el cuerpo de una petición a 4,5 MB; las imágenes llegan hasta 4 MB.
// El logo del negocio tiene un máximo propio de 10 KB.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const LOGO_MAX_BYTES = 10 * 1024;

// Logo y portada solo se aceptan en WEBP.
export const WEBP_TYPES = ['image/webp'];

// La portada tiene medida exacta y un peso máximo propio.
export const COVER_MAX_BYTES = 90 * 1024;
export const COVER_SIZE = { width: 1200, height: 400 };
