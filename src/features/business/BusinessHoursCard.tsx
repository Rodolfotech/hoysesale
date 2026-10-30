import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { BUSINESS_DAYS } from '@/constants/business';
import { hoursText, type BusinessHours } from '@/lib/hours';
import { BusinessStatusBadge } from './BusinessStatusBadge';

// Estado actual y horario de la semana. Sin 'use client': se usa desde la página del negocio.
export function BusinessHoursCard({ hours, action }: { hours: BusinessHours | null | undefined; action?: ReactNode }) {
  return (
    <Card padding="sm" className="p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="font-semibold">Horario de atención</h3>
        {action}
      </div>
      <BusinessStatusBadge hours={hours} showToday />
      <ul className="space-y-1.5 mt-3">
        {BUSINESS_DAYS.map((d) => (
          <li key={d} className="flex justify-between gap-4">
            <span className="capitalize text-brand-dark/60">{d}</span>
            <span>{hoursText(hours?.[d])}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
