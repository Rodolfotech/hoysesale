import { ADDRESS_LABELS, BUSINESS_DESCRIPTION_MAX, HIDEABLE_TABS, INSTAGRAM_LABELS, LOGO_SHAPES, PHONE_LABELS, SERVICE_TAGS_MAX, SERVICE_TAG_MAX_LENGTH, WEBSITE_LABELS } from '@/lib/business';
import { VISIT_NOTE_IDS } from '@/lib/business-rules';
import { z } from 'zod';
import { COMUNAS } from '@/constants/comunas';
import { BUSINESS_AMENITIES, BUSINESS_CATEGORIES } from '@/constants/business';
import { GIRO_OPTIONS } from '@/constants/giros';
import { AUDIENCES, ENTRY_TYPES, INTERACTION_TYPES } from './events/filters';
import { hoursProblem } from '@/lib/hours';
import { ABOUT_MAX_IMAGES } from '@/lib/media-limits';
import { companyRutError, formatRut, isValidRut } from '@/lib/rut';

const COMUNA_MESSAGE = 'Selecciona una comuna de la Región de La Araucanía';

// Esquemas de entrada de la API (reemplazan los DTO de class-validator del backend NestJS).
// Los objetos de zod eliminan los campos desconocidos: así no se puede escribir en columnas que el cliente no debe tocar.

const PHONE_CL = /^\+569[3-9]\d{7}$/;
const PHONE_MESSAGE = 'El teléfono debe tener formato +569XXXXXXXX';

const text = (max?: number) => {
  const base = z.string().trim();
  return max ? base.max(max, `Máximo ${max} caracteres`) : base;
};

// Datos que identifican a la empresa: obligatorios, por eso no aceptan null (no se pueden borrar).
// Son opcionales en cada petición porque Contáctanos guarda solo una parte del perfil.
// Texto obligatorio: rechaza null y vacío con un mensaje propio.
const requiredText = (message: string, max: number) => z.string({ message }).trim().min(1, message).max(max, `Máximo ${max} caracteres`);

const INSTAGRAM = z
  .string({ message: 'El Instagram de la empresa es obligatorio' })
  .regex(/^@[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/, 'El Instagram debe ser @usuario: hasta 30 caracteres (letras, números, _ o .)')
  .refine((v) => !v.includes('..'), 'El Instagram no puede tener dos puntos seguidos');
const COMPANY_ADDRESS = requiredText('La dirección de la empresa es obligatoria', 200)
  .regex(/\d/, 'La dirección debe incluir calle y número');
const COMPANY_PHONE = z.string({ message: 'El teléfono de la empresa es obligatorio' }).regex(PHONE_CL, PHONE_MESSAGE);
const rutSchema = (who: string) =>
  z.string({ message: `${who} es obligatorio` }).trim().refine(isValidRut, `${who} no es válido`).transform(formatRut);
// La empresa debe tener RUT de persona jurídica (desde 50.000.000), además de un dígito verificador correcto.
const COMPANY_RUT = z
  .string({ message: 'El RUT de la empresa es obligatorio' })
  .trim()
  .superRefine((value, ctx) => {
    const error = companyRutError(value);
    if (error) ctx.addIssue({ code: 'custom', message: error });
  })
  .transform(formatRut);

// Las URL se escriben sin protocolo (www.mitienda.cl) o con http://: se guardan como https://.
const toHttps = (value: string) => 'https://' + value.trim().replace(/^https?:\/\//i, '');

const httpsUrl = z
  .string()
  .trim()
  .transform(toHttps)
  .refine((value) => {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' && url.hostname.includes('.');
    } catch {
      return false;
    }
  }, 'Escribe una dirección válida, por ejemplo www.mitienda.cl');

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
  comuna: z.enum(COMUNAS, { message: COMUNA_MESSAGE }),
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
  name: requiredText('El nombre de la empresa es obligatorio', 120).optional(),
  category: z.enum(BUSINESS_CATEGORIES, { message: 'Selecciona la categoría de la empresa' }).optional(),
  avatar: z.string().nullish(),
  companyInstagram: INSTAGRAM.optional(),
  website: z.string().nullish(), // el único dato de la empresa que no es obligatorio
  companyRut: COMPANY_RUT.optional(),
  companyGiro: z.enum(GIRO_OPTIONS, { message: 'Selecciona el giro de la empresa' }).optional(),
  companyPhone: COMPANY_PHONE.optional(),
  companyAddress: COMPANY_ADDRESS.optional(),
  city: requiredText('La ciudad de la empresa es obligatoria', 60).optional(),
  comuna: z.enum(COMUNAS, { message: COMUNA_MESSAGE }).optional(), // obligatoria: no se puede borrar
  // Administrador: representante legal de la empresa. Todos sus datos son obligatorios.
  adminFirstName: requiredText('El nombre del administrador es obligatorio', 60).optional(),
  adminLastName: requiredText('El apellido del administrador es obligatorio', 60).optional(),
  adminRut: rutSchema('El RUT del administrador').optional(),
  adminPhone: z.string({ message: 'El teléfono del administrador es obligatorio' }).regex(PHONE_CL, PHONE_MESSAGE).optional(),
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
  city: z.enum(COMUNAS, { message: COMUNA_MESSAGE }).optional(), // debe ser la comuna del negocio (events.ts)
  isOnline: z.boolean().optional(),
  imageUrl: z.string().nullish(),
  instagramMediaId: z.string().nullish(),
  publicationStartDate: isoDate.nullish(),
  publicationEndDate: isoDate.nullish(),
  entryType: z.enum(ENTRY_TYPES, { message: 'Tipo de entrada no válido' }).nullish(),
  audience: z.enum(AUDIENCES, { message: 'Público no válido' }).nullish(),
  indoor: z.boolean().nullish(),
  amenities: z.array(z.enum(VISIT_NOTE_IDS)).max(VISIT_NOTE_IDS.length).nullish(), // avisos para la visita (business-rules.ts)
  yearRound: z.boolean().optional(), // experiencia todo el año (events.ts limita quién y por cuánto tiempo)
  featured: z.boolean().optional(), // Eventos destacados (por defecto sí, si la empresa puede)
  hoySeSale: z.boolean().optional(), // Hoy se sale
  news: z.boolean().optional(), // Lo nuevo en la región
});

