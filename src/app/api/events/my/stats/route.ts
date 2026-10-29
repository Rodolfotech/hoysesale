import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { statsForOwner } from '@/server/services/events';

export const GET = route(async (req) => statsForOwner((await requireUser(req)).id));
