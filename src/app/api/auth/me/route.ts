import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';

export const GET = route(async (req) => ({ user: await requireUser(req) }));
