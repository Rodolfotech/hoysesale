'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { useConsent } from '@/hooks/useConsent';
import { onOpenCookieSettings, saveConsent } from '@/lib/consent';
import { ANALYTICS_COOKIES, MAPS_COOKIES, NECESSARY_COOKIES, type StorageRow } from '@/lib/cookie-list';
import { Link } from '@/lib/router';

// Cookies de una categoría: nombre, para qué sirve y cuánto dura.
function CookieList({ rows }: { rows: StorageRow[] }) {
  return (
    <ul className="mt-2 space-y-1.5 border-l-2 pl-3" style={{ borderColor: '#E4EBFA' }}>
      {rows.map((row) => (
        <li key={row.name} className="text-xs" style={{ color: '#1D1D1F99' }}>
          <span className="font-medium" style={{ color: '#1D1D1F' }}>{row.name}</span> · {row.duration}
          <span className="block">{row.purpose}</span>
        </li>
      ))}
    </ul>
  );
}

// Aviso de cookies (Ley 21.719): nada opcional se carga antes de elegir, y aceptar y rechazar pesan lo mismo.
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
        Usamos cookies necesarias para que el sitio funcione, por ejemplo para mantener tu sesión. Con tu permiso, también
        mostramos mapas de Google Maps y medimos cómo se usa el sitio con Google Analytics y Microsoft Clarity, que
        instalan sus propias cookies. No usamos cookies de publicidad. Puedes cambiar tu decisión cuando quieras desde
        &ldquo;Configurar cookies&rdquo;, al pie de la página.{' '}
        <Link to="/privacidad#cookies" className="underline" style={{ color: '#2563EB' }}>Ver cookies en la Política de privacidad</Link>
      </p>

      {showSettings && (
        <ul className="mt-4 space-y-4 rounded-xl p-4 max-h-[45vh] overflow-y-auto" style={{ backgroundColor: '#F8FAFC', border: '1px solid #E4EBFA' }}>
          <li>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>Necesarias</p>
              <span className="text-xs font-medium" style={{ color: '#16A34A' }}>Siempre activas</span>
            </div>
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Sesión iniciada, borradores de formularios y tu elección sobre cookies.</p>
            <CookieList rows={NECESSARY_COOKIES} />
          </li>
          <li>
            <Switch label="Mapas de Google Maps" checked={maps} onChange={setMaps} />
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Muestra la ubicación en el detalle de los eventos. Google recibe tu dirección IP y puede instalar cookies.</p>
            <CookieList rows={MAPS_COOKIES} />
          </li>
          <li>
            <Switch label="Analítica" checked={analytics} onChange={setAnalytics} />
            <p className="text-xs mt-0.5" style={{ color: '#1D1D1F99' }}>Nos ayuda a saber qué páginas se visitan y cómo se usa el sitio, para mejorarlo. Google y Microsoft reciben tu dirección IP y datos de navegación.</p>
            <CookieList rows={ANALYTICS_COOKIES} />
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
