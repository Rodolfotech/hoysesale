import { route, readBody } from '@/server/http';
import { forgotPassword } from '@/server/services/auth';
import { EmailSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const body = await readBody(req, EmailSchema);
  return forgotPassword(body.email);
});
