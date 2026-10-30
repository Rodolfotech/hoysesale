'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import type { HideableTab } from '@/lib/business';
import { Popover } from '../../components/ui/Popover';
import { Switch } from '../../components/ui/Switch';
import { useHiddenTabs } from './BusinessTabs';

interface TabVisibilitySwitchProps {
  tab: HideableTab;
  name: string; // nombre visible de la pestaña
}

// Interruptor para ocultar una pestaña a los visitantes. Solo lo ve el dueño y se guarda al momento.
export function TabVisibilitySwitch({ tab, name }: TabVisibilitySwitchProps) {
  const { isOwner, hidden, setTabHidden } = useHiddenTabs();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOwner) return null;

  const change = async (hide: boolean) => {
    setSaving(true);
    setError('');
    try {
      await setTabHidden(tab, hide);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el cambio'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Switch
        label="Ocultar pestaña a los visitantes"
        checked={hidden.includes(tab)}
        disabled={saving}
        onChange={change}
        info={(
          <Popover label={`Información de ocultar pestaña ${name}`}>
            <p>Si lo activas, la pestaña {name} deja de verse para los visitantes de tu página. Tú la seguirás viendo para poder editarla.</p>
          </Popover>
        )}
      />
      {error && <p role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
