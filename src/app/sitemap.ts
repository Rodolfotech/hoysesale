import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/business';
import { listBusinessSlugs } from '@/server/services/businesses';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const businesses = await listBusinessSlugs();
  return [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/comunas`, changeFrequency: 'weekly', priority: 0.6 },
    ...businesses.map((b) => ({
      url: `${SITE_URL}/${b.slug}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ];
}
