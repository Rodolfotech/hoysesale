import { route, readBody } from '@/server/http';
import { withSession } from '@/server/auth/session';
import { googleLogin } from '@/server/services/auth';
import { CodeSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const body = await readBody(req, CodeSchema);
  const result = await googleLogin(body.code);
  return withSession(result, result.access_token);
});
