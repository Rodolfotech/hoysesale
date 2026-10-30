import { route, readBody } from '@/server/http';
import { sharedRateLimit, clientIp } from '@/server/rate-limit';
import { forgotPassword } from '@/server/services/auth';
import { EmailSchema } from '@/server/validation';

export const POST = route(async (req) => {
  await sharedRateLimit(`forgot:ip:${clientIp(req)}`, 30, 15 * 60_000);
  const body = await readBody(req, EmailSchema);
  await sharedRateLimit(`forgot:email:${body.email.trim().toLowerCase()}`, 5, 60 * 60_000);
  return forgotPassword(body.email);
});
