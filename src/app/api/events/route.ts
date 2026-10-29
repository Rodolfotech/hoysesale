import { route, readBody, parseIntOr } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { createEvent, listEvents } from '@/server/services/events';
import { CreateEventSchema } from '@/server/validation';
import { AUDIENCES, type TimeSlot } from '@/server/events/filters';

export const GET = route(async (req) => {
  const p = req.nextUrl.searchParams;
  const timeSlot = p.get('timeSlot');
  const audience = p.get('audience');
  const indoor = p.get('indoor');
  return listEvents(p.get('city') ?? undefined, parseIntOr(p.get('page'), undefined), parseIntOr(p.get('limit'), undefined), {
    free: p.get('free') === 'true' ? true : undefined,
    audience: audience && (AUDIENCES as readonly string[]).includes(audience) ? audience : undefined,
    indoor: indoor === null ? undefined : indoor === 'true',
    timeSlot: timeSlot === 'tarde' || timeSlot === 'noche' ? (timeSlot as TimeSlot) : undefined,
  });
});

export const POST = route(async (req) => {
  const user = await requireUser(req);
  return createEvent(user.id, await readBody(req, CreateEventSchema));
});