// Solo los campos que el organizador puede editar. Nunca ownerId, socialFeed ni lastSync.
export const UpdateEventSchema = z.object({
  title: text().min(1).optional(),
  description: text().min(1).optional(),
  date: isoDate.optional(),
  locationName: z.string().nullish(),
  address: z.string().nullish(),
  city: z.enum(COMUNAS, { message: COMUNA_MESSAGE }).optional(), // debe ser la comuna del negocio (events.ts)
  isOnline: z.boolean().optional(),
  imageUrl: anyHttpUrl.optional(),
  publicationStartDate: isoDate.nullish(),
  publicationEndDate: isoDate.nullish(),
  categoryName: text().nullish(),
  entryType: z.enum(ENTRY_TYPES, { message: 'Tipo de entrada no válido' }).nullish(),
  audience: z.enum(AUDIENCES, { message: 'Público no válido' }).nullish(),
  indoor: z.boolean().nullish(),
  amenities: z.array(z.enum(VISIT_NOTE_IDS)).max(VISIT_NOTE_IDS.length).nullish(), // avisos para la visita (business-rules.ts)
  featured: z.boolean().optional(),
  hoySeSale: z.boolean().optional(),
  yearRound: z.boolean().optional(),
  news: z.boolean().optional(), // quién puede marcar cada una: allowedPlacements (business-rules.ts)
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
  name: text(20).min(1, 'El nombre del negocio es obligatorio').regex(/^[\p{L}\p{N} ]+$/u, 'El nombre solo puede tener letras, números y espacios').optional(),
  comuna: z.enum(COMUNAS, { message: COMUNA_MESSAGE }).optional(),
  companyAddress: COMPANY_ADDRESS.optional(),
  companyPhone: COMPANY_PHONE.optional(),
  companyInstagram: INSTAGRAM.optional(),
  website: httpsUrl.nullish(),
  slug: text(20).optional(),
  category: z.enum(BUSINESS_CATEGORIES, { message: 'Selecciona la categoría de la empresa' }).optional(),
  logoUrl: httpsUrl.nullish(),
  logoShape: z.enum(LOGO_SHAPES).optional(),
  coverUrl: httpsUrl.nullish(),
  businessDescription: text(BUSINESS_DESCRIPTION_MAX).nullish(),
  hours: z
    .record(z.string(), z.string())
    .superRefine((hours, ctx) => {
      const problem = hoursProblem(hours);
      if (problem) ctx.addIssue({ code: 'custom', message: problem });
    })
    .nullish(),
  amenities: z.array(z.enum(BUSINESS_AMENITIES)).max(BUSINESS_AMENITIES.length).nullish(),
  whatsappReservations: z.string().regex(PHONE_CL, 'El WhatsApp debe tener formato +569XXXXXXXX').nullish(),
  mapUrl: httpsUrl.nullish(),
  phoneLabel: z.enum(PHONE_LABELS).nullish(),
  addressLabel: z.enum(ADDRESS_LABELS).nullish(),
  instagramLabel: z.enum(INSTAGRAM_LABELS).nullish(),
  websiteLabel: z.enum(WEBSITE_LABELS).nullish(),
  hiddenTabs: z.array(z.enum(HIDEABLE_TABS)).max(HIDEABLE_TABS.length).optional(),
  contactInAllTabs: z.boolean().optional(),
});

// Productos, servicios y destacados: cada tipo usa sus propios campos (name o title).
export const BusinessItemSchema = z.object({
  name: text(120).optional(),
  title: text(120).optional(),
  description: text(2000).nullish(),
  price: z.number().int().min(0).nullish(),
  imageUrl: anyHttpUrl.nullish(),
  tags: z.array(text(SERVICE_TAG_MAX_LENGTH)).max(SERVICE_TAGS_MAX, `Puedes agregar hasta ${SERVICE_TAGS_MAX} etiquetas`).nullish(),
  tag: z.enum(['MAS_VENDIDO', 'DEL_DIA', 'REGALO', 'NUEVO']).nullish(),
  sortOrder: z.number().int().nullish(),
});

// Nuevo orden de las fotos de "Nosotros".
export const AboutImagesOrderSchema = z.object({ images: z.array(z.string()).max(ABOUT_MAX_IMAGES) });

export const BusinessReviewSchema = z.object({
  rating: z.number().int().min(1, 'La calificación va de 1 a 5').max(5, 'La calificación va de 1 a 5'),
  comment: text(1000).nullish(),
});
