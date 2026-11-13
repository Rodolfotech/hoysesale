'use client';

import { useEffect } from 'react';
import { useConsent } from '@/hooks/useConsent';
import { ANALYTICS_COOKIE_PREFIXES, GTM_ID, GTM_SRC } from '@/lib/analytics';

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

const SCRIPT_ID = 'hss-gtm';

// Pasa los datos a Google con el formato de gtag (un objeto arguments, no un arreglo).
function gtag(..._args: unknown[]) {
  // eslint-disable-next-line prefer-rest-params
  window.dataLayer?.push(arguments);
}

// Borra las cookies de analítica del propio dominio (las de los dominios de Microsoft no se pueden borrar desde aquí).
function deleteAnalyticsCookies() {
  const host = window.location.hostname;
  const domains = ['', host, `.${host.replace(/^www\./, '')}`];
  document.cookie.split(';').map((c) => c.split('=')[0].trim()).filter((name) => ANALYTICS_COOKIE_PREFIXES.some((p) => name.startsWith(p))).forEach((name) => {
    domains.forEach((domain) => {
      document.cookie = `${name}=; Max-Age=0; path=/${domain ? `; domain=${domain}` : ''}`;
    });
  });
}

// Google Tag Manager (Ley 21.719, art. 12): se carga solo si el visitante aceptó la analítica, y solo en producción.
// Si retira el consentimiento después de cargarlo, se avisa a Google, se borran sus cookies y se recarga la página.
export function Analytics() {
  const { consent } = useConsent();
  const allowed = consent?.analytics === true;

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !GTM_ID) return;
    const loaded = !!document.getElementById(SCRIPT_ID);

    if (!allowed) {
      if (loaded) {
        gtag('consent', 'update', { analytics_storage: 'denied' });
        deleteAnalyticsCookies();
        window.location.reload();
      }
      return;
    }
    if (loaded) return;

    window.dataLayer = window.dataLayer || [];
    // Modo de consentimiento de Google: analítica sí, publicidad nunca.
    gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'granted' });
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = GTM_SRC;
    document.head.appendChild(script);
  }, [allowed]);

  return null;
}
