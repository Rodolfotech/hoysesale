import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { getValidation } from '@/server/services/social';

export const GET = route(async (req) => getValidation((await requireUser(req)).id));
