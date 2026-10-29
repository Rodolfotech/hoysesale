import api from './client';
import { ADMIN_API_PREFIX } from '../constants/admin';
import type { User, Event, Category, CreateEventPayload, SocialConnectPayload, SocialPost, PaginatedResponse } from '../types';

// Registro obligatorio de organizador (mismos campos que RegisterDto del backend)
export interface RegisterPayload {
  name: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  comuna: string;
  email: string;
  password: string;
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; user: User }>('/auth/login', { email, password }),
  register: (data: RegisterPayload) =>
    api.post<{ access_token: string; user: User }>('/auth/register', data),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post('/auth/reset-password', { token, password }),
  getInstagramAuthUrl: (state?: string) =>
    api.get<{ url: string }>('/auth/instagram/url', { params: state ? { state } : {} }),
  instagramLogin: (code: string) =>
    api.post<{ access_token: string; user: User }>('/auth/instagram', { code }),
  getGoogleAuthUrl: (state?: string) =>
    api.get<{ url: string }>('/auth/google/url', { params: state ? { state } : {} }),
  googleLogin: (code: string) =>
    api.post<{ access_token: string; user: User }>('/auth/google', { code }),
  me: () => api.get<{ user: User }>('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const eventsApi = {
  getAll: (params?: { dateFrom?: string; dateTo?: string; categoryId?: string; city?: string; page?: number; limit?: number }) =>
    api.get<PaginatedResponse<Event>>('/events', { params }),
  getBySlug: (slug: string) => api.get<Event>(`/events/${slug}`),
  create: (data: CreateEventPayload) => api.post<Event>('/events', data),
  // publicationEndDate null = visible sin fecha de término (reanudar)
  update: (id: string, data: Partial<Omit<CreateEventPayload, 'publicationEndDate'>> & { publicationEndDate?: string | null }) =>
    api.put<Event>(`/events/${id}`, data),
  delete: (id: string) => api.delete(`/events/${id}`),
  getByOwner: () => api.get<Event[]>('/events/my'),
};

// Medios de un evento (imágenes subidas o enlaces de publicación)
export interface EventMedia {
  id: string;
  eventId: string;
  source: 'UPLOAD' | 'INSTAGRAM' | 'LINK';
  imageUrl: string | null;
  permalink: string | null;
  caption: string | null;
  createdAt: string;
}

export const mediaApi = {
  uploadTemp: (file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post<{ url: string }>('/uploads/image', form, { headers: { 'Content-Type': undefined } });
  },
  list: (eventId: string) => api.get<EventMedia[]>(`/events/${eventId}/media`),
  upload: (eventId: string, file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Sin Content-Type fijo: el navegador agrega el boundary de multipart.
    return api.post<EventMedia>(`/events/${eventId}/media/upload`, form, {
      headers: { 'Content-Type': undefined },
    });
  },
  link: (eventId: string, data: { permalink: string; imageUrl?: string; caption?: string }) =>
    api.post<EventMedia>(`/events/${eventId}/media/link`, data),
  remove: (mediaId: string) => api.delete(`/media/${mediaId}`),
};

export const categoriesApi = {
  getAll: () => api.get<Category[]>('/categories'),
};

export const attendeesApi = {
  register: (eventId: string) => api.post('/attendees', { eventId }),
  findByEvent: (eventId: string) => api.get(`/attendees/event/${eventId}`),
  findByUser: () => api.get('/attendees/my'),
  unregister: (eventId: string) => api.delete(`/attendees/${eventId}`),
};

export const socialApi = {
  getInstagramAuthUrl: () => api.get<{ url: string }>('/social/instagram/auth-url'),
  instagramCallback: (code: string) => api.post('/social/instagram/callback', { code }),
  facebookConnect: (data: SocialConnectPayload) => api.post('/social/facebook/connect', data),
  instagramConnect: (data: SocialConnectPayload) => api.post('/social/instagram/connect', data),
  disconnect: (platform: string) => api.delete(`/social/${platform}/disconnect`),
  getStatus: () => api.get<{ facebook: boolean; instagram: boolean; instagramUsername: string | null; instagramAvatar: string | null }>('/social/status'),
  refreshToken: () => api.post('/social/instagram/refresh'),
  syncFeed: (eventId: string) => api.post(`/social/sync/${eventId}`),
  getUserMedia: () => api.get<SocialPost[]>('/social/instagram/media'),
  getValidation: () => api.get<any>('/social/instagram/validation'),
};

export const usersApi = {
  getProfile: () => api.get<User>('/users/profile'),
  updateProfile: (data: Partial<User>) => api.put<User>('/users/profile', data),
  deleteAccount: () => api.delete('/users/me'),
};

const A = ADMIN_API_PREFIX;

export const adminApi = {
  getUsers: (comuna?: string) =>
    api.get<User[]>(`/${A}/users`, { params: comuna ? { comuna } : {} }),
  getUserById: (id: string) => api.get<User>(`/${A}/users/${id}`),
  getComunas: () => api.get<string[]>(`/${A}/comunas`),
  getStats: () => api.get<{ totalUsers: number; totalEvents: number; totalAttendees: number; totalInstagramClicks: number }>(`/${A}/stats`),
  trackInstagramClick: (eventId?: string) => api.post(`/${A}/instagram-click`, { eventId }),
};

// Micro-sitio del negocio (edición del propio negocio)
export const businessApi = {
  addItem: (type: 'products' | 'services' | 'highlights', data: object) => api.post(`/businesses/me/${type}`, data),
  updateItem: (type: 'products' | 'services' | 'highlights', id: string, data: object) => api.put(`/businesses/me/${type}/${id}`, data),
  deleteItem: (type: 'products' | 'services' | 'highlights', id: string) => api.delete(`/businesses/me/${type}/${id}`),
  review: (slug: string, data: { rating: number; comment?: string }) => api.post(`/businesses/${slug}/reviews`, data),
  createPage: (data: object) => api.post<Partial<User>>('/businesses/me', data),
  uploadImage: (kind: 'logo' | 'cover', file: File) => {
    const form = new FormData();
    form.append('file', file);
    // Sin Content-Type fijo: el navegador agrega el boundary de multipart.
    return api.post<Partial<User>>(`/businesses/me/image/${kind}`, form, { headers: { 'Content-Type': undefined } });
  },
  updateMe: (data: Partial<{
    name: string;
    comuna: string;
    companyAddress: string;
    companyPhone: string;
    companyInstagram: string;
    website: string;
    hours: Record<string, string>;
    slug: string;
    category: string;
    businessDescription: string;
    amenities: string[];
    whatsappReservations: string;
    mapUrl: string;
  }>) => api.put<Partial<User>>('/businesses/me', data),
};
