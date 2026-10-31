'use client';

import type { ReactNode } from 'react';
import { usePagedItems } from '@/hooks/usePagedItems';
import type { BusinessService } from '@/lib/business';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { whatsappLink } from './format';
import { OFFER_ITEMS_PER_PAGE, serviceToOffer } from './offer';
import { OfferItemActions } from './OfferItemActions';
import { useIsOwner } from './useIsOwner';

interface ServicesSectionProps {
  slug: string;
  toolbar?: ReactNode; // controles bajo el título
  services: BusinessService[];
  businessName: string;
  whatsapp: string | null;
}

// Servicios en tarjetas. "Cotizar" abre una consulta por WhatsApp.
export function ServicesSection({ slug, toolbar, services, businessName, whatsapp }: ServicesSectionProps) {
  const isOwner = useIsOwner(slug);
  const { visible, currentPage, totalPages, setPage } = usePagedItems(services, OFFER_ITEMS_PER_PAGE);

  return (
    <section aria-labelledby="servicios-titulo">
      <h2 id="servicios-titulo" className="text-2xl font-semibold mb-5">Servicios</h2>
      {toolbar && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 empty:hidden">{toolbar}</div>}
      {services.length === 0 ? (
        <EmptyState>Aún no hay servicios publicados.</EmptyState>
      ) : (
        <>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((s) => (
            <li key={s.id} className="rounded-2xl overflow-hidden flex flex-col shadow-sm bg-brand-white">
              <div className="relative aspect-[4/3] bg-neutral-200">
                {s.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                )}
                {isOwner && <OfferItemActions type="services" item={serviceToOffer(s)} />}
              </div>
              <div className="p-4 flex flex-1 flex-col gap-1.5">
                {s.tags.length > 0 && (
                  <ul className="flex flex-wrap gap-1.5 mb-1" aria-label="Etiquetas">
                    {s.tags.map((tag) => (
                      <li key={tag}><Badge tone="brand">{tag}</Badge></li>
                    ))}
                  </ul>
                )}
                <p className="text-[15px] font-semibold leading-snug text-brand-dark">{s.title}</p>
                {s.description && <p className="text-sm text-brand-dark/60">{s.description}</p>}
                {whatsapp && (
                  <Button
                    href={whatsappLink(whatsapp, `Hola, quiero cotizar ${s.title} de ${businessName}`)}
                    target="_blank"
                    variant="dark"
                    fullWidth
                    className="mt-auto"
                    aria-label={`Cotizar ${s.title} por WhatsApp`}
                  >
                    Cotizar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </section>
  );
}
