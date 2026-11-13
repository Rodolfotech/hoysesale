// Cookies y datos que el sitio guarda en el navegador. Los usan el aviso de cookies y la sección Cookies de la política de privacidad.
export interface StorageRow {
  name: string;
  owner: string;
  purpose: string;
  duration: string;
}

export const NECESSARY_COOKIES: StorageRow[] = [
  { name: 'access_token (cookie)', owner: 'HoySeSale', purpose: 'Mantiene tu sesión iniciada. Solo se crea si inicias sesión y no es accesible desde JavaScript.', duration: '7 días o hasta cerrar sesión' },
  { name: 'hss_consent (almacenamiento local)', owner: 'HoySeSale', purpose: 'Guarda tu elección sobre cookies, la versión de esta política y la fecha en que decidiste.', duration: '12 meses' },
  { name: 'draft:* y ui:* (almacenamiento de sesión)', owner: 'HoySeSale', purpose: 'Conserva lo que escribes en formularios y la pestaña abierta si recargas la página. Queda solo en tu navegador.', duration: 'Hasta cerrar la pestaña' },
  { name: 'hss_ev_* (almacenamiento local)', owner: 'HoySeSale', purpose: 'Copia temporal de los listados públicos de eventos para que carguen más rápido. No contiene datos personales.', duration: '10 minutos de validez' },
];

// Opcionales: cada grupo se carga solo con su consentimiento (src/lib/consent.ts).
export const MAPS_COOKIES: StorageRow[] = [
  { name: 'Cookies de Google Maps', owner: 'Google LLC (Estados Unidos)', purpose: 'Mostrar el mapa con la ubicación en el detalle de un evento. Al cargarlo, Google recibe tu dirección IP y puede instalar cookies propias.', duration: 'La que define Google' },
];

// Google Tag Manager carga Google Analytics y Microsoft Clarity. Si se agrega otra etiqueta en GTM, se agrega aquí y en la CSP.
export const ANALYTICS_COOKIES: StorageRow[] = [
  { name: 'Google Tag Manager', owner: 'Google LLC (Estados Unidos)', purpose: 'Carga las herramientas de analítica de esta lista. No instala cookies propias, pero Google recibe tu dirección IP.', duration: 'No aplica' },
  { name: '_ga y _ga_*', owner: 'Google LLC (Estados Unidos)', purpose: 'Google Analytics: un identificador aleatorio para contar visitas, páginas vistas y de dónde llegan, sin tu nombre ni tu correo.', duration: '2 años' },
  { name: '_clck y _clsk', owner: 'Microsoft Corporation (Estados Unidos)', purpose: 'Microsoft Clarity: un identificador aleatorio y la sesión, para ver de forma agregada cómo se usa el sitio (clics, desplazamientos y movimientos del puntero).', duration: '1 año y 1 día' },
  { name: 'CLID y MUID', owner: 'Microsoft Corporation (Estados Unidos)', purpose: 'Microsoft Clarity: reconocer el navegador entre visitas.', duration: '1 año' },
];
