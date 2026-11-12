// Aviso que envía la ventana de Google (views/GoogleCallback) al terminar.
// Solo se acepta desde este mismo sitio, y cada código se usa una vez: en desarrollo la ventana avisa dos veces.
const handledCodes = new Set<string>();

export function googleResultFrom(e: MessageEvent): { code: string } | { error: true } | null {
  if (e.origin !== window.location.origin || e.data?.type !== 'google-code') return null;
  if (e.data.error) return { error: true };
  const code = typeof e.data.code === 'string' ? e.data.code : '';
  if (!code || handledCodes.has(code)) return null;
  handledCodes.add(code);
  return { code };
}
