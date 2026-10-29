import { route } from '@/server/http';
import { getSessionUser } from '@/server/auth/session';
import { checkBusinessSlug } from '@/server/services/businesses';

// Revisa si una URL de negocio está libre mientras el usuario escribe. Con sesión, su propia URL cuenta como libre.
export const GET = route(async (req) => {
  const slug = req.nextUrl.searchParams.get('slug') ?? '';
  const user = await getSessionUser(req);
  return checkBusinessSlug(slug, user?.id);
});
