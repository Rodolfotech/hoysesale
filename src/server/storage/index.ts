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

export { MAX_IMAGE_BYTES, LOGO_MAX_BYTES } from '@/lib/media-limits';

export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
