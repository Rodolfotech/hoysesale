'use client';

import type { ReactNode } from 'react';

interface ChipProps {
  active?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

// Chip seleccionable (filtros). Usa aria-pressed para lectores de pantalla.
export function Chip({ active = false, onClick, children }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`px-3.5 py-1.5 rounded-full text-xs font-medium cursor-pointer transition focus-visible:outline-2 ${
        active ? 'bg-brand-blue text-white' : 'bg-brand-white text-brand-dark border border-brand-neutral-2 hover:bg-brand-neutral-1'
      }`}
    >
      {children}
    </button>
  );
}

interface ChipGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

// Grupo de chips con nombre accesible.
export function ChipGroup({ label, children, className = '' }: ChipGroupProps) {
  return (
    <div role="group" aria-label={label} className={`flex flex-wrap gap-2 ${className}`}>
      {children}
    </div>
  );
}
