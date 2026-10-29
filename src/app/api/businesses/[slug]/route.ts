import { route, notFound } from '@/server/http';
import { getPublicBusiness } from '@/server/services/businesses';

export const GET = route<{ slug: string }>(async (_req, { params }) => {
  const { slug } = await params;
  const business = await getPublicBusiness(slug);
  if (!business) throw notFound('Negocio no encontrado');
  return business;
});
