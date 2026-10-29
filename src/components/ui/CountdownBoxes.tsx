'use client';

import { useCountdown } from '../../hooks/useCountdown';

// Cuenta regresiva en cajas (días, horas, minutos, segundos) para una fecha.
export function CountdownBoxes({ to, tone = 'glass' }: { to: Date; tone?: 'glass' | 'light' }) {
  const left = useCountdown(to);
  const units = [
    { value: left.days, label: 'días' },
    { value: left.hours, label: 'hrs' },
    { value: left.minutes, label: 'min' },
    { value: left.seconds, label: 'seg' },
  ];
  const box = tone === 'glass' ? 'bg-white/15 backdrop-blur-sm text-white' : 'bg-brand-neutral-1 text-brand-dark';

  return (
    <div className="flex gap-2" role="timer" aria-label="Tiempo restante">
      {units.map((u) => (
        <div key={u.label} className={`flex flex-col items-center rounded-xl px-3 py-2 min-w-[60px] ${box}`} aria-label={`${u.value} ${u.label}`}>
          <span className="text-xl font-semibold tabular-nums">{String(u.value).padStart(2, '0')}</span>
          <span className="text-[10px] uppercase tracking-wider opacity-80">{u.label}</span>
        </div>
      ))}
    </div>
  );
}
