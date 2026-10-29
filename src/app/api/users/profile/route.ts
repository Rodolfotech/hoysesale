import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { findUserById, updateUserProfile } from '@/server/services/users';
import { ProfileUpdateSchema } from '@/server/validation';

export const GET = route(async (req) => {
  const user = await requireUser(req);
  return findUserById(user.id);
});

// Solo se aceptan los campos del perfil: nunca role, email ni tokens.
export const PUT = route(async (req) => {
  const user = await requireUser(req);
  const data = await readBody(req, ProfileUpdateSchema);
  return updateUserProfile(user.id, data);
});
