import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { instagramCallback } from '@/server/services/social';
import { CodeSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readBody(req, CodeSchema);
  return instagramCallback(user.id, body.code);
});
