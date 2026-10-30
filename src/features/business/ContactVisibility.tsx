'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { useRefresh } from '@/hooks/useRefresh';
import { businessApi } from '../../api';
import { Popover } from '../../components/ui/Popover';
import { Switch } from '../../components/ui/Switch';
import { useHiddenTabs } from './BusinessTabs';
import { TabVisibilitySwitch } from './TabVisibilitySwitch';

// Interruptores de la pestaña Contáctanos. Solo los ve el dueño y cada cambio se guarda al momento.
export function ContactVisibility({ inAllTabs }: { inAllTabs: boolean }) {
  const { isOwner } = useHiddenTabs();
  const { refresh } = useRefresh();
  const [everywhere, setEverywhere] = useState(inAllTabs);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!isOwner) return null;

  const change = async (next: boolean) => {
    setEverywhere(next);
    setSaving(true);
    setError('');
    try {
      await businessApi.updateMe({ contactInAllTabs: next });
      refresh();
    } catch (err) {
      setEverywhere(!next);
      setError(apiErrorMessage(err, 'No se pudo guardar el cambio'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-2 mb-5">
      <TabVisibilitySwitch tab="contactanos" name="Contáctanos" />
      <Switch
        label="Mostrar en todas las pestañas"
        checked={everywhere}
        disabled={saving}
        onChange={change}
        info={<Popover label="Información de mostrar en todas las pestañas"><p>Si lo activas, tus datos de contacto se muestran debajo del contenido de cada pestaña.</p></Popover>}
      />
      {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
