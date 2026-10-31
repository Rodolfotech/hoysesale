'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { useRefresh } from '@/hooks/useRefresh';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { OfferExtras } from './OfferExtras';
import { OfferItemForm } from './OfferItemForm';
import { useIsOwner } from './useIsOwner';

type OfferType = 'products' | 'services';

const nounOf = (type: OfferType) => (type === 'products' ? 'producto' : 'servicio');

interface AddItemDialogProps {
  type: OfferType;
  amenities: string[];
  onSaved: () => void;
  onClose: () => void;
}

// Aquí no hay un Guardar general: el producto o servicio se guarda con su botón y cada comodidad al marcarla.
function AddItemDialog({ type, amenities, onSaved, onClose }: AddItemDialogProps) {
  const [selected, setSelected] = useState(amenities);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const changeAmenities = async (next: string[]) => {
    const previous = selected;
    setSelected(next);
    setSaving(true);
    setError('');
    try {
      await businessApi.updateMe({ amenities: next });
      onSaved();
    } catch (err) {
      setSelected(previous);
      setError(apiErrorMessage(err, 'No se pudieron guardar las comodidades'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Agregar {nounOf(type)}</h2>
      <OfferItemForm type={type} onSaved={() => { onClose(); onSaved(); }} onCancel={onClose} />
      <OfferExtras amenities={selected} onAmenitiesChange={changeAmenities} disabled={saving} />
      {error && <p role="alert" className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}

interface OfferItemAddProps {
  slug: string;
  type: OfferType;
  amenities: string[];
}

// Botón Agregar producto o servicio de la página pública. Solo lo ve el dueño.
export function OfferItemAdd({ slug, type, amenities }: OfferItemAddProps) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={refreshing}>Agregar {nounOf(type)}</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <AddItemDialog type={type} amenities={amenities} onSaved={refresh} onClose={() => setOpen(false)} />
      </Modal>
    </>
  );
}
