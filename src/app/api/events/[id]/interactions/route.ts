import { route, readBody } from '@/server/http';
import { registerInteraction } from '@/server/services/events';
import { InteractionSchema } from '@/server/validation';

export const POST = route<{ id: string }>(async (req, { params }) => {
  const { id } = await params;
  const body = await readBody(req, InteractionSchema);
  await registerInteraction(id, body.type);
});
