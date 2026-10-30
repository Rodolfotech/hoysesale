import { route, notFound } from '@/server/http';
import { sessionUserId } from '@/server/auth/session';
import { getBusinessPageFor } from '@/server/services/businesses';

export const GET = route<{ slug: string }>(async (req, { params }) => {
  const { slug } = await params;
  const business = await getBusinessPageFor(slug, sessionUserId(req));
  if (!business) throw notFound('Negocio no encontrado');
  return business;
});
