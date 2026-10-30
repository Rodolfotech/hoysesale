'use client';

import { useId, type ReactNode } from 'react';
import { usePersistentState } from '@/hooks/usePersistentState';

export interface SectionTab {
  id: string;
  label: string;
  content: ReactNode;
}

interface SectionTabsProps {
  panels: SectionTab[];
  storageKey: string;
  defaultId?: string;
  hiddenIds?: string[]; // pestañas que no se muestran
  footer?: ReactNode; // contenido común debajo de cada pestaña
  footerHiddenOn?: string; // pestaña donde no se repite ese contenido
}

// Pestañas de la página del negocio. Solo se ve el contenido de la pestaña activa; el resto queda en el HTML
// (con el atributo hidden) para que el contenido siga siendo indexable. La pestaña activa sobrevive a las recargas.
export function SectionTabs({ panels, storageKey, defaultId, hiddenIds = [], footer, footerHiddenOn }: SectionTabsProps) {
  const visible = panels.filter((panel) => !hiddenIds.includes(panel.id));
  // Pestaña al entrar por primera vez: si la elegida está oculta, la primera visible.
  const initial = visible.some((panel) => panel.id === defaultId) ? defaultId : visible[0]?.id;
  const [stored, setActive] = usePersistentState(storageKey, initial);
  // Si la pestaña guardada ya no existe o está oculta, se vuelve a la inicial.
  const active = visible.some((panel) => panel.id === stored) ? stored : initial;
  const baseId = useId();

  return (
    <div>
      <nav aria-label="Secciones de la página" className="sticky top-0 z-30 bg-brand-neutral-1 border-b border-brand-neutral-2">
        <div role="tablist" className="flex gap-2 overflow-x-auto px-4 py-3 max-w-7xl mx-auto">
          {visible.map((panel) => {
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

      <div className="max-w-7xl mx-auto px-4 pt-10">
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
        {footer && active !== footerHiddenOn && <div className="mt-6">{footer}</div>}
      </div>
    </div>
  );
}
