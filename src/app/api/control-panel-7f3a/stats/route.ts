import { route } from '@/server/http';
import { requireAdmin } from '@/server/auth/session';
import { getStats } from '@/server/services/admin';
import { clientIp } from '@/server/rate-limit';

export const GET = route(async (req) => {
  const admin = await requireAdmin(req);
  return getStats(admin.id, clientIp(req));
});
