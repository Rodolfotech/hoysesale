import { route } from '@/server/http';
import { requireAdmin } from '@/server/auth/session';
import { listUsers } from '@/server/services/admin';
import { clientIp } from '@/server/rate-limit';

// Prefijo del panel de administración: ver src/constants/admin.ts en el frontend (ADMIN_API_PREFIX).
export const GET = route(async (req) => {
  const admin = await requireAdmin(req);
  const comuna = req.nextUrl.searchParams.get('comuna') ?? undefined;
  return listUsers(admin.id, comuna, clientIp(req));
});
