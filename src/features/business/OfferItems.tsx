'use client';

import { useState } from 'react';
import { businessApi } from '../../api';
import { OfferItemForm } from './OfferItemForm';
import type { OfferItem } from './offer';

export type { OfferItem } from './offer';

interface OfferItemsProps {
  type: 'products' | 'services';
  items: OfferItem[];
  onChange: (items: OfferItem[]) => void;
}

// Lista, alta, edición y baja de productos o servicios. Cada cambio se guarda al momento, igual que el gestor de contenido.
export function OfferItems({ type, items, onChange }: OfferItemsProps) {
  const [editing, setEditing] = useState<OfferItem | null>(null);
  // Al cambiar la clave, el formulario vuelve a empezar vacío.
  const [formKey, setFormKey] = useState(0);
  const [error, setError] = useState('');

  const closeForm = () => {
    setEditing(null);
    setFormKey((key) => key + 1);
  };

  const saved = (item: OfferItem) => {
    onChange(editing ? items.map((current) => (current.id === editing.id ? item : current)) : [...items, item]);
    closeForm();
  };

  const edit = (item: OfferItem) => {
    setError('');
    setEditing(item);
    setFormKey((key) => key + 1);
  };

  const remove = async (id: string) => {
    setError('');
    try {
      await businessApi.deleteItem(type, id);
      onChange(items.filter((item) => item.id !== id));
      if (id === editing?.id) closeForm();
    } catch {
      setError('No se pudo eliminar');
    }
  };

  return (
    <div className="space-y-3">
      {items.length > 0 && (
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm" style={{ border: `1px solid ${item.id === editing?.id ? '#2563EB' : '#E4EBFA'}` }}>
              <span className="flex min-w-0 items-center gap-3" style={{ color: '#1D1D1F' }}>
                <span className="w-12 h-12 shrink-0 overflow-hidden rounded-lg" style={{ border: '1px solid #E4EBFA', backgroundColor: '#F8FAFC' }}>
                  {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                </span>
                <span>
                  {item.name}
                  {item.price ? <span style={{ color: '#1D1D1F99' }}> · ${item.price.toLocaleString('es-CL')}</span> : null}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <button type="button" onClick={() => edit(item)} className="text-xs underline cursor-pointer" style={{ color: '#2563EB' }} aria-label={`Editar ${item.name}`}>
                  Editar
                </button>
                <button type="button" onClick={() => remove(item.id)} className="text-xs underline cursor-pointer" style={{ color: '#DC2626' }} aria-label={`Eliminar ${item.name}`}>
                  Eliminar
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}
      {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
      <OfferItemForm key={formKey} type={type} item={editing} onSaved={saved} onCancel={editing ? closeForm : undefined} />
    </div>
  );
}
