'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useConsent } from '@/hooks/useConsent';
import { onOpenCookieSettings, saveConsent } from '@/lib/consent';
import { Link } from '@/lib/router';

// Aviso de cookies (Ley 21.719, arts. 12 y 14 ter): nada opcional se carga antes de elegir, aceptar y rechazar pesan lo mismo
// y cada finalidad se autoriza por separado. El detalle técnico (nombres y duración) está en la Política de privacidad.
export default function CookieBanner() {
  const { ready, consent } = useConsent();
  const [reopened, setReopened] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [maps, setMaps] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => onOpenCookieSettings(() => {
    setMaps(consent?.maps ?? false);
    setAnalytics(consent?.analytics ?? false);
    setShowSettings(true);
    setReopened(true);
  }), [consent]);

  if (!ready || (consent && !reopened)) return null;

  const choose = (choice: { maps: boolean; analytics: boolean }) => {
    saveConsent(choice);
    setReopened(false);
    setShowSettings(false);
  };

  return (
    <div
      role="region"
      aria-labelledby="cookies-titulo"
      className="fixed inset-x-4 bottom-4 z-[60] mx-auto max-w-3xl rounded-2xl p-5 shadow-lg"
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}
    >
      <p id="cookies-titulo" className="text-base font-semibold mb-1" style={{ color: '#1D1D1F' }}>Tu privacidad en HoySeSale</p>
      <p className="text-sm" style={{ color: '#1D1D1F99' }}>
        Utilizamos cookies necesarias para el funcionamiento del sitio. Con tu autorización, utilizaremos además cookies de
        terceros para mostrar mapas y para analizar el uso del sitio. No utilizamos cookies con fines publicitarios. Puedes
        aceptarlas, rechazarlas o elegir por finalidad, y retirar tu consentimiento en cualquier momento desde
        &ldquo;Configurar cookies&rdquo;, al pie de la página.{' '}
        <Link to="/privacidad#cookies" className="underline" style={{ color: '#2563EB' }}>Más información en la Política de privacidad</Link>
      </p>

      {showSettings && (
        <ul className="mt-4 space-y-4 rounded-xl p-4 max-h-[45vh] overflow-y-auto" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
          <li>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>Necesarias</p>
              <span className="text-xs font-medium" style={{ color: '#16A34A' }}>Siempre activas</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Permiten el funcionamiento básico del sitio, como mantener tu sesión iniciada y recordar tus preferencias de privacidad. Son indispensables para prestar el servicio que solicitas, por lo que no pueden desactivarse.</p>
          </li>
          <li>
            <Switch label="Mapas" checked={maps} onChange={setMaps} />
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Permiten mostrar la ubicación de los eventos en un mapa. Este servicio es prestado por Google LLC, que recibe tu dirección IP y puede almacenarla en Estados Unidos.</p>
          </li>
          <li>
            <Switch label="Analítica" checked={analytics} onChange={setAnalytics} />
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Permiten conocer cómo se utiliza el sitio, como las páginas visitadas y la interacción con ellas, con el fin de mejorarlo. Estos servicios son prestados por Google LLC y Microsoft Corporation, que reciben tu dirección IP y datos de navegación y pueden almacenarlos en Estados Unidos.</p>
          </li>
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        {showSettings ? (
          <Button variant="ghost" onClick={() => choose({ maps, analytics })}>Guardar preferencias</Button>
        ) : (
          <Button variant="ghost" onClick={() => { setMaps(false); setAnalytics(false); setShowSettings(true); }}>Configurar</Button>
        )}
        <Button variant="outline" onClick={() => choose({ maps: false, analytics: false })}>Rechazar</Button>
        <Button variant="outline" onClick={() => choose({ maps: true, analytics: true })}>Aceptar</Button>
      </div>
    </div>
  );
}
