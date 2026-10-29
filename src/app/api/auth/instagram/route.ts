import { route, readBody } from '@/server/http';
import { withSession } from '@/server/auth/session';
import { instagramLogin } from '@/server/services/auth';
import { CodeSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const body = await readBody(req, CodeSchema);
  const result = await instagramLogin(body.code);
  return withSession(result, result.access_token);
});
