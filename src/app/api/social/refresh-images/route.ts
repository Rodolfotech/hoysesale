import { route } from '@/server/http';
import { assertCronSecret, refreshEventImages } from '@/server/services/social';

// Cron de Vercel: exige Authorization: Bearer <CRON_SECRET>.
export const GET = route(async (req) => {
  assertCronSecret(req.headers.get('authorization'));
  return refreshEventImages();
});
