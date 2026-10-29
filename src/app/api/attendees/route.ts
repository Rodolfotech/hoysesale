import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { registerAttendee } from '@/server/services/attendees';
import { AttendeeSchema } from '@/server/validation';

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readBody(req, AttendeeSchema);
  return registerAttendee(user.id, body.eventId);
});
