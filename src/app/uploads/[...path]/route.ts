import { promises as fs } from 'fs';
import { extname, join, resolve, sep } from 'path';
import { localUploadRoot } from '@/server/storage/local';

// Solo en desarrollo (STORAGE_DRIVER=local): sirve los archivos de uploads/ en /uploads/...
// En producción las imágenes viven en Supabase Storage y esta ruta responde 404.
const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  if (process.env.STORAGE_DRIVER !== 'local') return new Response('Not found', { status: 404 });

  const { path } = await params;
  const root = localUploadRoot();
  const target = resolve(join(root, ...path));
  if (!target.startsWith(root + sep)) return new Response('Not found', { status: 404 });

  try {
    const file = await fs.readFile(target);
    return new Response(file, {
      headers: {
        'Content-Type': CONTENT_TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
