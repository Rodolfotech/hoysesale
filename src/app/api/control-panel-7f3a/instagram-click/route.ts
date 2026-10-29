import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { trackInstagramClick } from '@/server/services/admin';
import { z } from 'zod';

const ClickSchema = z.object({ eventId: z.string().nullish() });

export const POST = route(async (req) => {
  const user = await requireUser(req);
  const body = await readBody(req, ClickSchema);
  return trackInstagramClick(user.id, body.eventId ?? undefined);
});
