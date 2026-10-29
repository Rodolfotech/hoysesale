'use client';

import type { LucideIcon } from 'lucide-react';

interface SectionHeadingProps {
  icon?: LucideIcon;
  children: string;
  className?: string;
}

export function SectionHeading({ icon: Icon, children, className = '' }: SectionHeadingProps) {
  return (
    <h2
      className={`text-2xl font-bold tracking-tight mb-6 flex items-center gap-2 ${className}`}
      style={{ color: '#1D1D1F' }}
    >
      {Icon && <Icon className="w-5 h-5" style={{ color: '#2563EB' }} />}
      {children}
    </h2>
  );
}
