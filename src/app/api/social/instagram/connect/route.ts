import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { connectInstagram } from '@/server/services/social';
import { ConnectSocialSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readBody(req, ConnectSocialSchema);
  return connectInstagram(user.id, body.accessToken);
});
