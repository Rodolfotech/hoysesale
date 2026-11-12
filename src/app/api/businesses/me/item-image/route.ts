import { route, readFile } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { uploadItemImage } from '@/server/services/businesses';

// Imagen de un producto o servicio (?type=services acepta también JPG y PNG). Devuelve la URL para guardarla en el elemento.
export const POST = route(async (req) => {
  const user = await requireUser(req);
  const type = new URL(req.url).searchParams.get('type') === 'services' ? 'services' : 'products';
  return uploadItemImage(user.id, await readFile(req), type);
});
