// Preferencias de cookies del visitante (Ley 21.719, art. 12): consentimiento previo, específico y revocable.
// Al cambiar la versión se vuelve a pedir el consentimiento a todos los visitantes.
export const COOKIE_POLICY_VERSION = '1.0';

export const CONSENT_STORAGE_KEY = 'hss_consent';
const CONSENT_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // pasado un año se vuelve a preguntar
const CHANGE_EVENT = 'hss:consent-change';
const OPEN_EVENT = 'hss:consent-open';

export interface Consent {
  version: string;
  maps: boolean; // Google Maps en el detalle de los eventos
  date: string;
}

// Respaldo en memoria si el navegador bloquea localStorage: la elección dura hasta recargar.
let memory: string | null = null;

export function readConsentRaw(): string | null {
  try {
    return window.localStorage.getItem(CONSENT_STORAGE_KEY) ?? memory;
  } catch {
    return memory;
  }
}

// Devuelve null si no hay decisión vigente: sin guardar, de otra versión de la política o vencida.
export function parseConsent(raw: string | null, now = Date.now()): Consent | null {
  if (!raw) return null;
  try {
    const consent = JSON.parse(raw) as Consent;
    if (consent.version !== COOKIE_POLICY_VERSION || typeof consent.maps !== 'boolean') return null;
    const age = now - new Date(consent.date).getTime();
    return age >= 0 && age <= CONSENT_MAX_AGE_MS ? consent : null;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { maps: boolean }): void {
  const value = JSON.stringify({ version: COOKIE_POLICY_VERSION, maps: choice.maps, date: new Date().toISOString() });
  memory = value;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, value);
  } catch {
    // queda en memoria
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function subscribeConsent(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener('storage', onChange); // cambios hechos en otra pestaña
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

// Reabre el panel de preferencias (pie de página y política de cookies).
export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookieSettings(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}
