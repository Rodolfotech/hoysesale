import { route, readBody } from '@/server/http';
import { sharedRateLimit, clientIp } from '@/server/rate-limit';
import { withSession } from '@/server/auth/session';
import { resetPasswordWithToken } from '@/server/services/auth';
import { ResetPasswordSchema } from '@/server/validation';

export const POST = route(async (req) => {
  await sharedRateLimit(`reset:${clientIp(req)}`, 30, 15 * 60_000);
  const body = await readBody(req, ResetPasswordSchema);
  const result = await resetPasswordWithToken(body.token, body.password);
  return withSession(result, result.access_token);
});
