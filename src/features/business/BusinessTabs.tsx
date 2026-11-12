'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { useRefresh } from '@/hooks/useRefresh';
import type { HideableTab } from '@/lib/business';
import { businessApi } from '../../api';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { BusinessSections, TAB_ORDER, type BusinessSection } from './BusinessSections';
import { useIsOwner } from './useIsOwner';

interface HiddenTabs {
  isOwner: boolean;
  hidden: HideableTab[];
  setTabHidden: (tab: HideableTab, hide: boolean) => Promise<void>;
}

const HiddenTabsContext = createContext<HiddenTabs>({ isOwner: false, hidden: [], setTabHidden: async () => undefined });

export const useHiddenTabs = () => useContext(HiddenTabsContext);

interface OwnerSection extends BusinessSection {
  ownerContent?: ReactNode; // versión del editor, si difiere de la del visitante
}

interface BusinessTabsProps {
  slug: string;
  sections: OwnerSection[];
  ownerFooter?: ReactNode; // contacto bajo cada pestaña del editor
  storageKey: string;
  hiddenTabs: HideableTab[];
  unavailableTabs: HideableTab[]; // las que su categoría no tiene: no las ve ni el dueño
}

// Secciones del micro-sitio: solo las de su categoría. El dueño edita en pestañas; el visitante ve todo en una página,
// sin las secciones que el dueño ocultó.
export function BusinessTabs({ slug, sections, ownerFooter, storageKey, hiddenTabs, unavailableTabs }: BusinessTabsProps) {
  const isOwner = useIsOwner(slug);
  const { refresh } = useRefresh();
  const [hidden, setHidden] = useState(hiddenTabs);

  const setTabHidden = async (tab: HideableTab, hide: boolean) => {
    const previous = hidden;
    const next = hide ? [...hidden, tab] : hidden.filter((current) => current !== tab);
    setHidden(next);
    try {
      await businessApi.updateMe({ hiddenTabs: next });
      refresh();
    } catch (err) {
      setHidden(previous);
      throw err;
    }
  };

  return (
    <HiddenTabsContext.Provider value={{ isOwner, hidden, setTabHidden }}>
      {isOwner ? (
        <SectionTabs
          storageKey={storageKey}
          defaultId="eventos"
          panels={sections.map(({ ownerContent, ...section }) => ({ ...section, content: ownerContent ?? section.content })).sort((a, b) => TAB_ORDER.indexOf(a.id) - TAB_ORDER.indexOf(b.id))}
          hiddenIds={unavailableTabs}
          footer={ownerFooter}
          footerHiddenOn="contactanos"
        />
      ) : (
        <BusinessSections sections={sections} hiddenIds={[...unavailableTabs, ...hidden]} />
      )}
    </HiddenTabsContext.Provider>
  );
}
