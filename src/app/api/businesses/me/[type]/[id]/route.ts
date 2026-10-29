import { route, readBody, badRequest } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { deleteBusinessItem, isBusinessItemType, updateBusinessItem } from '@/server/services/businesses';
import { BusinessItemSchema } from '@/server/validation';

export const PUT = route<{ type: string; id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { type, id } = await params;
  if (!isBusinessItemType(type)) throw badRequest('Tipo de contenido no válido');
  return updateBusinessItem(user.id, type, id, await readBody(req, BusinessItemSchema));
});

export const DELETE = route<{ type: string; id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { type, id } = await params;
  if (!isBusinessItemType(type)) throw badRequest('Tipo de contenido no válido');
  await deleteBusinessItem(user.id, type, id);
});
