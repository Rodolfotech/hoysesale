'use client';

interface ErrorBannerProps {
  message: string;
  type?: 'error' | 'success' | 'warning';
  className?: string;
}

const styles = {
  error: 'bg-red-500/10 border-red-500/20 text-red-400',
  success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  warning: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
};

export function ErrorBanner({ message, type = 'error', className = '' }: ErrorBannerProps) {
  if (!message) return null;
  return (
    <div className={`${styles[type]} border p-3 rounded-xl mb-4 text-sm ${className}`}>
      {message}
    </div>
  );
}
