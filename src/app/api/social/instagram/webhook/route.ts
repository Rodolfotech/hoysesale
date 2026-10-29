import { route } from '@/server/http';
import { handleWebhook, verifyWebhook } from '@/server/services/social';

// Verificación de Meta: devuelve el challenge como texto plano.
export const GET = route(async (req) => {
  const p = req.nextUrl.searchParams;
  const challenge = verifyWebhook(p.get('hub.mode'), p.get('hub.challenge'), p.get('hub.verify_token'));
  return new Response(challenge, { headers: { 'Content-Type': 'text/plain' } });
});

// Notificaciones de Meta: se responde 200 enseguida; la sincronización va después.
export const POST = route(async (req) => {
  const body = await req.json().catch(() => ({}));
  await handleWebhook(body);
});
