import { z } from 'zod';
import { COMUNAS } from '@/constants/comunas';
import { BUSINESS_AMENITIES, BUSINESS_CATEGORIES } from '@/constants/business';
import { AUDIENCES, ENTRY_TYPES, INTERACTION_TYPES } from './events/filters';

// Esquemas de entrada de la API (reemplazan los DTO de class-validator del backend NestJS).
// Los objetos de zod eliminan los campos desconocidos: así no se puede escribir en columnas que el cliente no debe tocar.

const PHONE_CL = /^\+569\d{8}$/;
const PHONE_MESSAGE = 'El teléfono debe tener formato +569XXXXXXXX';

const text = (max?: number) => {
  const base = z.string().trim();
  return max ? base.max(max, `Máximo ${max} caracteres`) : base;
};

const httpsUrl = z
  .string()
  .trim()
  .refine((value) => {
    try {
      return new URL(value).protocol === 'https:';
    } catch {
      return false;
    }
  }, 'Debe ser una URL https válida');

const anyHttpUrl = z
  .string()
  .trim()
  .refine((value) => {
    try {
      return ['https:', 'http:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, 'Debe ser una URL válida');

const isoDate = z.string().refine((value) => !Number.isNaN(new Date(value).getTime()), 'La fecha no es válida');

// Correo y contraseña de sesión. Si faltan, el servicio responde con credenciales inválidas.
export const LoginSchema = z.object({
  email: z.string().catch(''),
  password: z.string().catch(''),
});

export const RegisterSchema = z.object({
  name: text().min(1, 'El nombre comercial es obligatorio'),
  adminFirstName: text().min(1, 'El nombre del administrador es obligatorio'),
  adminLastName: text().min(1, 'El apellido del administrador es obligatorio'),
  adminPhone: z.string().regex(PHONE_CL, PHONE_MESSAGE),
  comuna: z.enum(COMUNAS, { message: 'La comuna no pertenece a la Región de La Araucanía' }),
  email: z.email('El correo no es válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

export const EmailSchema = z.object({ email: z.string().catch('') });

export const ResetPasswordSchema = z.object({
  token: z.string().catch(''),
  password: z.string().catch(''),
});

export const CodeSchema = z.object({ code: z.string().catch('') });

export const ProfileUpdateSchema = z.object({
  name: text().min(1).optional(),
  avatar: z.string().nullish(),
  companyInstagram: z.string().nullish(),
  website: z.string().nullish(),
  companyRut: z.string().nullish(),
  companyGiro: z.string().nullish(),
  companyPhone: z.string().nullish(),
  companyAddress: z.string().nullish(),
  city: z.string().nullish(),
  comuna: z.enum(COMUNAS).nullish(),
  adminFirstName: z.string().nullish(),
  adminLastName: z.string().nullish(),
  adminRut: z.string().nullish(),
  adminPhone: z.string().nullish(),
});

// --- Eventos ---

export const CreateEventSchema = z.object({
  title: text().min(1, 'El título es obligatorio'),
  slug: z.string().nullish(),
  description: text().min(1, 'La descripción es obligatoria'),
  date: isoDate,
  categoryId: z.string().nullish(),
  categoryName: text().nullish(),
  locationName: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  isOnline: z.boolean().optional(),
  imageUrl: z.string().nullish(),
  instagramMediaId: z.string().nullish(),
  publicationStartDate: isoDate.nullish(),
  publicationEndDate: isoDate.nullish(),
  entryType: z.enum(ENTRY_TYPES, { message: 'Tipo de entrada no válido' }).nullish(),
  audience: z.enum(AUDIENCES, { message: 'Público no válido' }).nullish(),
  indoor: z.boolean().nullish(),
  amenities: z.array(z.string()).nullish(),
});

// Solo los campos que el organizador puede editar. Nunca ownerId, socialFeed ni lastSync.
export const UpdateEventSchema = z.object({
  title: text().min(1).optional(),
  description: text().min(1).optional(),
  date: isoDate.optional(),
  locationName: z.string().nullish(),
  address: z.string().nullish(),
  city: z.string().nullish(),
  isOnline: z.boolean().optional(),
  publicationStartDate: isoDate.nullish(),
  publicationEndDate: isoDate.nullish(),
  categoryName: text().nullish(),
  entryType: z.enum(ENTRY_TYPES, { message: 'Tipo de entrada no válido' }).nullish(),
  audience: z.enum(AUDIENCES, { message: 'Público no válido' }).nullish(),
  indoor: z.boolean().nullish(),
  amenities: z.array(z.string()).nullish(),
});

export const InteractionSchema = z.object({
  type: z.enum(INTERACTION_TYPES, { message: 'Tipo de interacción no válido' }),
});

// --- Categorías y asistentes ---

export const CreateCategorySchema = z.object({
  name: text().min(1, 'El nombre es obligatorio'),
  description: z.string().nullish(),
});

// El cliente solo envía eventId. El userId siempre sale de la sesión.
export const AttendeeSchema = z.object({ eventId: z.string().min(1, 'Falta el evento') });

// --- Redes sociales y medios ---

export const ConnectSocialSchema = z.object({ accessToken: z.string().min(1, 'Falta el token') });

export const LinkMediaSchema = z.object({
  permalink: httpsUrl,
  imageUrl: httpsUrl.nullish(),
  caption: text(2200).nullish(),
});

// --- Negocios (micro-sitios) ---

export const BusinessPageSchema = z.object({
  name: text(120).min(1).optional(),
  comuna: z.enum(COMUNAS).nullish(),
  companyAddress: text(200).nullish(),
  companyPhone: z.string().regex(PHONE_CL, PHONE_MESSAGE).nullish(),
  companyInstagram: text(200).nullish(),
  website: httpsUrl.nullish(),
  slug: text(60).optional(),
  category: z.enum(BUSINESS_CATEGORIES).nullish(),
  logoUrl: httpsUrl.nullish(),
  coverUrl: httpsUrl.nullish(),
  businessDescription: text(2000).nullish(),
  hours: z.record(z.string(), z.string()).nullish(),
  amenities: z.array(z.enum(BUSINESS_AMENITIES)).max(BUSINESS_AMENITIES.length).nullish(),
  whatsappReservations: z.string().regex(PHONE_CL, 'El WhatsApp debe tener formato +569XXXXXXXX').nullish(),
  mapUrl: httpsUrl.nullish(),
});

// Productos, servicios y destacados: cada tipo usa sus propios campos (name o title).
export const BusinessItemSchema = z.object({
  name: text(120).optional(),
  title: text(120).optional(),
  description: text(1000).nullish(),
  price: z.number().int().min(0).nullish(),
  imageUrl: anyHttpUrl.nullish(),
  tag: z.enum(['MAS_VENDIDO', 'DEL_DIA', 'REGALO', 'NUEVO']).nullish(),
  sortOrder: z.number().int().nullish(),
});

export const BusinessReviewSchema = z.object({
  rating: z.number().int().min(1, 'La calificación va de 1 a 5').max(5, 'La calificación va de 1 a 5'),
  comment: text(1000).nullish(),
});
