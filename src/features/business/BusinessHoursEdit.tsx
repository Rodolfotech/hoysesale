'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { cleanBusinessHours, type BusinessHours } from '@/lib/hours';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { BusinessScheduleForm } from './BusinessScheduleForm';
import { useIsOwner } from './useIsOwner';
import { useRefresh } from '@/hooks/useRefresh';

function HoursDialog({ hours, onClose, onSaved }: { hours: BusinessHours; onClose: () => void; onSaved: () => void }) {
  const [value, setValue] = useState(hours);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await businessApi.updateMe({ hours: cleanBusinessHours(value) });
      onClose();
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el horario'));
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar horario</h2>
      <BusinessScheduleForm hours={value} onChange={setValue} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p role="alert" className="text-sm mr-auto" style={{ color: '#DC2626' }}>{error}</p>}
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </div>
  );
}

// Botón Editar del horario en el micro-sitio. Solo lo ve el dueño.
export function BusinessHoursEdit({ slug, hours }: { slug: string; hours: BusinessHours | null | undefined }) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={refreshing} aria-label="Editar horario">Editar</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <HoursDialog hours={hours ?? {}} onClose={() => setOpen(false)} onSaved={refresh} />
      </Modal>
    </>
  );
}
