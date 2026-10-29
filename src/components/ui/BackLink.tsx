'use client';

import { Link } from '@/lib/router';
import { ArrowLeft } from 'lucide-react';

interface BackLinkProps {
  to: string;
  children?: string;
  className?: string;
}

export function BackLink({ to, children = 'Volver', className = '' }: BackLinkProps) {
  return (
    <Link
      to={to}
      className={`inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6 transition-colors ${className}`}
    >
      <ArrowLeft className="w-4 h-4" />
      {children}
    </Link>
  );
}
