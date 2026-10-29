'use client';

import { useId, useState, type ReactNode } from 'react';

export interface SectionTab {
  id: string;
  label: string;
  content: ReactNode;
}

// Pestañas de la página del negocio. Solo se ve el contenido de la pestaña activa; el resto queda en el HTML
// (con el atributo hidden) para que el contenido siga siendo indexable.
export function SectionTabs({ panels }: { panels: SectionTab[] }) {
  const [active, setActive] = useState(panels[0]?.id);
  const baseId = useId();

  return (
    <div>
      <nav aria-label="Secciones de la página" className="sticky top-0 z-30 bg-brand-neutral-1 border-b border-brand-neutral-2">
        <div role="tablist" className="flex gap-2 overflow-x-auto px-4 py-3 max-w-5xl mx-auto">
          {panels.map((panel) => {
            const isActive = active === panel.id;
            return (
              <button
                key={panel.id}
                type="button"
                role="tab"
                id={`${baseId}-${panel.id}-tab`}
                aria-selected={isActive}
                aria-controls={`${baseId}-${panel.id}-panel`}
                onClick={() => setActive(panel.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium cursor-pointer ${isActive ? 'bg-brand-dark text-white' : 'text-brand-dark hover:bg-brand-neutral-2'}`}
              >
                {panel.label}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 pt-10">
        {panels.map((panel) => (
          <div
            key={panel.id}
            role="tabpanel"
            id={`${baseId}-${panel.id}-panel`}
            aria-labelledby={`${baseId}-${panel.id}-tab`}
            hidden={active !== panel.id}
          >
            {panel.content}
          </div>
        ))}
      </div>
    </div>
  );
}
