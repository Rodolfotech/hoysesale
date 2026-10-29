import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'form' | 'li';
  children: ReactNode;
  tone?: 'default' | 'accent';
  padding?: 'none' | 'sm' | 'md';
  className?: string;
}

const paddings = { none: '', sm: 'p-4', md: 'p-6' };

// Superficie blanca con borde suave. `tone="accent"` la pinta de azul de marca.
export function Card({ as: Tag = 'div', children, tone = 'default', padding = 'md', className = '', ...rest }: CardProps) {
  const toneClasses = tone === 'accent' ? 'bg-brand-blue text-white border-transparent' : 'bg-brand-white text-brand-dark border-brand-neutral-2';
  return (
    <Tag className={`rounded-2xl border ${toneClasses} ${paddings[padding]} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}
