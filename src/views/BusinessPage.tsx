// Micro-sitio público de un negocio. Componente de servidor (HTML indexable). Las partes interactivas son componentes de cliente.
import type { ComponentProps } from 'react';
import { whatsappLink } from '@/features/business/format';
import { AboutImagesEdit } from '@/features/business/AboutImagesEdit';
import { BusinessContactEdit } from '@/features/business/BusinessContactEdit';
import { BusinessDescriptionEdit } from '@/features/business/BusinessDescriptionEdit';
import { BusinessHoursCard } from '@/features/business/BusinessHoursCard';
import { BusinessHoursEdit } from '@/features/business/BusinessHoursEdit';
import { BusinessImageEdit } from '@/features/business/BusinessImageEdit';
import { BusinessTabs } from '@/features/business/BusinessTabs';
import { ContactVisibility } from '@/features/business/ContactVisibility';
import { TabVisibilitySwitch } from '@/features/business/TabVisibilitySwitch';
import { OfferItemAdd } from '@/features/business/OfferItemAdd';
import { BusinessOwnerBar } from '@/features/business/BusinessOwnerBar';
import { ImageCarousel } from '@/components/ui/ImageCarousel';
import { AmenityList } from '@/features/business/AmenityList';
import { ProductsSection } from '@/features/business/ProductsSection';
import { ServicesSection } from '@/features/business/ServicesSection';
import { EventsCountdown } from '@/features/business/EventsCountdown';
import { ReviewsSection } from '@/features/business/ReviewsSection';
import { BottomBar } from '@/features/business/BottomBar';
import { Card } from '@/components/ui/Card';
import { Stat } from '@/components/ui/Stat';
import { BUSINESS_AMENITIES } from '@/constants/business';
import { ADDRESS_LABELS, DEFAULT_INSTAGRAM_LABEL, DEFAULT_PHONE_LABEL, DEFAULT_WEBSITE_LABEL, SITE_URL, type Business } from '@/lib/business';

