import { route } from '@/server/http';
import { instagramAuthUrl } from '@/server/services/social';

export const GET = route(async () => instagramAuthUrl());
