'use client';

import { MapPin } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useConsent } from '@/hooks/useConsent';
import { saveConsent } from '@/lib/consent';

interface EventMapProps {
  url: string;
  title: string;
}

// Mapa de Google incrustado. La política de seguridad de next.config.ts permite este origen.
// Google puede instalar cookies: el mapa solo se carga con el consentimiento del visitante.
export function EventMap({ url, title }: EventMapProps) {
  const { ready, consent } = useConsent();

  if (ready && consent?.maps) {
    return (
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
        <iframe src={url} title={`Mapa de ${title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block w-full h-72 border-0" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl h-72 flex flex-col items-center justify-center gap-3 px-6 text-center" style={{ border: '1px solid #E4EBFA', backgroundColor: '#F8FAFC' }}>
      {ready && (
        <>
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            <MapPin className="w-5 h-5" style={{ color: '#2563EB' }} aria-hidden="true" />
          </div>
          <p className="text-sm max-w-md" style={{ color: '#1D1D1F99' }}>
            El mapa se muestra con Google Maps, que puede instalar sus propias cookies. Solo lo cargamos si lo aceptas.
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button size="sm" onClick={() => saveConsent({ maps: true })}>Aceptar y ver mapa</Button>
            <Button size="sm" variant="outline" href={url.replace('&output=embed', '')} target="_blank">Abrir en Google Maps</Button>
          </div>
        </>
      )}
    </div>
  );
}
