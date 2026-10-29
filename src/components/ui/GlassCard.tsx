'use client';

import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glow?: 'cyan' | 'purple' | 'pink';
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export function GlassCard({ children, className = '', padding = 'lg' }: GlassCardProps) {
  return (
    <div
      className={`rounded-2xl shadow-sm ${paddingClasses[padding]} ${className}`}
      style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}
    >
      {children}
    </div>
  );
}
