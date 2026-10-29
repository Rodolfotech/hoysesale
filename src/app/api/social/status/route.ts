import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { getStatus } from '@/server/services/social';

export const GET = route(async (req) => getStatus((await requireUser(req)).id));
