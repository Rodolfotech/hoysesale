import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { createBusinessPage, updateOwnBusiness } from '@/server/services/businesses';
import { BusinessPageSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  return createBusinessPage(user.id, await readBody(req, BusinessPageSchema));
});

export const PUT = route(async (req) => {
  const user = await requireUser(req);
  return updateOwnBusiness(user.id, await readBody(req, BusinessPageSchema));
});
