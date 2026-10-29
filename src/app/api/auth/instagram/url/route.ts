import { route } from '@/server/http';
import { instagramAuthUrl } from '@/server/services/auth';

export const GET = route(async (req) => instagramAuthUrl(req.nextUrl.searchParams.get('state') ?? undefined));
