import { route } from '@/server/http';
import { requireAdmin } from '@/server/auth/session';
import { deleteUserAsAdmin, getUserDetail } from '@/server/services/admin';
import { clientIp } from '@/server/rate-limit';

export const GET = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req);
  const { id } = await params;
  return getUserDetail(admin.id, id, clientIp(req));
});

export const DELETE = route<{ id: string }>(async (req, { params }) => {
  const admin = await requireAdmin(req);
  const { id } = await params;
  await deleteUserAsAdmin(admin.id, id, clientIp(req));
  return new Response(null, { status: 204 });
});
