'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

export interface BusinessSection {
  id: string;
  label: string;
  content: ReactNode;
}

// Dónde va cada sección. La principal es la oferta de la categoría (servicios, productos o eventos).
// Escritorio: arriba Nosotros | Horario y Contáctanos; abajo la principal | Reseñas.
const MAIN = ['servicios', 'productos', 'eventos'];
const ASIDE = ['horario', 'contactanos'];

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
  const about = pick(['nosotros']);
  const main = pick(MAIN);
  const aside = pick(ASIDE);
  const reviews = pick(['resenas']);
  const twoColumns = aside.length > 0 || reviews.length > 0;
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

  const block = (section: BusinessSection, className = '') => (
    <div key={section.id} id={anchorId(section.id)} className={`scroll-mt-36 min-w-0 ${className}`}>
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

      {/* En celular se apilan en el orden de las pestañas; en escritorio cada bloque va a su celda. */}
      <div className={`max-w-7xl mx-auto px-4 pt-10 grid gap-x-10 gap-y-12 items-start ${twoColumns ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''}`}>
        {about.map((section) => block(section, 'lg:col-start-1 lg:row-start-1'))}
        {main.length > 0 && <div className="space-y-12 min-w-0 lg:col-start-1 lg:row-start-2">{main.map((section) => block(section))}</div>}
        {aside.length > 0 && <aside className="space-y-6 min-w-0 lg:col-start-2 lg:row-start-1">{aside.map((section) => block(section))}</aside>}
        {reviews.map((section) => block(section, 'lg:col-start-2 lg:row-start-2'))}
      </div>
    </div>
  );
}
