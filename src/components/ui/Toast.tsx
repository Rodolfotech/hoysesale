'use client';

import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type, visible, onClose, duration = 4000 }: ToastProps) {
  useEffect(() => {
    if (visible && duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  const bg = type === 'success' ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-red-500/20 border-red-500/30';
  const text = type === 'success' ? 'text-emerald-400' : 'text-red-400';
  const Icon = type === 'success' ? CheckCircle : AlertCircle;

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl border ${bg} backdrop-blur-md shadow-lg max-w-sm animate-fade-in`}>
      <Icon className={`w-5 h-5 ${text} shrink-0`} />
      <p className={`text-sm ${text}`}>{message}</p>
      <button onClick={onClose} className="ml-2 text-gray-500 hover:text-white cursor-pointer shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
