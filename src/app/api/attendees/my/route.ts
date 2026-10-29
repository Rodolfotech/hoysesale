import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { attendeeEventsOfUser } from '@/server/services/attendees';

export const GET = route(async (req) => attendeeEventsOfUser((await requireUser(req)).id));
