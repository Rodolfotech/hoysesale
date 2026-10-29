import { route } from '@/server/http';

export const GET = route(async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
