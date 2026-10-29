import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { removeMedia } from '@/server/services/media';

export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { id } = await params;
  await removeMedia(id, user);
});
