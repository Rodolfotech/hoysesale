import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { findPublicUserById, findUserById } from '@/server/services/users';

// Datos completos solo para uno mismo o un ADMIN; a los demás, la vista pública.
export const GET = route<{ id: string }>(async (req, { params }) => {
  const me = await requireUser(req);
  const { id } = await params;
  if (me.id === id || me.role === 'ADMIN') return findUserById(id);
  return findPublicUserById(id);
});
