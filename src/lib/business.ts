// Tipos del micro-sitio de un negocio (forma pública que devuelve getPublicBusiness) y URL del sitio.
// Etiquetas de un servicio: mismos límites en formulario y servidor.
export const SERVICE_TAGS_MAX = 3;
export const SERVICE_TAG_MAX_LENGTH = 20;

// Descripción del negocio: mismo límite en formulario y servidor.
export const BUSINESS_DESCRIPTION_MAX = 2000;

// Textos que el negocio puede poner junto a su teléfono.
export const PHONE_LABELS = ['Llámanos', 'Llámanos al', 'Haz tu pedido al', 'Reserva al', 'Atención', 'Consultas', 'Contacto'] as const;
export type PhoneLabel = (typeof PHONE_LABELS)[number];

// Textos que el negocio puede poner junto a su dirección. El primero se usa por defecto.
export const ADDRESS_LABELS = ['Dirección', 'Ubicación', 'Dónde estamos', 'Visítanos en'] as const;
export type AddressLabel = (typeof ADDRESS_LABELS)[number];

// Textos que el negocio puede poner junto a su Instagram. El primero se usa por defecto.
export const INSTAGRAM_LABELS = ['Instagram', 'Síguenos en Instagram', 'Nuestro Instagram', 'Síguenos', 'Ver', 'Conoce más en Instagram', 'Descubre nuestras novedades'] as const;
export type InstagramLabel = (typeof INSTAGRAM_LABELS)[number];

// Textos que el negocio puede poner junto a su sitio web. El primero se usa por defecto.
export const WEBSITE_LABELS = ['Sitio web', 'Página web', 'Web', 'Web oficial', 'Visitar sitio web', 'Ir al sitio web', 'Conoce más en nuestra web', 'Sitio oficial'] as const;
export type WebsiteLabel = (typeof WEBSITE_LABELS)[number];

// Pestañas del micro-sitio que el dueño puede ocultar a los visitantes.
export const HIDEABLE_TABS = ['contactanos', 'eventos', 'horario', 'productos', 'resenas', 'servicios'] as const;
export type HideableTab = (typeof HIDEABLE_TABS)[number];

// Marco del logo en el micro-sitio.
export const LOGO_SHAPES = ['round', 'square'] as const;
export type LogoShape = (typeof LOGO_SHAPES)[number];
export const LOGO_SHAPE_LABELS: Record<LogoShape, string> = { round: 'Redondo', square: 'Cuadrado' };

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
  imageUrl: string | null;
  tags: string[];
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
  aboutImages: string[];
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
  logoShape: LogoShape;
  coverUrl: string | null;
  businessDescription: string | null;
  hours: Record<string, string> | null;
  amenities: string[] | null;
  whatsappReservations: string | null;
  mapUrl: string | null;
  phoneLabel: PhoneLabel | null;
  addressLabel: AddressLabel | null;
  instagramLabel: InstagramLabel | null;
  websiteLabel: WebsiteLabel | null;
  hiddenTabs: HideableTab[];
  contactInAllTabs: boolean;
  comuna: string | null;
  city: string | null;
  companyAddress: string | null;
  companyInstagram: string | null;
  website: string | null;
  companyPhone: string | null;
  events: BusinessEvent[];
}

// Quita el contenido de las pestañas ocultas antes de enviar la página a un visitante.
// El contacto se conserva si el dueño pidió mostrarlo debajo de cada pestaña.
export function redactHiddenTabs(business: Business): Business {
  const hidden = new Set<string>(business.hiddenTabs);
  const contact = hidden.has('contactanos') && !business.contactInAllTabs
    ? { companyAddress: null, companyPhone: null, companyInstagram: null, website: null }
    : {};
  return {
    ...business,
    ...contact,
    events: hidden.has('eventos') ? [] : business.events,
    hours: hidden.has('horario') ? null : business.hours,
    products: hidden.has('productos') ? [] : business.products,
    services: hidden.has('servicios') ? [] : business.services,
    reviews: hidden.has('resenas') ? [] : business.reviews,
  };
}
