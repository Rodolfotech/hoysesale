'use client';

import { useEffect, useState } from 'react';
import { getBusinessStatus, type BusinessHours, type BusinessStatus } from '@/lib/hours';

const DOT_COLORS: Record<BusinessStatus['state'], string> = {
  open: '#16A34A',
  closed: '#DC2626',
  unavailable: '#9CA3AF',
};

interface BusinessStatusBadgeProps {
  hours: BusinessHours | null | undefined;
  // Agrega el horario de hoy debajo del estado.
  showToday?: boolean;
}

// Estado del negocio en este momento. Se calcula en el navegador y se actualiza cada minuto;
// en el servidor no se muestra, porque esa página puede quedar guardada y mostrar un estado viejo.
export function BusinessStatusBadge({ hours, showToday = false }: BusinessStatusBadgeProps) {
  const [status, setStatus] = useState<BusinessStatus | null>(null);

  useEffect(() => {
    const update = () => setStatus(getBusinessStatus(hours));
    const first = setTimeout(update, 0);
    const timer = setInterval(update, 60_000);
    return () => {
      clearTimeout(first);
      clearInterval(timer);
    };
  }, [hours]);

  if (!status) return null;

  return (
    <div>
      <p className="inline-flex items-center gap-2 text-sm font-medium">
        <span aria-hidden="true" className="w-2 h-2 rounded-full" style={{ backgroundColor: DOT_COLORS[status.state] }} />
        {status.label}
        {status.detail && <span className="font-normal opacity-80">· {status.detail}</span>}
      </p>
      {showToday && <p className="text-sm mt-1 opacity-70 first-letter:uppercase">{status.today}</p>}
    </div>
  );
}
