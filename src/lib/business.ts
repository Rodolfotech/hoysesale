// Tipos del micro-sitio de un negocio (forma pública que devuelve getPublicBusiness) y URL del sitio.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hoysesale.cl';

export interface BusinessEvent {
  id: string;
  title: string;
  slug: string;
  date: string;
  imageUrl: string | null;
  address: string | null;
  city: string | null;
  description: string;
  entryType: string | null;
  indoor: boolean | null;
}

export interface BusinessProduct {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
  imageUrl: string | null;
  tag: 'MAS_VENDIDO' | 'DEL_DIA' | 'REGALO' | 'NUEVO' | null;
}

export interface BusinessService {
  id: string;
  title: string;
  description: string | null;
}

export interface BusinessHighlight {
  id: string;
  title: string;
  imageUrl: string;
}

export interface BusinessReview {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  author: { name: string; avatar: string | null };
}

export interface Business {
  createdAt?: string;
  stats: { rating: number | null; reviewCount: number; years: number };
  products: BusinessProduct[];
  services: BusinessService[];
  highlights: BusinessHighlight[];
  reviews: BusinessReview[];
  name: string;
  slug: string;
  category: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  businessDescription: string | null;
  hours: Record<string, string> | null;
  amenities: string[] | null;
  whatsappReservations: string | null;
  mapUrl: string | null;
  comuna: string | null;
  city: string | null;
  companyAddress: string | null;
  companyInstagram: string | null;
  website: string | null;
  companyPhone: string | null;
  events: BusinessEvent[];
}
