import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { createBusinessPage, deleteBusinessPage, updateOwnBusiness } from '@/server/services/businesses';
import { BusinessPageSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  return createBusinessPage(user.id, await readBody(req, BusinessPageSchema));
});

export const PUT = route(async (req) => {
  const user = await requireUser(req);
  return updateOwnBusiness(user.id, await readBody(req, BusinessPageSchema));
});

// Elimina la página del negocio (no el perfil ni la cuenta).
export const DELETE = route(async (req) => {
  const user = await requireUser(req);
  await deleteBusinessPage(user.id);
  return new Response(null, { status: 204 });
});
