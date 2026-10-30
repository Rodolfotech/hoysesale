'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { AboutImages } from './AboutImages';
import { useAboutImages } from './useAboutImages';
import { useIsOwner } from './useIsOwner';
import { useRefresh } from '@/hooks/useRefresh';

function AboutImagesDialog({ images, onClose, onSaved }: { images: string[]; onClose: () => void; onSaved: () => void }) {
  const { items, setItems, save } = useAboutImages(images);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      await save();
      onClose();
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudieron guardar las fotos'));
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar fotos</h2>
      <AboutImages items={items} onChange={setItems} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p role="alert" className="text-sm mr-auto" style={{ color: '#DC2626' }}>{error}</p>}
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </div>
  );
}

interface AboutImagesEditProps {
  slug: string;
  images: string[];
  className?: string; // posición del botón
}

// Botón Editar de las fotos de "Nosotros" en el micro-sitio. Solo lo ve el dueño.
export function AboutImagesEdit({ slug, images, className = '' }: AboutImagesEditProps) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={refreshing} className={className} aria-label="Editar fotos">Editar</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <AboutImagesDialog images={images} onClose={() => setOpen(false)} onSaved={refresh} />
      </Modal>
    </>
  );
}
