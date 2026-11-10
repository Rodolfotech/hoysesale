'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string; // también es el ancla: /pagina#id abre esta sección
  title: string;
  content: ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  indexTitle?: string; // con título, muestra un índice lateral que abre cada sección
  intro?: ReactNode; // texto sobre las secciones
}

// Secciones numeradas que se abren y cierran. Varias pueden quedar abiertas a la vez.
export function Accordion({ items, indexTitle, intro }: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set());

  const show = (id: string) => {
    setOpen((prev) => new Set(prev).add(id));
    requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  // Abre la sección del ancla de la URL, al cargar y cuando cambia.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (items.some((item) => item.id === id)) show(id);
    };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [items]);

  const toggle = (id: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sections = (
    <div className="space-y-3">
      {intro}
      {items.map((item, index) => {
        const isOpen = open.has(item.id);
        return (
          <section key={item.id} id={item.id} className="scroll-mt-24 rounded-xl bg-white" style={{ border: '1px solid #E4EBFA' }}>
            <h2 style={{ fontSize: '15px', lineHeight: '22px', fontWeight: 600, fontFamily: 'inherit' }}>
              <button
                type="button"
                onClick={() => toggle(item.id)}
                aria-expanded={isOpen}
                aria-controls={`${item.id}-contenido`}
                className="w-full flex items-center gap-3 px-4 py-4 text-left cursor-pointer"
                style={{ color: '#1D1D1F' }}
              >
                <span className="w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-semibold text-white" style={{ backgroundColor: '#2563EB' }}>
                  {index + 1}
                </span>
                <span className="flex-1">{item.title}</span>
                <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{ color: '#1D1D1F99' }} aria-hidden="true" />
              </button>
            </h2>
            <div id={`${item.id}-contenido`} hidden={!isOpen} className="px-4 pb-5 sm:pl-14">
              {item.content}
            </div>
          </section>
        );
      })}
    </div>
  );

  if (!indexTitle) return sections;

  return (
    <div className="grid gap-8 md:grid-cols-[200px_1fr]">
      <nav aria-label={indexTitle} className="hidden md:block">
        <div className="sticky top-24">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: '#1D1D1F' }}>{indexTitle}</p>
          <ol className="space-y-2.5">
            {items.map((item, index) => (
              <li key={item.id} className="flex gap-3 text-xs">
                <span className="w-4 shrink-0 text-right" style={{ color: '#1D1D1F66' }}>{index + 1}</span>
                <a
                  href={`#${item.id}`}
                  onClick={(e) => { e.preventDefault(); history.replaceState(null, '', `#${item.id}`); show(item.id); }}
                  className="transition-colors hover:!text-[#2563EB]"
                  style={{ color: '#1D1D1F99' }}
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>
      {sections}
    </div>
  );
}
