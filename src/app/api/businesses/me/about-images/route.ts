import { route, readBody, readFile, badRequest } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { addAboutImage, removeAboutImage, reorderAboutImages } from '@/server/services/businesses';
import { AboutImagesOrderSchema } from '@/server/validation';

// Fotos de "Nosotros": POST sube una, PUT cambia el orden, DELETE ?url=... quita una.
export const POST = route(async (req) => {
  const user = await requireUser(req);
  return addAboutImage(user.id, await readFile(req));
});

export const PUT = route(async (req) => {
  const user = await requireUser(req);
  const { images } = await readBody(req, AboutImagesOrderSchema);
  return reorderAboutImages(user.id, images);
});

export const DELETE = route(async (req) => {
  const user = await requireUser(req);
  const url = req.nextUrl.searchParams.get('url');
  if (!url) throw badRequest('Falta la imagen a quitar');
  return removeAboutImage(user.id, url);
});
