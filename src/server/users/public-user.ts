// Campos de un usuario que cualquiera puede ver (dueño de un evento, asistente).
// Nunca se exponen correo, tokens de Instagram ni datos fiscales o de contacto personal.
export const PUBLIC_USER_SELECT = {
  id: true,
  name: true,
  avatar: true,
  slug: true,
  instagramUsername: true,
  companyInstagram: true,
} as const;
