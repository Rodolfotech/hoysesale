// Micro-sitio público de un negocio. Componente de servidor (HTML indexable). Las partes interactivas son componentes de cliente.
import { whatsappLink } from '@/features/business/format';
import { hoursText } from '@/lib/hours';
import { BusinessOwnerBar } from '@/features/business/BusinessOwnerBar';
import { ProductsSection } from '@/features/business/ProductsSection';
import { EventsCountdown } from '@/features/business/EventsCountdown';
import { ReviewsSection } from '@/features/business/ReviewsSection';
import { BottomBar } from '@/features/business/BottomBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { SectionTabs } from '@/components/ui/SectionTabs';
import { Stat } from '@/components/ui/Stat';
import { AMENITY_LABELS, BUSINESS_AMENITIES, BUSINESS_DAYS } from '@/constants/business';
import { SITE_URL, type Business } from '@/lib/business';

export default function BusinessPage({ business }: { business: Business }) {
  const pageUrl = `${SITE_URL}/${business.slug}`;
  const address = [business.companyAddress, business.comuna].filter(Boolean).join(', ');
  const mapHref =
    business.mapUrl ||
    (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}` : null);
  const reservationsPhone = business.whatsappReservations || business.companyPhone;
  const contactHref = reservationsPhone ? whatsappLink(reservationsPhone, 'Hola, los contacto desde HoySeSale') : null;
  const instagram = business.companyInstagram
    ? business.companyInstagram.startsWith('http')
      ? business.companyInstagram
      : `https://instagram.com/${business.companyInstagram.replace(/^@/, '')}`
    : null;
  const paragraphs = (business.businessDescription ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const amenities = BUSINESS_AMENITIES.filter((a) => business.amenities?.includes(a));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    url: pageUrl,
    image: business.coverUrl || business.logoUrl || undefined,
    description: business.businessDescription || undefined,
    address: business.companyAddress
      ? { '@type': 'PostalAddress', streetAddress: business.companyAddress, addressLocality: business.comuna ?? undefined, addressRegion: 'La Araucanía', addressCountry: 'CL' }
      : undefined,
    telephone: business.companyPhone || undefined,
    aggregateRating: business.stats.rating !== null
      ? { '@type': 'AggregateRating', ratingValue: business.stats.rating, reviewCount: business.stats.reviewCount }
      : undefined,
    sameAs: [instagram, business.website].filter(Boolean) as string[],
  };

  const ownerInitial = {
    slug: business.slug,
    name: business.name,
    comuna: business.comuna,
    category: business.category,
    companyAddress: business.companyAddress,
    companyPhone: business.companyPhone,
    companyInstagram: business.companyInstagram,
    website: business.website,
    whatsappReservations: business.whatsappReservations,
    mapUrl: business.mapUrl,
    businessDescription: business.businessDescription,
    amenities: business.amenities,
    hours: business.hours,
    logoUrl: business.logoUrl,
    coverUrl: business.coverUrl,
  };

  const panels = [
    {
      id: 'productos',
      label: 'Productos',
      content: (
            <section aria-labelledby="productos-titulo">
          <ProductsSection products={business.products} businessName={business.name} whatsapp={reservationsPhone} />
            </section>      ),
    },
    {
      id: 'servicios',
      label: 'Servicios',
      content: (
            <section aria-labelledby="servicios-titulo">
          <h2 id="servicios-titulo" className="text-2xl font-semibold mb-5">Servicios</h2>
          {business.services.length === 0 ? (
            <EmptyState>Aún no hay servicios publicados.</EmptyState>
          ) : (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {business.services.map((s, i) => {
                const featured = i === 0;
                return (
                  <Card as="li" key={s.id} tone={featured ? 'accent' : 'default'} padding="sm" className="p-5 flex gap-4 items-start">
                    <span
                      aria-hidden="true"
                      className={`w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-lg ${featured ? 'bg-white/20' : 'bg-brand-neutral-2 text-brand-blue'}`}
                    >
                      ✦
                    </span>
                    <div>
                      <p className="font-semibold">{s.title}</p>
                      {s.description && <p className={`text-sm mt-1 ${featured ? 'opacity-85' : 'text-brand-dark/60'}`}>{s.description}</p>}
                    </div>
                  </Card>
                );
              })}
            </ul>
          )}
            </section>      ),
    },
    {
      id: 'eventos',
      label: 'Eventos',
      content: (
            <section aria-labelledby="eventos-titulo">
          <h2 id="eventos-titulo" className="text-2xl font-semibold mb-5">Próximos eventos</h2>
          <EventsCountdown events={business.events} businessName={business.name} whatsapp={reservationsPhone} />
            </section>      ),
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      content: (
            <section aria-labelledby="nosotros-titulo">
          <h2 id="nosotros-titulo" className="text-2xl font-semibold mb-5">Nosotros</h2>
          <Card className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="text-base leading-relaxed">{p}</p>
            ))}
            {amenities.length > 0 && (
              <ul className="flex flex-wrap gap-2 pt-2" aria-label="Comodidades">
                {amenities.map((a) => (
                  <li key={a}><Badge tone="brand">{AMENITY_LABELS[a] ?? a}</Badge></li>
                ))}
              </ul>
            )}
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
            {business.hours && Object.keys(business.hours).length > 0 && (
              <Card padding="sm" className="p-5">
                <h3 className="font-semibold mb-3">Horarios</h3>
                <ul className="space-y-1.5">
                  {BUSINESS_DAYS.map((d) => (
                    <li key={d} className="flex justify-between gap-4">
                      <span className="capitalize text-brand-dark/60">{d}</span>
                      <span>{hoursText(business.hours?.[d], d)}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            )}
            <Card padding="sm" className="p-5 space-y-2">
              <h3 className="font-semibold mb-3">Contacto</h3>
              {business.companyAddress && <p>{business.companyAddress}{business.comuna ? `, ${business.comuna}` : ''}</p>}
              {business.companyPhone && <p>{business.companyPhone}</p>}
              {instagram && <p><a href={instagram} target="_blank" rel="noopener noreferrer" className="underline text-brand-blue">Instagram</a></p>}
              {business.website && <p><a href={business.website} target="_blank" rel="noopener noreferrer" className="underline text-brand-blue">Sitio web</a></p>}
            </Card>
          </div>
            </section>      ),
    },
    {
      id: 'resenas',
      label: 'Reseñas',
      content: (
            <section aria-labelledby="resenas-titulo">
          <h2 id="resenas-titulo" className="text-2xl font-semibold mb-5">Reseñas</h2>
          <ReviewsSection slug={business.slug} reviews={business.reviews} rating={business.stats.rating} reviewCount={business.stats.reviewCount} />
            </section>      ),
    },
  ];

  return (
    <main className="w-full pb-32 bg-brand-neutral-1 text-brand-dark">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabecera a sangre: portada con degradado, nombre y estadísticas */}
      <section className="relative w-full min-h-[280px] md:min-h-[340px] flex items-end overflow-hidden bg-brand-dark">
        {business.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverUrl} alt={`Portada de ${business.name}`} className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
        <div className="relative w-full max-w-5xl mx-auto px-4 pb-6 text-white">
          <div className="flex items-center gap-3">
            {business.logoUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={business.logoUrl} alt={`Logo de ${business.name}`} className="w-12 h-12 rounded-full object-cover bg-white border-2 border-white" />
            )}
            <h1 className="text-3xl md:text-4xl font-semibold">{business.name}</h1>
          </div>
          <p className="mt-2 text-sm md:text-base opacity-90 line-clamp-2">
            {paragraphs[0] ?? [business.category, business.comuna].filter(Boolean).join(' · ')}
          </p>
          <dl className="mt-4 flex gap-8">
            <Stat tone="dark" label="Valoración" value={business.stats.rating !== null ? `★ ${business.stats.rating}` : '—'} />
            <Stat tone="dark" label="Reseñas" value={business.stats.reviewCount} />
            <Stat tone="dark" label="Años" value={business.stats.years} />
          </dl>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4">
        <div className="flex justify-end mt-4">
          <BusinessOwnerBar
            slug={business.slug}
            pageUrl={pageUrl}
            initial={ownerInitial}
            content={{ products: business.products, services: business.services, highlights: business.highlights }}
          />
        </div>

        {/* Destacados: círculos con anillo de color */}
        {business.highlights.length > 0 && (
          <section className="mt-6" aria-labelledby="destacados-titulo">
            <h2 id="destacados-titulo" className="sr-only">Destacados</h2>
            <ul className="flex gap-5 overflow-x-auto pb-2">
              {business.highlights.map((h) => (
                <li key={h.id} className="flex flex-col items-center gap-2 shrink-0">
                  <div className="w-[76px] h-[76px] rounded-full p-[3px] bg-gradient-to-br from-amber-400 to-orange-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={h.imageUrl} alt={h.title} className="w-full h-full rounded-full object-cover border-2 border-brand-neutral-1" />
                  </div>
                  <span className="text-xs font-medium">{h.title}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <SectionTabs panels={panels} />

      <footer className="mt-16 pt-6 text-center text-xs text-brand-dark/60 border-t border-brand-neutral-2 px-4">
        Perfil administrado en HoySeSale.cl
      </footer>

      <BottomBar mapHref={mapHref} contactHref={contactHref} />
    </main>
  );
}
