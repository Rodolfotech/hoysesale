'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { BusinessDescriptionField } from './BusinessDescriptionField';
import { useIsOwner } from './useIsOwner';
import { useRefresh } from '@/hooks/useRefresh';

function DescriptionDialog({ description, onClose, onSaved }: { description: string; onClose: () => void; onSaved: () => void }) {
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
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar descripción</h2>
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

// Botón Editar de la descripción en el micro-sitio. Solo lo ve el dueño.
export function BusinessDescriptionEdit({ slug, description, className = '' }: BusinessDescriptionEditProps) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={refreshing} className={className} aria-label="Editar descripción">Editar</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <DescriptionDialog description={description} onClose={() => setOpen(false)} onSaved={refresh} />
      </Modal>
    </>
  );
}
