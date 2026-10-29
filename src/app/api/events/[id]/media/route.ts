import { route } from '@/server/http';
import { listEventMedia } from '@/server/services/media';

export const GET = route<{ id: string }>(async (_req, { params }) => {
  const { id } = await params;
  return listEventMedia(id);
});