// Interruptor bajo el título de una pestaña. Sin 'use client': el interruptor solo aparece para el dueño.
function TabToolbar(props: ComponentProps<typeof TabVisibilitySwitch>) {
  return <div className="mb-5 empty:hidden"><TabVisibilitySwitch {...props} /></div>;
}

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
  const statTone = business.coverUrl ? 'light' : 'dark';
  // Lo que se ve en el enlace: el último tramo de la URL, sin parámetros.
  const instagramHandle = instagram ? `@${instagram.split('?')[0].replace(/\/+$/, '').split('/').pop()}` : null;
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
    companyPhone: business.companyPhone,
    website: business.website,
    whatsappReservations: business.whatsappReservations,
    mapUrl: business.mapUrl,
  };

  const contactCard = (
    <Card padding="sm" className="p-5 text-sm flow-root">
      <BusinessContactEdit
        slug={business.slug}
        contact={{ address: business.companyAddress, addressLabel: business.addressLabel, phone: business.companyPhone, phoneLabel: business.phoneLabel, instagram: business.companyInstagram, instagramLabel: business.instagramLabel, website: business.website, websiteLabel: business.websiteLabel }}
        className="float-right ml-3 mb-1"
      />
      <div className="space-y-2">
        {business.companyAddress && <p><span className="font-semibold">{business.addressLabel ?? ADDRESS_LABELS[0]}:</span> {business.companyAddress}{business.comuna ? `, ${business.comuna}` : ''}</p>}
        {business.companyPhone && <p><span className="font-semibold">{business.phoneLabel ?? DEFAULT_PHONE_LABEL}:</span> {business.companyPhone}</p>}
        {instagram && <p><span className="font-semibold">{business.instagramLabel ?? DEFAULT_INSTAGRAM_LABEL}:</span> <a href={instagram} target="_blank" rel="noopener noreferrer" className="underline text-brand-blue">{instagramHandle}</a></p>}
        {business.website && <p><span className="font-semibold">{business.websiteLabel ?? DEFAULT_WEBSITE_LABEL}:</span> <a href={business.website} target="_blank" rel="noopener noreferrer" className="underline text-brand-blue">{business.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></p>}
      </div>
    </Card>
  );

  const panels = [
    {
      id: 'productos',
      label: 'Productos',
      content: (
            <section aria-labelledby="productos-titulo">
          <ProductsSection slug={business.slug} toolbar={<><TabVisibilitySwitch tab="productos" name="Productos" /><OfferItemAdd slug={business.slug} type="products" amenities={business.amenities ?? []} /></>} products={business.products} businessName={business.name} whatsapp={reservationsPhone} />
            </section>      ),
    },
    {
      id: 'servicios',
      label: 'Servicios',
      content: (
          <ServicesSection slug={business.slug} toolbar={<><TabVisibilitySwitch tab="servicios" name="Servicios" /><OfferItemAdd slug={business.slug} type="services" amenities={business.amenities ?? []} /></>} services={business.services} businessName={business.name} whatsapp={reservationsPhone} />
      ),
    },
    {
      id: 'contactanos',
      label: 'Contáctanos',
      content: (
            <section aria-labelledby="contactanos-titulo">
          <h2 id="contactanos-titulo" className="text-2xl font-semibold mb-5">Contáctanos</h2>
          <ContactVisibility inAllTabs={business.contactInAllTabs} />
          {contactCard}
            </section>      ),
    },
    {
      id: 'eventos',
      label: 'Eventos',
      content: (
            <section aria-labelledby="eventos-titulo">
          <h2 id="eventos-titulo" className="text-2xl font-semibold mb-5">Próximos eventos</h2>
          <TabToolbar tab="eventos" name="Eventos" />
          <EventsCountdown slug={business.slug} events={business.events} businessName={business.name} whatsapp={reservationsPhone} />
            </section>      ),
    },
    {
      id: 'horario',
      label: 'Horario',
      content: (
            <section aria-labelledby="horario-titulo">
          <h2 id="horario-titulo" className="text-2xl font-semibold mb-5">Horario</h2>
          <TabToolbar tab="horario" name="Horario" />
          <div className="text-sm">
            <BusinessHoursCard hours={business.hours} action={<BusinessHoursEdit slug={business.slug} hours={business.hours} />} />
          </div>
            </section>      ),
    },
    {
      id: 'nosotros',
      label: 'Nosotros',
      content: (
            <section aria-labelledby="nosotros-titulo">
          <h2 id="nosotros-titulo" className="text-2xl font-semibold mb-5">Nosotros</h2>
          <div className="relative mb-6">
            <ImageCarousel images={business.aboutImages ?? []} alt={`Fotos de ${business.name}`} aspectClass="aspect-[5/3] md:aspect-[25/9]" />
            <AboutImagesEdit slug={business.slug} images={business.aboutImages ?? []} className={business.aboutImages?.length ? 'absolute z-10 top-3 right-3' : ''} />
          </div>
          <Card className="flow-root">
            {/* Flotante: el texto rodea el botón y no queda tapado. */}
            <BusinessDescriptionEdit slug={business.slug} description={business.businessDescription ?? ''} className="float-right ml-3 mb-1" />
            <div className="space-y-4">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-base leading-relaxed">{p}</p>
              ))}
              {amenities.length > 0 && <AmenityList amenities={amenities} className="flex flex-wrap gap-2 pt-2" />}
            </div>
          </Card>
            </section>      ),
    },
    {
      id: 'resenas',
      label: 'Reseñas',
      content: (
            <section aria-labelledby="resenas-titulo">
          <h2 id="resenas-titulo" className="text-2xl font-semibold mb-5">Reseñas</h2>
          <TabToolbar tab="resenas" name="Reseñas" />
          <ReviewsSection slug={business.slug} reviews={business.reviews} rating={business.stats.rating} reviewCount={business.stats.reviewCount} />
            </section>      ),
    },
  ];

  return (
    <main className={`w-full pb-16 bg-brand-neutral-1 text-brand-dark ${business.coverUrl ? 'pt-16' : ''}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Cabecera a sangre: portada con degradado, nombre y estadísticas */}
      {/* Con portada: imagen centrada y completa, con los datos debajo sobre el fondo claro de la página. Sin portada: fondo oscuro. */}
      <section className={`relative w-full overflow-hidden ${business.coverUrl ? '' : 'bg-brand-dark min-h-[280px] md:min-h-[340px] flex items-end'}`}>
        <div className={business.coverUrl ? 'relative w-full max-w-7xl mx-auto px-4' : 'contents'}>
        {business.coverUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={business.coverUrl} alt={`Portada de ${business.name}`} className="block w-full aspect-[3/1] object-contain" />
        )}
        <BusinessImageEdit slug={business.slug} kind="cover" value={business.coverUrl} className={`absolute z-10 ${business.coverUrl ? 'top-3 right-7' : 'top-20 right-4'}`} />
        {!business.coverUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />}
        <div className={`relative w-full max-w-7xl mx-auto pb-6 ${business.coverUrl ? 'pt-4 text-brand-dark' : 'px-4 text-white'}`}>
          <div className="flex flex-col items-start gap-3">
            <div className={`relative w-fit ${business.logoUrl && business.coverUrl ? '-mt-[69px] md:-mt-[86px]' : ''}`}>
              {business.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={business.logoUrl} alt={`Logo de ${business.name}`} className={`w-[106px] h-[106px] md:w-[141px] md:h-[141px] ${business.logoShape === 'square' ? 'rounded-2xl' : 'rounded-full'} object-cover bg-white border-2 border-white`} />
              )}
              <BusinessImageEdit slug={business.slug} kind="logo" value={business.logoUrl} logoShape={business.logoShape} className={business.logoUrl ? 'absolute z-10 left-full ml-3 bottom-2' : ''} />
            </div>
            {/* El nombre no se muestra: queda como título para buscadores y lectores de pantalla. */}
            <h1 className="sr-only">{business.name}</h1>
          </div>
          <dl className="mt-4 flex gap-8">
            <Stat tone={statTone} label="Valoración" value={business.stats.rating !== null ? `★ ${business.stats.rating}` : '—'} />
            <Stat tone={statTone} label="Reseñas" value={business.stats.reviewCount} />
            <Stat tone={statTone} label="Años" value={business.stats.years} />
          </dl>
        </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-end mt-4">
          <BusinessOwnerBar
            slug={business.slug}
            pageUrl={pageUrl}
            initial={ownerInitial}
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

      <BusinessTabs
        slug={business.slug}
        storageKey={`tab:business:${business.slug}`}
        defaultId="eventos"
        panels={[...panels].sort((a, b) => a.label.localeCompare(b.label, 'es'))}
        hiddenTabs={business.hiddenTabs}
        footer={business.contactInAllTabs ? contactCard : undefined}
        footerHiddenOn="contactanos"
      />

      {/* La barra de Cómo llegar y Contactar solo se muestra en producción, no en local. */}
      {process.env.NODE_ENV === 'production' && <BottomBar mapHref={mapHref} contactHref={contactHref} />}
    </main>
  );
}
