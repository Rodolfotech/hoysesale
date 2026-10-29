import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { unregisterAttendee } from '@/server/services/attendees';

export const DELETE = route<{ eventId: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { eventId } = await params;
  return unregisterAttendee(user.id, eventId);
});
