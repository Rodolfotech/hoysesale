import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { getUserMedia } from '@/server/services/social';

export const GET = route(async (req) => getUserMedia((await requireUser(req)).id));
