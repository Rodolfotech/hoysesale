'use client';

import { useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { FormInput } from '../../components/ui/FormInput';
import type { OfferItem } from './offer';

export type { OfferItem } from './offer';

interface OfferItemsProps {
  type: 'products' | 'services';
  title: string;
  items: OfferItem[];
  onChange: (items: OfferItem[]) => void;
}

// Lista y alta/baja de productos o servicios. Cada cambio se guarda al momento, igual que el gestor de contenido.
export function OfferItems({ type, title, items, onChange }: OfferItemsProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const add = async () => {
    setBusy(true);
    setError('');
    try {
      const body = type === 'products'
        ? { name: name.trim(), description: description.trim() || undefined, price: price ? Math.round(Number(price)) : undefined }
        : { title: name.trim(), description: description.trim() || undefined };
      const { data } = await businessApi.addItem(type, body);
      onChange([...items, {
        id: data.id,
        name: type === 'products' ? data.name : data.title,
        description: data.description ?? null,
        price: data.price ?? null,
      }]);
      setName('');
      setDescription('');
      setPrice('');
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await businessApi.deleteItem(type, id);
      onChange(items.filter((item) => item.id !== id));
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>{title}</p>
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm" style={{ border: '1px solid #E4EBFA' }}>
              <span style={{ color: '#1D1D1F' }}>
                {item.name}
                {item.price ? <span style={{ color: '#1D1D1F99' }}> · ${item.price.toLocaleString('es-CL')}</span> : null}
              </span>
              <button type="button" onClick={() => remove(item.id)} className="text-xs underline cursor-pointer" style={{ color: '#DC2626' }}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="grid grid-cols-2 gap-3">
        <FormInput label={type === 'products' ? 'Nombre del producto' : 'Nombre del servicio'} value={name} onChange={(e) => setName(e.target.value)} />
        {type === 'products' && (
          <FormInput label="Precio (CLP, opcional)" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} />
        )}
      </div>
      <FormInput label="Descripción (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="flex items-center gap-3">
        <button type="button" onClick={add} disabled={busy || !name.trim()} className="px-4 py-2 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: '#2563EB' }}>
          {busy ? 'Guardando...' : type === 'products' ? 'Agregar producto' : 'Agregar servicio'}
        </button>
        {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
      </div>
    </div>
  );
}
