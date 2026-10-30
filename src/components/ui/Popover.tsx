'use client';

import { useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';

interface PopoverProps {
  // Nombre accesible del botón (por ejemplo, "Ver tamaño recomendado").
  label: string;
  children: ReactNode;
  icon?: ReactNode;
}

// Botón que muestra u oculta un cuadro con información. Se cierra con clic afuera o con Escape.
export function Popover({ label, children, icon }: PopoverProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const contentId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      // Dentro de un modal, Escape cierra solo el popover.
      event.stopPropagation();
      setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full"
        style={{ color: '#2563EB' }}
      >
        {icon ?? <Info className="w-4 h-4" aria-hidden="true" />}
      </button>
      {open && (
        <div
          id={contentId}
          role="dialog"
          aria-label={label}
          className="absolute left-0 z-50 mt-2 w-64 rounded-xl p-3 text-xs shadow-lg"
          style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA', color: '#1D1D1F' }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
