import { route, badRequest } from '@/server/http';
import { handleDeletionCallback } from '@/server/services/social';

// Meta envía signed_request como formulario; también se acepta JSON.
async function signedRequestFrom(req: Request): Promise<string> {
  const type = req.headers.get('content-type') ?? '';
  if (type.includes('application/json')) {
    const body = (await req.json().catch(() => ({}))) as { signed_request?: unknown };
    return typeof body.signed_request === 'string' ? body.signed_request : '';
  }
  const form = await req.formData().catch(() => null);
  const value = form?.get('signed_request');
  return typeof value === 'string' ? value : '';
}

export const POST = route(async (req) => {
  const signedRequest = await signedRequestFrom(req);
  try {
    return await handleDeletionCallback(signedRequest);
  } catch {
    throw badRequest('Error al procesar la solicitud de eliminación');
  }
});
