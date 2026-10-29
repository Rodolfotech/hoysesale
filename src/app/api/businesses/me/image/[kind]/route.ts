import { route, readFile, badRequest } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { uploadBusinessImage } from '@/server/services/businesses';

export const POST = route<{ kind: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { kind } = await params;
  if (kind !== 'logo' && kind !== 'cover') throw badRequest('kind debe ser logo o cover');
  return uploadBusinessImage(user.id, kind, await readFile(req));
});
