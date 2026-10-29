'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessApi, mediaApi } from '../../api';
import { Modal } from '../../components/ui/Modal';
import { FormInput } from '../../components/ui/FormInput';
import { ImagePicker } from '../media/ImagePicker';
import { TAG_LABELS, formatCLP } from './format';
import type { BusinessHighlight, BusinessProduct, BusinessService } from '@/lib/business';

type ItemType = 'products' | 'services' | 'highlights';

const TYPE_LABELS: Record<ItemType, string> = { products: 'Productos', services: 'Servicios', highlights: 'Destacados' };

interface BusinessContentManagerProps {
  open: boolean;
  onClose: () => void;
  products: BusinessProduct[];
  services: BusinessService[];
  highlights: BusinessHighlight[];
}

// Panel del dueño: agrega, edita (borra y vuelve a crear) y elimina productos, servicios y destacados.
export function BusinessContentManager({ open, onClose, products, services, highlights }: BusinessContentManagerProps) {
  const router = useRouter();
  const [type, setType] = useState<ItemType>('products');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [tag, setTag] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const reset = () => { setName(''); setDescription(''); setPrice(''); setTag(''); setImageUrl(''); setError(''); };

  const add = async () => {
    setBusy(true);
    setError('');
    try {
      const data: Record<string, unknown> = type === 'products'
        ? { name, description: description || undefined, price: price ? Number(price) : undefined, tag: tag || undefined, imageUrl: imageUrl || undefined }
        : type === 'services'
          ? { title: name, description: description || undefined }
          : { title: name, imageUrl };
      await businessApi.addItem(type, data);
      reset();
      router.refresh();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo guardar');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar este elemento?')) return;
    await businessApi.deleteItem(type, id);
    router.refresh();
  };

  const items: { id: string; label: string; detail?: string }[] =
    type === 'products'
      ? products.map((p) => ({ id: p.id, label: p.name, detail: [p.price !== null ? formatCLP(p.price) : null, p.tag ? TAG_LABELS[p.tag] : null].filter(Boolean).join(' · ') }))
      : type === 'services'
        ? services.map((s) => ({ id: s.id, label: s.title }))
        : highlights.map((h) => ({ id: h.id, label: h.title }));

  const label = 'block text-xs mb-1';

  return (
    <Modal isOpen={open} onClose={onClose} maxWidth="2xl">
      <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
        <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Contenido de mi página</h2>

        <div role="tablist" aria-label="Tipo de contenido" className="flex gap-2">
          {(Object.keys(TYPE_LABELS) as ItemType[]).map((t) => (
            <button key={t} type="button" role="tab" aria-selected={type === t} onClick={() => { setType(t); reset(); }}
              className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer"
              style={type === t ? { backgroundColor: '#2563EB', color: '#FFFFFF' } : { border: '1px solid #E4EBFA', color: '#1D1D1F' }}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <ul className="space-y-2">
          {items.length === 0 && <li className="text-xs" style={{ color: '#1D1D1F99' }}>Aún no hay elementos.</li>}
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 rounded-xl p-3" style={{ border: '1px solid #E4EBFA' }}>
              <div>
                <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>{it.label}</p>
                {it.detail && <p className="text-xs" style={{ color: '#1D1D1F99' }}>{it.detail}</p>}
              </div>
              <button type="button" onClick={() => remove(it.id)} className="text-xs cursor-pointer hover:underline" style={{ color: '#DC2626' }} aria-label={`Eliminar ${it.label}`}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>

        <fieldset className="space-y-3 rounded-xl p-4" style={{ border: '1px solid #E4EBFA' }}>
          <legend className="text-sm font-semibold px-1" style={{ color: '#1D1D1F' }}>Agregar {TYPE_LABELS[type].toLowerCase().slice(0, -1)}</legend>
          <FormInput label={type === 'products' ? 'Nombre' : 'Título'} value={name} onChange={(e) => setName(e.target.value)} placeholder={type === 'products' ? 'Café Etiopía 340g' : 'Título'} required />
          {type !== 'highlights' && (
            <div>
              <label htmlFor="cont-desc" className={label} style={{ color: '#1D1D1F' }}>Descripción</label>
              <textarea id="cont-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={2} maxLength={2000} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
            </div>
          )}
          {type === 'products' && (
            <div className="grid grid-cols-2 gap-3">
              <FormInput label="Precio (CLP)" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ''))} placeholder="12900" />
              <div>
                <label htmlFor="cont-tag" className={label} style={{ color: '#1D1D1F' }}>Etiqueta</label>
                <select id="cont-tag" value={tag} onChange={(e) => setTag(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm light-form">
                  <option value="">Sin etiqueta</option>
                  {Object.entries(TAG_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
          )}
          {type !== 'services' && (
            <ImagePicker label={type === 'highlights' ? 'Imagen (obligatoria)' : 'Imagen'} value={imageUrl || null} onChange={setImageUrl} onUpload={async (f) => (await mediaApi.uploadTemp(f)).data.url} />
          )}
          {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
          <button type="button" onClick={add} disabled={busy || !name.trim() || (type === 'highlights' && !imageUrl)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: '#2563EB' }}>
            {busy ? 'Guardando...' : 'Agregar'}
          </button>
        </fieldset>
      </div>
    </Modal>
  );
}
