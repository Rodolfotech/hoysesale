import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { disconnect } from '@/server/services/social';

export const DELETE = route<{ platform: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { platform } = await params;
  return disconnect(user.id, platform);
});
