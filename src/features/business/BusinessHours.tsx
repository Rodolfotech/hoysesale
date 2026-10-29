'use client';

import { useState } from 'react';
import { BUSINESS_DAYS } from '@/constants/business';
import { WEEKEND_DAYS, chileNow, dayStatus, type ChileNow } from '@/lib/hours';

const OPTION_LABELS: Record<string, string> = { '-': '-', abierto: 'Abierto', cerrado: 'Cerrado' };

// "12:00-23:00" -> ["12:00", "23:00"]. Si el valor no es un horario, devuelve vacíos.
function splitRange(value: string): [string, string] {
  const match = value.match(/^(\d{2}:\d{2})-(\d{2}:\d{2})$/);
  return match ? [match[1], match[2]] : ['', ''];
}

// Un horario solo se guarda cuando tiene desde y hasta.
function joinRange(from: string, to: string): string {
  return from && to ? `${from}-${to}` : '';
}

interface DayRowProps {
  day: string;
  value: string;
  now: ChileNow;
  onChange: (value: string) => void;
}

function DayRow({ day, value, now, onChange }: DayRowProps) {
  const mode = value === 'abierto' || value === 'cerrado' ? value : '-';
  const [initialFrom, initialTo] = splitRange(value);
  // Las horas se guardan aunque el horario esté incompleto, para que no se borren al escribir.
  const [times, setTimes] = useState({ from: initialFrom, to: initialTo });
  const options = WEEKEND_DAYS.includes(day) ? ['-', 'abierto', 'cerrado'] : ['-', 'abierto'];
  const editable = mode === '-';

  const setFrom = (from: string) => {
    setTimes((prev) => ({ ...prev, from }));
    onChange(joinRange(from, times.to));
  };
  const setTo = (to: string) => {
    setTimes((prev) => ({ ...prev, to }));
    onChange(joinRange(times.from, to));
  };

  return (
    <div className="grid grid-cols-[76px_1fr_1fr_104px_84px] items-center gap-2">
      <span className="text-xs capitalize" style={{ color: '#1D1D1F' }}>{day}</span>
      <input
        type="time"
        lang="en-GB"
        step={60}
        value={times.from}
        disabled={!editable}
        onChange={(e) => setFrom(e.target.value)}
        aria-label={`Desde, ${day}`}
        className="px-2 py-1.5 rounded-lg text-xs light-form disabled:opacity-50"
      />
      <input
        type="time"
        lang="en-GB"
        step={60}
        value={times.to}
        disabled={!editable}
        onChange={(e) => setTo(e.target.value)}
        aria-label={`Hasta, ${day}`}
        className="px-2 py-1.5 rounded-lg text-xs light-form disabled:opacity-50"
      />
      <select
        value={mode}
        onChange={(e) => {
          const next = e.target.value;
          onChange(next === '-' ? joinRange(times.from, times.to) : next);
        }}
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
}

// Horarios de la semana: desde y hasta en formato de 24 horas, y un desplegable (-, Abierto; sábado y domingo también Cerrado).
// El estado se calcula con la hora de Chile cuando hay horario y el desplegable está en "-".
export function BusinessHours({ hours, onChange }: { hours: Record<string, string>; onChange: (next: Record<string, string>) => void }) {
  const now = chileNow();

  return (
    <div className="space-y-2">
      {BUSINESS_DAYS.map((day) => (
        <DayRow
          key={day}
          day={day}
          value={(hours[day] ?? '').trim()}
          now={now}
          onChange={(value) => onChange({ ...hours, [day]: value })}
        />
      ))}
    </div>
  );
}
