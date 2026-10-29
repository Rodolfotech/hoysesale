'use client';

import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';
import type { BusinessEvent } from '@/lib/business';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { CountdownBoxes } from '../../components/ui/CountdownBoxes';
import { EmptyState } from '../../components/ui/EmptyState';
import { whatsappLink } from './format';

interface EventsCountdownProps {
  events: BusinessEvent[];
  businessName: string;
  whatsapp: string | null;
}

// Próximos eventos con cuenta regresiva y reserva por WhatsApp.
export function EventsCountdown({ events, businessName, whatsapp }: EventsCountdownProps) {
  if (events.length === 0) {
    return <EmptyState>No hay eventos especiales programados para estos días. ¡Visítanos en nuestro horario habitual!</EmptyState>;
  }

  return (
    <ul className="space-y-5">
      {events.map((ev) => {
        const date = new Date(ev.date);
        return (
          <li key={ev.id} className="relative rounded-3xl overflow-hidden text-white min-h-[320px] flex">
            {ev.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={ev.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 bg-brand-dark" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
            <div className="relative p-6 flex flex-col justify-end gap-3 w-full">
              <div className="flex flex-wrap gap-2">
                {ev.entryType === 'GRATIS' && <Badge tone="glass">Entrada gratis</Badge>}
                {ev.indoor && <Badge tone="glass">Bajo techo</Badge>}
              </div>
              <h3 className="text-2xl font-semibold leading-tight">{ev.title}</h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm opacity-90">
                <span className="inline-flex items-center gap-1.5"><Calendar className="w-4 h-4" aria-hidden="true" />{format(date, "d 'de' MMMM", { locale: es })}</span>
                <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4" aria-hidden="true" />{format(date, 'HH:mm')} hs</span>
                {ev.address && <span className="inline-flex items-center gap-1.5"><MapPin className="w-4 h-4" aria-hidden="true" />{ev.address}</span>}
              </div>
              <div className="flex items-end justify-between gap-3 flex-wrap">
                <CountdownBoxes to={date} />
                {whatsapp && (
                  <Button href={whatsappLink(whatsapp, `Hola, quiero reservar cupo en ${ev.title} de ${businessName}`)} target="_blank">
                    Reservar cupo
                  </Button>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
