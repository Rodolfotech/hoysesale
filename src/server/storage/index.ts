import { localMediaStorage } from './local';
import { supabaseMediaStorage } from './supabase';

// Puerto de almacenamiento de imágenes. STORAGE_DRIVER=local usa uploads/ (solo desarrollo); cualquier otro valor usa Supabase.
export interface MediaStorage {
  /** Guarda el archivo y devuelve su URL pública. */
  upload(path: string, buffer: Buffer, contentType: string): Promise<string>;
  /** Borra el archivo. Best-effort: no debe lanzar si ya no existe. */
  remove(path: string): Promise<void>;
  /** Borra todo lo que esté bajo una carpeta (todas las imágenes de una cuenta). Best-effort. */
  removePrefix(prefix: string): Promise<void>;
}

export function getMediaStorage(): MediaStorage {
  return process.env.STORAGE_DRIVER === 'local' ? localMediaStorage : supabaseMediaStorage;
}

// Límites de imagen: Vercel limita el cuerpo de una petición a 4,5 MB.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
