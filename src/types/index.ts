export interface User {
  // Micro-sitio del negocio
  slug?: string | null;
  category?: string | null;
  businessDescription?: string | null;
  amenities?: string[] | null;
  whatsappReservations?: string | null;
  mapUrl?: string | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role: 'USER' | 'ADMIN' | 'ORGANIZER';
  comuna?: string;
  facebookId?: string;
  instagramId?: string;
  instagramUsername?: string;
  instagramAvatar?: string;
  isActive?: boolean;
  createdAt: string;
  updatedAt?: string;
  eventCount?: number;
  registrationCount?: number;
  instagramClickCount?: number;
  ownedEvents?: Array<{ id: string; title: string; slug: string; date: string; city?: string }>;
  registrations?: Array<{ id: string; event: { id: string; title: string; slug: string; date: string }; createdAt: string }>;
  companyInstagram?: string;
  website?: string;
  companyRut?: string;
  companyGiro?: string;
  companyPhone?: string;
  companyAddress?: string;
  city?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminRut?: string;
  adminPhone?: string;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  content?: string;
  date: string;
  publicationStartDate?: string;
  publicationEndDate?: string;
  locationName?: string;
  address?: string;
  city?: string;
  isOnline: boolean;
  price?: number;
  imageUrl?: string;
  socialFeed?: SocialPost[];
  lastSync?: string;
  owner: User;
  category?: Category;
  attendees?: Attendee[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface Attendee {
  id: string;
  userId: string;
  eventId: string;
  status: string;
  user: User;
}

export interface SocialPost {
  id: string;
  platform: 'instagram' | 'facebook';
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
  timestamp: string;
  media_type?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateEventPayload {
  title: string;
  description: string;
  date: string;
  publicationStartDate?: string;
  publicationEndDate?: string;
  locationName?: string;
  address?: string;
  city?: string;
  isOnline: boolean;
  imageUrl?: string;
  instagramMediaId?: string;
  categoryId?: string;
  categoryName?: string;
}

export interface SocialConnectPayload {
  platform: 'facebook' | 'instagram';
  accessToken: string;
  userId?: string;
}
