import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { addMediaLink } from '@/server/services/media';
import { LinkMediaSchema } from '@/server/validation';

export const POST = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { id } = await params;
  return addMediaLink(id, user, await readBody(req, LinkMediaSchema));
});
