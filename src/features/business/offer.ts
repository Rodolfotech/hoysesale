import type { BusinessProduct, BusinessService } from '@/lib/business';

// Productos y servicios del micro-sitio tal como los usa el formulario.
// Sin 'use client': también se usan desde componentes de servidor.
export interface OfferItem {
  id: string;
  name: string;
  description: string | null;
  price?: number | null;
}

export const productsToOffer = (products: BusinessProduct[]): OfferItem[] =>
  products.map((p) => ({ id: p.id, name: p.name, description: p.description, price: p.price }));

export const servicesToOffer = (services: BusinessService[]): OfferItem[] =>
  services.map((s) => ({ id: s.id, name: s.title, description: s.description }));
