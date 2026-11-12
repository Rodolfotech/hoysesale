'use client';

import { useEffect, useId, useRef, useState } from 'react';

// Descripción de Nosotros para el visitante: muestra unas líneas y "Ver más" despliega todo.
// El texto completo va siempre en el HTML (lo leen buscadores y lectores de pantalla).
export function AboutText({ paragraphs }: { paragraphs: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const [open, setOpen] = useState(false);
  const [overflows, setOverflows] = useState(false);

  // El botón solo aparece si el texto no cabe en el espacio recortado.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setOverflows(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  if (paragraphs.length === 0) return null;

  return (
    <div>
      <div id={id} ref={ref} className={`space-y-3 ${open ? '' : 'max-h-[6.5rem] overflow-hidden'} ${!open && overflows ? '[mask-image:linear-gradient(to_bottom,black_60%,transparent)]' : ''}`}>
        {paragraphs.map((p, i) => (
          <p key={i} className="text-base leading-relaxed">{p}</p>
        ))}
      </div>
      {(overflows || open) && (
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)} className="mt-2 text-sm font-semibold underline text-brand-blue cursor-pointer">
          {open ? 'Ver menos' : 'Ver más'}
        </button>
      )}
    </div>
  );
}
