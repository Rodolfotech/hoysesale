'use client';

import type { LucideIcon } from 'lucide-react';

interface GradientButtonProps {
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: LucideIcon;
  children: string;
  gradient?: 'cyan-purple' | 'purple-pink' | 'pink-purple';
  className?: string;
  fullWidth?: boolean;
}

export function GradientButton({
  onClick,
  type = 'button',
  disabled,
  loading,
  loadingText,
  icon: Icon,
  children,
  className = '',
  fullWidth = true,
}: GradientButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${fullWidth ? 'w-full' : ''} flex items-center justify-center gap-2 py-2.5 rounded-xl text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer ${className}`}
      style={{ backgroundColor: '#2563EB', fontSize: '14px' }}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {loading ? (loadingText || 'Procesando...') : children}
    </button>
  );
}
