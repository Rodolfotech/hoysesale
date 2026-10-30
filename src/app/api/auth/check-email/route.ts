import { route, readBody } from '@/server/http';
import { sharedRateLimit, clientIp } from '@/server/rate-limit';
import { checkEmail } from '@/server/services/auth';
import { EmailSchema } from '@/server/validation';

export const POST = route(async (req) => {
  await sharedRateLimit(`check-email:${clientIp(req)}`, 60, 60_000);
  const body = await readBody(req, EmailSchema);
  return checkEmail(body.email);
});
