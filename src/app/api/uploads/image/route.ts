import { route, readFile } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { uploadTempImage } from '@/server/services/media';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  return uploadTempImage(user.id, await readFile(req));
});
