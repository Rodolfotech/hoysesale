'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { BusinessDescriptionField } from './BusinessDescriptionField';
import { useIsOwner } from './useIsOwner';
import { useRefresh } from '@/hooks/useRefresh';

function DescriptionDialog({ description, title, onClose, onSaved }: { description: string; title: string; onClose: () => void; onSaved: () => void }) {
  const [value, setValue] = useState(description);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      // null borra el texto guardado.
      await businessApi.updateMe({ businessDescription: value.trim() || null });
      onClose();
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar la descripción'));
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>{title}</h2>
      <BusinessDescriptionField value={value} onChange={setValue} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p role="alert" className="text-sm mr-auto" style={{ color: '#DC2626' }}>{error}</p>}
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </div>
  );
}

interface BusinessDescriptionEditProps {
  slug: string;
  description: string;
  className?: string; // posición del botón
}

// Botón de la descripción: Agregar descripción si está vacía, Editar si ya tiene texto. Solo lo ve el dueño.
export function BusinessDescriptionEdit({ slug, description, className = '' }: BusinessDescriptionEditProps) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  const empty = !description.trim();
  const title = empty ? 'Agregar descripción' : 'Editar descripción';

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={refreshing} className={className} aria-label={title}>{empty ? title : 'Editar'}</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <DescriptionDialog description={description} title={title} onClose={() => setOpen(false)} onSaved={refresh} />
      </Modal>
    </>
  );
}
