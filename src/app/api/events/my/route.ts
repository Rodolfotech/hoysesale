import { route } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { eventsByOwner } from '@/server/services/events';

export const GET = route(async (req) => eventsByOwner((await requireUser(req)).id));
