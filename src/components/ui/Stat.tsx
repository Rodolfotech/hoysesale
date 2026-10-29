import type { ReactNode } from 'react';

interface StatProps {
  label: string;
  value: ReactNode;
  tone?: 'light' | 'dark';
}

// Dato resumido: etiqueta pequeña y valor destacado. `tone="dark"` para fondos oscuros o imágenes.
export function Stat({ label, value, tone = 'light' }: StatProps) {
  return (
    <div className={tone === 'dark' ? 'text-white' : 'text-brand-dark'}>
      <p className={`text-[11px] uppercase tracking-wider ${tone === 'dark' ? 'opacity-75' : 'text-brand-dark/60'}`}>{label}</p>
      <p className="text-base font-semibold">{value}</p>
    </div>
  );
}
