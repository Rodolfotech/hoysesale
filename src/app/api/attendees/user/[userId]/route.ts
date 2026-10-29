import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { attendeeEventsOfUser } from '@/server/services/attendees';

export const GET = route<{ userId: string }>(async (req, { params }) => {
  await requireUser(req);
  const { userId } = await params;
  return attendeeEventsOfUser(userId);
});
