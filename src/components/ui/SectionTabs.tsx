'use client';

import { useEffect, useState } from 'react';

interface SectionTabsProps {
  tabs: { id: string; label: string }[];
  /** Separación superior de la barra fija (px) para que no tape el encabezado global. */
  offset?: number;
}

// Pestañas fijas que enlazan a secciones de la misma página y resaltan la visible (scroll-spy).
export function SectionTabs({ tabs, offset = 140 }: SectionTabsProps) {
  const [active, setActive] = useState(tabs[0]?.id);

  useEffect(() => {
    const sections = tabs
      .map((t) => document.getElementById(t.id))
      .filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: `-${offset}px 0px -60% 0px` },
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [tabs, offset]);

  return (
    <nav aria-label="Secciones de la página" className="sticky top-0 z-30 bg-brand-neutral-1 border-b border-brand-neutral-2">
      <ul className="flex gap-2 overflow-x-auto px-4 py-3 max-w-5xl mx-auto">
        {tabs.map((t) => {
          const isActive = active === t.id;
          return (
            <li key={t.id}>
              <a
                href={`#${t.id}`}
                aria-current={isActive ? 'location' : undefined}
                onClick={() => setActive(t.id)}
                className={`block whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium ${isActive ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-brand-neutral-2'}`}
              >
                {t.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
