import type { ReactNode } from 'react';

// Mensaje cuando una lista no tiene elementos. Acepta una acción opcional.
export function EmptyState({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="rounded-2xl bg-brand-white p-6 text-center text-sm text-brand-dark/60 space-y-3">
      <p>{children}</p>
      {action}
    </div>
  );
}
