import { route, readBody } from '@/server/http';
import { withSession } from '@/server/auth/session';
import { register } from '@/server/services/auth';
import { RegisterSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const result = await register(await readBody(req, RegisterSchema));
  return withSession(result, result.access_token);
});
