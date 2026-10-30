import { route, readBody } from '@/server/http';
import { sharedRateLimit, clientIp } from '@/server/rate-limit';
import { withSession } from '@/server/auth/session';
import { register } from '@/server/services/auth';
import { RegisterSchema } from '@/server/validation';

export const POST = route(async (req) => {
  await sharedRateLimit(`register:${clientIp(req)}`, 30, 60 * 60_000);
  const result = await register(await readBody(req, RegisterSchema));
  return withSession(result, result.access_token);
});
