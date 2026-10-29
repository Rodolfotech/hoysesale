import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { deleteAccount } from '@/server/services/users';

export const DELETE = route(async (req) => {
  const user = await requireUser(req);
  await deleteAccount(user.id);
  return new Response(null, { status: 204 });
});
