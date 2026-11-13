// Google Tag Manager. El contenedor carga Google Analytics y Microsoft Clarity (se configuran en el panel de GTM).
// Cada etiqueta nueva en GTM necesita su dominio en la CSP (next.config.ts) y sus cookies en src/lib/cookie-list.ts.
export const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-5FGKKZNT';
export const GTM_SRC = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;

// Cookies propias que dejan Google Analytics y Clarity: se borran si el visitante retira el consentimiento.
export const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_gat', '_clck', '_clsk'];
