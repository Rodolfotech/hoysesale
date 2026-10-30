'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { SERVICE_TAGS_MAX, SERVICE_TAG_MAX_LENGTH } from '@/lib/business';
import { FormInput } from '../../components/ui/FormInput';
import { TagInput } from '../../components/ui/TagInput';
import { OfferImagePicker } from './OfferImagePicker';
import type { OfferItem } from './offer';

interface OfferItemFormProps {
  type: 'products' | 'services';
  item?: OfferItem | null; // sin item, el formulario agrega uno nuevo
  onSaved: (saved: OfferItem) => void;
  onCancel?: () => void;
}

// Formulario para agregar o editar un producto o servicio. Guarda al momento.
export function OfferItemForm({ type, item, onSaved, onCancel }: OfferItemFormProps) {
  const [name, setName] = useState(item?.name ?? '');
  const [description, setDescription] = useState(item?.description ?? '');
  const [price, setPrice] = useState(item?.price != null ? String(item.price) : '');
  const [imageUrl, setImageUrl] = useState(item?.imageUrl ?? '');
  const [tags, setTags] = useState<string[]>(item?.tags ?? []);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const isProduct = type === 'products';
  const noun = isProduct ? 'producto' : 'servicio';

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      // null borra en el servidor los campos opcionales que quedaron vacíos.
      const shared = { description: description.trim() || null, imageUrl: imageUrl || null };
      const body = isProduct
        ? { ...shared, name: name.trim(), price: price ? Math.round(Number(price)) : null }
        : { ...shared, title: name.trim(), tags };
      const { data } = item ? await businessApi.updateItem(type, item.id, body) : await businessApi.addItem(type, body);
      onSaved({
        id: data.id,
        name: isProduct ? data.name : data.title,
        description: data.description ?? null,
        price: data.price ?? null,
        imageUrl: data.imageUrl ?? null,
        tags: data.tags ?? [],
      });
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <FormInput label={`Nombre del ${noun}`} value={name} onChange={(e) => setName(e.target.value)} />
        {isProduct && (
          <FormInput label="Precio (CLP, opcional)" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
        )}
      </div>
      <FormInput label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      {!isProduct && <TagInput label="Etiquetas (opcional)" value={tags} onChange={setTags} max={SERVICE_TAGS_MAX} maxLength={SERVICE_TAG_MAX_LENGTH} />}
      <OfferImagePicker type={type} label={`Imagen del ${noun} (opcional)`} value={imageUrl || null} onChange={setImageUrl} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={busy || !name.trim()} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: '#2563EB' }}>
          {busy ? 'Guardando...' : item ? 'Guardar cambios' : `Agregar ${noun}`}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className="text-xs underline cursor-pointer" style={{ color: '#1D1D1F99' }}>
            Cancelar
          </button>
        )}
        {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
      </div>
    </div>
  );
}
