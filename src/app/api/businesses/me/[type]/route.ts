import { route, readBody, badRequest } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { addBusinessItem, isBusinessItemType } from '@/server/services/businesses';
import { BusinessItemSchema } from '@/server/validation';

export const POST = route<{ type: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { type } = await params;
  if (!isBusinessItemType(type)) throw badRequest('Tipo de contenido no válido');
  return addBusinessItem(user.id, type, await readBody(req, BusinessItemSchema));
});
