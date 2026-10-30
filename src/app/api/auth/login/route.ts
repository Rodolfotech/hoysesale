import { route, readBody } from '@/server/http';
import { sharedRateLimit, clientIp } from '@/server/rate-limit';
import { withSession } from '@/server/auth/session';
import { login } from '@/server/services/auth';
import { LoginSchema } from '@/server/validation';

// Muchas personas comparten IP (operadores móviles, oficinas): el límite estricto es por IP y correo,
// para que el error de uno no bloquee a los demás. Los otros dos frenan ataques a gran escala.
export const POST = route(async (req) => {
  const ip = clientIp(req);
  await sharedRateLimit(`login:ip:${ip}`, 60, 60_000);
  const body = await readBody(req, LoginSchema);
  const email = body.email.trim().toLowerCase();
  await sharedRateLimit(`login:pair:${ip}:${email}`, 5, 60_000);
  await sharedRateLimit(`login:email:${email}`, 30, 15 * 60_000);
  const result = await login(body.email, body.password);
  return withSession(result, result.access_token);
});
