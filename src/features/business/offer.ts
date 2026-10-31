import type { BusinessProduct, BusinessService } from '@/lib/business';

// Tarjetas por página en las secciones públicas de productos y servicios.
export const OFFER_ITEMS_PER_PAGE = 6;

// Productos y servicios del micro-sitio tal como los usa el formulario.
// Sin 'use client': también se usan desde componentes de servidor.
export interface OfferItem {
  id: string;
  name: string;
  description: string | null;
  price?: number | null;
  imageUrl?: string | null;
  tags?: string[];
}

export const productToOffer = (p: BusinessProduct): OfferItem => ({ id: p.id, name: p.name, description: p.description, price: p.price, imageUrl: p.imageUrl });

export const serviceToOffer = (s: BusinessService): OfferItem => ({ id: s.id, name: s.title, description: s.description, imageUrl: s.imageUrl, tags: s.tags });
