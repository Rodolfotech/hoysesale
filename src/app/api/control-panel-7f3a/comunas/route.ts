import { route } from '@/server/http';
import { requireAdmin } from '@/server/auth/session';
import { listComunas } from '@/server/services/admin';
import { clientIp } from '@/server/rate-limit';

export const GET = route(async (req) => {
  const admin = await requireAdmin(req);
  return listComunas(admin.id, clientIp(req));
});
