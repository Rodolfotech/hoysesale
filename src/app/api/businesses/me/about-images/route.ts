import { route, readFile, badRequest } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { addAboutImage, removeAboutImage } from '@/server/services/businesses';

// Fotos de "Nosotros": POST sube una, DELETE ?url=... quita una.
export const POST = route(async (req) => {
  const user = await requireUser(req);
  return addAboutImage(user.id, await readFile(req));
});

export const DELETE = route(async (req) => {
  const user = await requireUser(req);
  const url = req.nextUrl.searchParams.get('url');
  if (!url) throw badRequest('Falta la imagen a quitar');
  return removeAboutImage(user.id, url);
});
