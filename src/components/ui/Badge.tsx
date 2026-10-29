import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'light' | 'glass' | 'brand';
  className?: string;
}

const tones = {
  light: 'bg-brand-white text-brand-dark shadow-sm',
  glass: 'bg-white/20 text-white backdrop-blur-sm',
  brand: 'bg-brand-blue/10 text-brand-blue',
};

// Etiqueta pequeña (tipo de producto, insignias de evento, comodidades).
export function Badge({ children, tone = 'light', className = '' }: BadgeProps) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]} ${className}`}>{children}</span>;
}
