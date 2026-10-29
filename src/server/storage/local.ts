import { promises as fs } from 'fs';
import { dirname, join, resolve, sep } from 'path';
import type { MediaStorage } from './index';

// Solo desarrollo: guarda en uploads/ del proyecto y la ruta /uploads/[...path] la sirve.
const root = resolve(process.cwd(), 'uploads');

// Evita salir de uploads/ con rutas tipo ../
function safePath(path: string): string {
  const target = resolve(join(root, path));
  if (!target.startsWith(root + sep)) throw new Error('Ruta de archivo inválida');
  return target;
}

export const localMediaStorage: MediaStorage = {
  async upload(path, buffer) {
    const target = safePath(path);
    await fs.mkdir(dirname(target), { recursive: true });
    await fs.writeFile(target, buffer, { flag: 'wx' });
    const base = process.env.PUBLIC_BASE_URL ?? 'http://localhost:5173';
    return `${base}/uploads/${path}`;
  },

  async remove(path) {
    try {
      await fs.unlink(safePath(path));
    } catch (e) {
      console.warn(`No se pudo borrar ${path}: ${(e as Error).message}`);
    }
  },

  async removePrefix(prefix) {
    try {
      await fs.rm(safePath(prefix), { recursive: true, force: true });
    } catch (e) {
      console.warn(`No se pudo borrar la carpeta ${prefix}: ${(e as Error).message}`);
    }
  },
};

export function localUploadRoot(): string {
  return root;
}
