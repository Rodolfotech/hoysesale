'use client';

import { createContext, useContext, useState, type ComponentProps } from 'react';
import { useRefresh } from '@/hooks/useRefresh';
import type { HideableTab } from '@/lib/business';
import { businessApi } from '../../api';
import { SectionTabs } from '../../components/ui/SectionTabs';
import { useIsOwner } from './useIsOwner';

interface HiddenTabs {
  isOwner: boolean;
  hidden: HideableTab[];
  setTabHidden: (tab: HideableTab, hide: boolean) => Promise<void>;
}

const HiddenTabsContext = createContext<HiddenTabs>({ isOwner: false, hidden: [], setTabHidden: async () => undefined });

export const useHiddenTabs = () => useContext(HiddenTabsContext);

interface BusinessTabsProps extends Omit<ComponentProps<typeof SectionTabs>, 'hiddenIds'> {
  slug: string;
  hiddenTabs: HideableTab[];
}

// Pestañas del micro-sitio: esconde a los visitantes las que el dueño decidió ocultar. El dueño las ve todas.
export function BusinessTabs({ slug, hiddenTabs, ...tabs }: BusinessTabsProps) {
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
      <SectionTabs {...tabs} hiddenIds={isOwner ? [] : hidden} />
    </HiddenTabsContext.Provider>
  );
}
