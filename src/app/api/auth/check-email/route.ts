import { route, readBody } from '@/server/http';
import { checkEmail } from '@/server/services/auth';
import { EmailSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const body = await readBody(req, EmailSchema);
  return checkEmail(body.email);
});
