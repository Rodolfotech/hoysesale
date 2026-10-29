import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { deleteEvent, findEventBySlug, updateEvent } from '@/server/services/events';
import { UpdateEventSchema } from '@/server/validation';

// El segmento es el slug en GET y el id en PUT/DELETE (así lo hacía el backend anterior).
export const GET = route<{ id: string }>(async (_req, { params }) => {
  const { id } = await params;
  return findEventBySlug(id);
});

export const PUT = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { id } = await params;
  return updateEvent(id, await readBody(req, UpdateEventSchema), user);
});

export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { id } = await params;
  await deleteEvent(id, user);
});
