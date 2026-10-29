import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { syncFeed } from '@/server/services/social';

export const POST = route<{ eventId: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { eventId } = await params;
  return syncFeed(user.id, eventId);
});
