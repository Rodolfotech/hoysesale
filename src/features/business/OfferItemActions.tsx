'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { OfferItemForm } from './OfferItemForm';
import type { OfferItem } from './offer';

interface OfferItemActionsProps {
  type: 'products' | 'services';
  item: OfferItem;
}

// Botones Editar y Eliminar de una tarjeta pública. Solo deben mostrarse al dueño.
export function OfferItemActions({ type, item }: OfferItemActionsProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const noun = type === 'products' ? 'producto' : 'servicio';

  const saved = () => {
    setEditing(false);
    router.refresh();
  };

  const remove = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await businessApi.deleteItem(type, item.id);
      setConfirming(false);
      router.refresh();
    } catch {
      setDeleteError(`No se pudo eliminar el ${noun}. Intenta de nuevo.`);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="absolute top-3 right-3 flex gap-1.5">
        <Button variant="outline" size="sm" onClick={() => setEditing(true)} aria-label={`Editar ${item.name}`}>Editar</Button>
        <Button variant="outline" size="sm" onClick={() => setConfirming(true)} style={{ color: '#DC2626', borderColor: '#DC2626' }} aria-label={`Eliminar ${item.name}`}>Eliminar</Button>
      </div>

      <Modal isOpen={editing} onClose={() => setEditing(false)} maxWidth="2xl">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar {noun}</h2>
          <OfferItemForm type={type} item={item} onSaved={saved} onCancel={() => setEditing(false)} />
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={confirming}
        title={`Eliminar ${noun}`}
        message={`Se eliminará "${item.name}" de tu página. Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={remove}
        onCancel={() => { setConfirming(false); setDeleteError(''); }}
      />
    </>
  );
}
