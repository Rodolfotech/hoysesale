import { requireUser } from '@/server/auth/session';
import { route } from '@/server/http';
import { attendeesOfEvent } from '@/server/services/attendees';

export const GET = route<{ eventId: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { eventId } = await params;
  return attendeesOfEvent(user, eventId);
});
