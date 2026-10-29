import { route } from '@/server/http';
import { attendeesOfEvent } from '@/server/services/attendees';

export const GET = route<{ eventId: string }>(async (_req, { params }) => {
  const { eventId } = await params;
  return attendeesOfEvent(eventId);
});
