import { route, readFile } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { uploadItemImage } from '@/server/services/businesses';

// Imagen de un producto o servicio. Devuelve la URL para guardarla en el elemento.
export const POST = route(async (req) => {
  const user = await requireUser(req);
  return uploadItemImage(user.id, await readFile(req));
});
