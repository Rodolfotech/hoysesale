import { afterEach, describe, expect, it } from 'vitest';
import { COOKIE_POLICY_VERSION, CONSENT_STORAGE_KEY, parseConsent, readConsentRaw, saveConsent } from './consent';

const DAY = 24 * 60 * 60 * 1000;
const stored = (date: string, version = COOKIE_POLICY_VERSION) => JSON.stringify({ version, maps: true, date });

describe('consentimiento de cookies', () => {
  afterEach(() => window.localStorage.clear());

  it('sin decisión no hay consentimiento', () => {
    expect(parseConsent(null)).toBeNull();
    expect(parseConsent('no es json')).toBeNull();
  });

  it('acepta una decisión vigente de la versión actual', () => {
    const now = Date.parse('2026-11-10T12:00:00Z');
    expect(parseConsent(stored('2026-11-01T12:00:00Z'), now)?.maps).toBe(true);
  });

  it('vuelve a preguntar si cambió la política o pasó un año', () => {
    const now = Date.parse('2026-11-10T12:00:00Z');
    expect(parseConsent(stored('2026-11-01T12:00:00Z', '0.9'), now)).toBeNull();
    expect(parseConsent(stored(new Date(now - 366 * DAY).toISOString()), now)).toBeNull();
  });

  it('guarda el rechazo igual que la aceptación', () => {
    saveConsent({ maps: false });
    expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toContain('"maps":false');
    expect(parseConsent(readConsentRaw())?.maps).toBe(false);
  });
});
