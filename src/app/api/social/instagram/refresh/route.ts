import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { refreshToken } from '@/server/services/social';

export const POST = route(async (req) => refreshToken((await requireUser(req)).id));
