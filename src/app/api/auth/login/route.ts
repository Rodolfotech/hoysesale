import { route, readBody } from '@/server/http';
import { rateLimit, clientIp } from '@/server/rate-limit';
import { withSession } from '@/server/auth/session';
import { login } from '@/server/services/auth';
import { LoginSchema } from '@/server/validation';

// Límite de 5 intentos por minuto y IP, como el @Throttle del backend anterior.
export const POST = route(async (req) => {
  rateLimit(`login:${clientIp(req)}`, 5, 60_000);
  const body = await readBody(req, LoginSchema);
  const result = await login(body.email, body.password);
  return withSession(result, result.access_token);
});
