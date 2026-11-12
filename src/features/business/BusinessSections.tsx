'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface BusinessSection {
  id: string;
  label: string;
  content: ReactNode;
}

// Dónde va cada sección. La principal es la oferta de la categoría (servicios, productos o eventos).
const MAIN = ['servicios', 'productos', 'eventos'];
const PAIR = ['nosotros', 'resenas']; // debajo de la principal, en dos columnas
const ASIDE = ['horario', 'contactanos']; // columna derecha
// Orden de las pestañas, para el visitante y el dueño: Nosotros, la principal, Horario, Contáctanos y Reseñas.
export const TAB_ORDER = ['nosotros', ...MAIN, 'horario', 'contactanos', 'resenas'];

const anchorId = (id: string) => `seccion-${id}`;

interface BusinessSectionsProps {
  sections: BusinessSection[];
  hiddenIds: string[]; // secciones que no se muestran
}

// Secciones del micro-sitio en una sola página. La barra de pestañas lleva a cada sección y marca la que se está viendo.
export function BusinessSections({ sections, hiddenIds }: BusinessSectionsProps) {
  const visible = sections.filter((section) => !hiddenIds.includes(section.id));
  const nav = TAB_ORDER.map((id) => visible.find((section) => section.id === id)).filter((s): s is BusinessSection => !!s);
  const pick = (ids: string[]) => ids.map((id) => visible.find((section) => section.id === id)).filter((s): s is BusinessSection => !!s);
  const main = pick(MAIN);
  const pair = pick(PAIR);
  const aside = pick(ASIDE);
  const [active, setActive] = useState(nav[0]?.id);
  const navKey = nav.map((section) => section.id).join(',');
  const locked = useRef(false); // tras un clic, la sección elegida queda marcada mientras se desplaza

  // Marca en la barra la sección que ocupa la parte alta de la pantalla.
  useEffect(() => {
    const elements = navKey.split(',').map((id) => document.getElementById(anchorId(id))).filter((el): el is HTMLElement => !!el);
    const observer = new IntersectionObserver(
      (entries) => {
        const top = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (top && !locked.current) setActive(top.target.id.replace('seccion-', ''));
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [navKey]);

  const go = (id: string) => {
    locked.current = true;
    window.setTimeout(() => { locked.current = false; }, 1000);
    setActive(id);
    document.getElementById(anchorId(id))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const block = (section: BusinessSection) => (
    <div key={section.id} id={anchorId(section.id)} className="scroll-mt-36 min-w-0">
      {section.content}
    </div>
  );

  return (
    <div>
      <nav aria-label="Secciones de la página" className="sticky top-0 z-30 bg-brand-neutral-1 border-b border-brand-neutral-2">
        <ul className="flex gap-2 overflow-x-auto px-4 py-3 max-w-7xl mx-auto">
          {nav.map((section) => {
            const isActive = active === section.id;
            return (
              <li key={section.id}>
                <a
                  href={`#${anchorId(section.id)}`}
                  aria-current={isActive ? 'true' : undefined}
                  onClick={(e) => { e.preventDefault(); go(section.id); }}
                  className={`block whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${isActive ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-brand-neutral-2'}`}
                >
                  {section.label}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={`max-w-7xl mx-auto px-4 pt-10 grid gap-10 ${aside.length ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''}`}>
        <div className="space-y-12 min-w-0">
          {main.map(block)}
          {pair.length > 0 && <div className={`grid gap-8 ${pair.length > 1 ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]' : ''}`}>{pair.map(block)}</div>}
        </div>
        {aside.length > 0 && <aside className="space-y-6 min-w-0">{aside.map(block)}</aside>}
      </div>
    </div>
  );
}
