'use client';

import type { ReactNode } from 'react';
import { usePagedItems } from '@/hooks/usePagedItems';
import type { BusinessProduct } from '@/lib/business';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Pagination } from '../../components/ui/Pagination';
import { formatCLP, TAG_LABELS, whatsappLink } from './format';
import { OFFER_ITEMS_PER_PAGE, productToOffer } from './offer';
import { OfferItemActions } from './OfferItemActions';
import { useIsOwner } from './useIsOwner';

interface ProductsSectionProps {
  slug: string;
  toolbar?: ReactNode; // controles bajo el título
  products: BusinessProduct[];
  businessName: string;
  whatsapp: string | null;
}

// Productos en tarjetas, con la misma cuadrícula de servicios. "+ Agregar" abre un pedido por WhatsApp.
export function ProductsSection({ slug, toolbar, products, businessName, whatsapp }: ProductsSectionProps) {
  const isOwner = useIsOwner(slug);
  const { visible, currentPage, totalPages, setPage } = usePagedItems(products, OFFER_ITEMS_PER_PAGE);

  return (
    <div>
      <h2 id="productos-titulo" className="text-2xl font-semibold text-brand-dark mb-5">Productos</h2>
      {toolbar && <div className="mb-5 flex flex-wrap items-center justify-between gap-3 empty:hidden">{toolbar}</div>}

      {products.length === 0 ? (
        <EmptyState>Aún no hay productos publicados.</EmptyState>
      ) : (
        <>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((p) => (
            <li key={p.id} className="rounded-2xl overflow-hidden flex flex-col shadow-sm bg-brand-white">
              <div className="relative aspect-[4/3] bg-neutral-200">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                )}
                {p.tag && <Badge className="absolute top-3 left-3">{TAG_LABELS[p.tag]}</Badge>}
                {isOwner && <OfferItemActions type="products" item={productToOffer(p)} />}
              </div>
              <div className="p-4 flex flex-1 flex-col gap-1.5">
                <p className="text-[15px] font-semibold leading-snug line-clamp-2 text-brand-dark">{p.name}</p>
                {p.price !== null && <p className="text-base font-semibold text-brand-blue">{formatCLP(p.price)}</p>}
                {whatsapp && (
                  <Button
                    href={whatsappLink(whatsapp, `Hola, quiero pedir ${p.name} de ${businessName}`)}
                    target="_blank"
                    variant="dark"
                    fullWidth
                    className="mt-auto"
                    aria-label={`Agregar ${p.name} por WhatsApp`}
                  >
                    + Agregar
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
