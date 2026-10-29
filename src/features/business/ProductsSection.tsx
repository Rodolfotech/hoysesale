'use client';

import { useState } from 'react';
import type { BusinessProduct } from '@/lib/business';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Chip, ChipGroup } from '../../components/ui/Chip';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCLP, TAG_LABELS, whatsappLink } from './format';

const FILTERS = [{ key: 'ALL', label: 'Todos' }, ...Object.entries(TAG_LABELS).map(([key, label]) => ({ key, label }))];

interface ProductsSectionProps {
  products: BusinessProduct[];
  businessName: string;
  whatsapp: string | null;
}

// Productos con filtros por etiqueta en una fila horizontal. "+ Agregar" abre un pedido por WhatsApp.
export function ProductsSection({ products, businessName, whatsapp }: ProductsSectionProps) {
  const [filter, setFilter] = useState('ALL');
  const visible = filter === 'ALL' ? products : products.filter((p) => p.tag === filter);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h2 id="productos-titulo" className="text-2xl font-semibold text-brand-dark">Productos</h2>
        {products.length > 0 && (
          <ChipGroup label="Filtrar productos">
            {FILTERS.map((f) => (
              <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                {f.label}
              </Chip>
            ))}
          </ChipGroup>
        )}
      </div>

      {products.length === 0 ? (
        <EmptyState>Aún no hay productos publicados.</EmptyState>
      ) : (
        <ul className="flex gap-4 overflow-x-auto snap-x pb-3 -mx-4 px-4">
          {visible.map((p) => (
            <li key={p.id} className="snap-start shrink-0 w-[220px] rounded-2xl overflow-hidden flex flex-col shadow-sm bg-brand-white">
              <div className="relative aspect-[4/3] bg-neutral-200">
                {p.imageUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                )}
                {p.tag && <Badge className="absolute top-3 left-3">{TAG_LABELS[p.tag]}</Badge>}
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
      )}
    </div>
  );
}
