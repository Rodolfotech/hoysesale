import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import BusinessPage from '@/views/BusinessPage';
import CategoryEvents from '@/views/CategoryEvents';
import { SITE_URL } from '@/lib/business';
import { ACCESS_COOKIE, userIdFromToken } from '@/server/auth/session';
import { getBusinessPage, getBusinessPageFor } from '@/server/services/businesses';

// /<slug>: si es un negocio, su micro-sitio indexable; si no, la página de categoría.
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  // Si el backend falla, la página de error se encarga; aquí solo se usa el título por defecto.
  const business = await getBusinessPage(slug).catch(() => null);
  if (!business) return { title: 'HoySeSale.cl' };
  const description =
    business.businessDescription?.slice(0, 155) ||
    `${business.name} en ${business.comuna ?? 'La Araucanía'}: eventos, horarios y cómo llegar.`;
  const image = business.coverUrl || business.logoUrl || undefined;
  return {
    title: business.slug,
    description,
    alternates: { canonical: `${SITE_URL}/${business.slug}` },
    openGraph: { title: business.name, description, url: `${SITE_URL}/${business.slug}`, images: image ? [image] : [] },
  };
}

export default async function Route({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const viewerId = userIdFromToken((await cookies()).get(ACCESS_COOKIE)?.value);
  const business = await getBusinessPageFor(slug, viewerId);
  if (business) return <BusinessPage business={business} />;
  return <CategoryEvents />;
}
