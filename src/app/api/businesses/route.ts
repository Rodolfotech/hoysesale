import { route } from '@/server/http';
import { listBusinessSlugs } from '@/server/services/businesses';

export const GET = route(async () => listBusinessSlugs());
