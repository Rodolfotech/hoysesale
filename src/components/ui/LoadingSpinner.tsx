'use client';

interface LoadingSpinnerProps {
  color?: 'cyan' | 'pink' | 'purple';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const colorClasses = {
  cyan: 'border-neon-cyan',
  pink: 'border-neon-pink',
  purple: 'border-neon-purple',
};

const sizeClasses = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-2',
  lg: 'w-10 h-10 border-2',
};

export function LoadingSpinner({ color = 'pink', size = 'md', className = '' }: LoadingSpinnerProps) {
  return (
    <div
      className={`${sizeClasses[size]} ${colorClasses[color]} border-t-transparent rounded-full animate-spin ${className}`}
    />
  );
}
