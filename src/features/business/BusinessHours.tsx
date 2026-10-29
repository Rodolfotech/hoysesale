'use client';

import { BUSINESS_DAYS } from '@/constants/business';
import { WEEKEND_DAYS, chileNow, dayStatus, formatRangeInput, parseRange } from '@/lib/hours';

const OPTION_LABELS: Record<string, string> = { '-': '-', abierto: 'Abierto', cerrado: 'Cerrado' };

// Horarios de la semana: un horario por día y un desplegable (-, Abierto; sábado y domingo también Cerrado).
// El estado se calcula con la hora de Chile cuando hay horario y el desplegable está en "-".
export function BusinessHours({ hours, onChange }: { hours: Record<string, string>; onChange: (next: Record<string, string>) => void }) {
  const now = chileNow();

  return (
    <div className="space-y-2">
      {BUSINESS_DAYS.map((day) => {
        const value = (hours[day] ?? '').trim();
        const mode = value === 'abierto' || value === 'cerrado' ? value : '-';
        const range = parseRange(value) || value.includes('-') ? value : '';
        const options = WEEKEND_DAYS.includes(day) ? ['-', 'abierto', 'cerrado'] : ['-', 'abierto'];
        const setValue = (next: string) => onChange({ ...hours, [day]: next });

        return (
          <div key={day} className="grid grid-cols-[76px_1fr_104px_84px] items-center gap-2">
            <span className="text-xs capitalize" style={{ color: '#1D1D1F' }}>{day}</span>
            <input
              value={range}
              disabled={mode !== '-'}
              onChange={(e) => setValue(formatRangeInput(e.target.value))}
              placeholder="12:00-23:00"
              inputMode="numeric"
              aria-label={`Horario de ${day}`}
              className="px-2 py-1.5 rounded-lg text-xs light-form disabled:opacity-50"
            />
            <select
              value={mode}
              onChange={(e) => setValue(e.target.value === '-' ? '' : e.target.value)}
              aria-label={`Estado de ${day}`}
              className="px-2 py-1.5 rounded-lg text-xs light-form"
            >
              {options.map((option) => (
                <option key={option} value={option}>{OPTION_LABELS[option]}</option>
              ))}
            </select>
            <span className="text-xs text-right" style={{ color: '#1D1D1F99' }}>{dayStatus(value, day, now)}</span>
          </div>
        );
      })}
    </div>
  );
}
