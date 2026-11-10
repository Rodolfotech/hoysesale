'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { parseConsent, readConsentRaw, subscribeConsent, type Consent } from '@/lib/consent';

// ready = false en el servidor y en la primera pintura: todavía no se sabe qué eligió el visitante.
export function useConsent(): { ready: boolean; consent: Consent | null } {
  const raw = useSyncExternalStore(subscribeConsent, () => readConsentRaw() ?? '', () => null);
  return useMemo(() => ({ ready: raw !== null, consent: parseConsent(raw || null) }), [raw]);
}
