'use client';

import type { ReactNode } from 'react';

interface SwitchProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  info?: ReactNode; // botón de información junto al nombre; va fuera del interruptor
}

// Interruptor de encendido y apagado.
export function Switch({ label, checked, onChange, disabled = false, info }: SwitchProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className="relative w-10 h-6 shrink-0 rounded-full transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ backgroundColor: checked ? '#2563EB' : '#CBD5E1' }}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : ''}`} />
      </button>
      <span className="text-sm">{label}</span>
      {info}
    </div>
  );
}
