import { route } from '@/server/http';
import { requireAdmin } from '@/server/auth/session';
import { findAllUsers } from '@/server/services/users';

export const GET = route(async (req) => {
  await requireAdmin(req);
  return findAllUsers();
});
