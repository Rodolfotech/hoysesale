import { route } from '@/server/http';
import { googleAuthUrl } from '@/server/services/auth';

export const GET = route(async (req) => googleAuthUrl(req.nextUrl.searchParams.get('state') ?? undefined));
