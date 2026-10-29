import { route, readFile } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { uploadEventImage } from '@/server/services/media';

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { id } = await params;
  return uploadEventImage(id, user, await readFile(req));
});
