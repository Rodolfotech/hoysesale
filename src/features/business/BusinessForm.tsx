'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useState } from 'react';
import { FormInput } from '../../components/ui/FormInput';
import { ImagePicker } from '../media/ImagePicker';
import { businessApi } from '../../api';
import { COMUNAS } from '../../constants/comunas';
import { BUSINESS_CATEGORIES, BUSINESS_AMENITIES, AMENITY_LABELS } from '../../constants/business';

import { BUSINESS_DAYS } from '../../constants/business';
export { BUSINESS_DAYS };

// Convierte un texto en una URL válida (sin acentos, minúsculas, guiones).
export function slugifyName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

export interface BusinessFormInitial {
  slug?: string | null;
  name?: string | null;
  comuna?: string | null;
  category?: string | null;
  companyAddress?: string | null;
  companyPhone?: string | null;
  companyInstagram?: string | null;
  website?: string | null;
  whatsappReservations?: string | null;
  mapUrl?: string | null;
  businessDescription?: string | null;
  amenities?: string[] | null;
  hours?: Record<string, string> | null;
  logoUrl?: string | null;
  coverUrl?: string | null;
}

export interface BusinessFormPayload {
  slug?: string;
  name: string;
  comuna: string;
  category?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyInstagram?: string;
  website?: string;
  whatsappReservations?: string;
  mapUrl?: string;
  businessDescription?: string;
  amenities: string[];
  hours: Record<string, string>;
}

interface BusinessFormProps {
  mode: 'create' | 'edit';
  initial: BusinessFormInitial;
  submitLabel: string;
  onSubmit: (payload: BusinessFormPayload) => Promise<void>;
  onCancel?: () => void;
}

// Formulario del micro-sitio. Lo usan la creación y la edición (reutilizable, sin lógica de página).
export function BusinessForm({ mode, initial, submitLabel, onSubmit, onCancel }: BusinessFormProps) {
  const draftKey = `draft:business:${mode}:${initial.slug ?? 'new'}`;
  const [slug, setSlug] = usePersistentState(`${draftKey}:slug`, initial.slug ?? '');
  const [name, setName] = usePersistentState(`${draftKey}:name`, initial.name ?? '');
  const [comuna, setComuna] = usePersistentState(`${draftKey}:comuna`, initial.comuna ?? '');
  const [category, setCategory] = usePersistentState(`${draftKey}:category`, initial.category ?? '');
  const [address, setAddress] = usePersistentState(`${draftKey}:address`, initial.companyAddress ?? '');
  const [phone, setPhone] = usePersistentState(`${draftKey}:phone`, initial.companyPhone ?? '+569');
  const [instagram, setInstagram] = usePersistentState(`${draftKey}:instagram`, initial.companyInstagram ?? '');
  const [website, setWebsite] = usePersistentState(`${draftKey}:website`, initial.website ?? '');
  const [whatsapp, setWhatsapp] = usePersistentState(`${draftKey}:whatsapp`, initial.whatsappReservations ?? '');
  const [mapUrl, setMapUrl] = usePersistentState(`${draftKey}:mapUrl`, initial.mapUrl ?? '');
  const [description, setDescription] = usePersistentState(`${draftKey}:description`, initial.businessDescription ?? '');
  const [amenities, setAmenities] = usePersistentState<string[]>(`${draftKey}:amenities`, initial.amenities ?? []);
  const [hours, setHours] = usePersistentState<Record<string, string>>(`${draftKey}:hours`, initial.hours ?? {});
  const [logoUrl, setLogoUrl] = usePersistentState<string | null>(`${draftKey}:logoUrl`, initial.logoUrl ?? null);
  const [coverUrl, setCoverUrl] = usePersistentState<string | null>(`${draftKey}:coverUrl`, initial.coverUrl ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const toggleAmenity = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const submit = async () => {
    setSaving(true);
    setError('');
    const cleanHours = Object.fromEntries(Object.entries(hours).filter(([, v]) => v.trim()));
    try {
      const clearAll = () => ['slug','name','comuna','category','address','phone','instagram','website','whatsapp','mapUrl','description','amenities','hours','logoUrl','coverUrl'].forEach((k) => window.sessionStorage.removeItem(`${draftKey}:${k}`));
      await onSubmit(
        {
          slug: slug.trim(),
          name: name.trim(),
          comuna,
          category: category || undefined,
          companyAddress: address || undefined,
          companyPhone: phone || undefined,
          companyInstagram: instagram || undefined,
          website: website || undefined,
          whatsappReservations: whatsapp || undefined,
          mapUrl: mapUrl || undefined,
          businessDescription: description || undefined,
          amenities,
          hours: cleanHours,
        },
      );
      clearAll();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  const label = 'block text-xs mb-1';

  return (
    <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
      <div>
        <p className={label} style={{ color: '#1D1D1F99' }}>Dirección de tu página</p>
        <div className="flex items-center gap-1 text-sm" style={{ color: '#1D1D1F99' }}>
          <span>hoysesale.cl/</span>
          <input value={slug} onChange={(e) => setSlug(slugifyName(e.target.value))} aria-label="Dirección de la página" className="flex-1 px-3 py-2 rounded-xl text-sm light-form" style={{ color: '#1D1D1F' }} />
        </div>
        {mode === 'create' && <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Puedes cambiarla después desde Editar.</p>}
      </div>

      <FormInput label="Nombre del negocio" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre comercial" required />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label} style={{ color: '#1D1D1F' }}>Comuna</label>
          <select value={comuna} onChange={(e) => setComuna(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm light-form">
            <option value="">Selecciona</option>
            {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className={label} style={{ color: '#1D1D1F' }}>Categoría</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm light-form">
            <option value="">Sin categoría</option>
            {BUSINESS_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <FormInput label="Dirección exacta" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Calle, número y referencias" />

      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Teléfono" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+569XXXXXXXX" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <FormInput label="Instagram" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="@mi_local" />
        <FormInput label="Sitio web" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." />
      </div>

      <fieldset className="rounded-xl p-4 space-y-3" style={{ border: '1px solid #E4EBFA' }}>
        <legend className="px-1 text-sm font-medium" style={{ color: '#1D1D1F' }}>Botones de la barra inferior</legend>
        <div>
          <FormInput label="WhatsApp del botón Contactar" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+569XXXXXXXX" />
          <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>También se usa para reservas y pedidos. Si lo dejas vacío, se usa el teléfono.</p>
        </div>
        <div>
          <FormInput label="Enlace del botón Cómo llegar" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." />
          <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Google Maps o Waze. Si lo dejas vacío, se usa la dirección exacta.</p>
        </div>
      </fieldset>

      <div>
        <label className={label} style={{ color: '#1D1D1F' }}>Descripción (2 a 4 párrafos; separa los párrafos con una línea en blanco)</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} maxLength={2000} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
      </div>

      <div>
        <p className={label} style={{ color: '#1D1D1F' }}>Comodidades</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer" style={{ border: '1px solid #E4EBFA', backgroundColor: amenities.includes(a) ? '#EFF6FF' : '#FFFFFF' }}>
              <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggleAmenity(a)} />
              {AMENITY_LABELS[a] ?? a}
            </label>
          ))}
        </div>
      </div>

      <div>
        <p className={label} style={{ color: '#1D1D1F' }}>Horarios</p>
        <div className="grid grid-cols-2 gap-2">
          {BUSINESS_DAYS.map((d) => (
            <div key={d} className="flex items-center gap-2">
              <span className="text-xs w-20 capitalize" style={{ color: '#1D1D1F' }}>{d}</span>
              <input value={hours[d] ?? ''} onChange={(e) => setHours({ ...hours, [d]: e.target.value })} placeholder="12:00-23:00 o cerrado" className="flex-1 px-2 py-1.5 rounded-lg text-xs light-form" />
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ImagePicker label="Logo" value={logoUrl} onChange={setLogoUrl} onUpload={async (f) => (await businessApi.uploadImage('logo', f)).data.logoUrl as string} />
        <ImagePicker label="Portada" value={coverUrl} onChange={setCoverUrl} onUpload={async (f) => (await businessApi.uploadImage('cover', f)).data.coverUrl as string} aspect="wide" hint="Recomendado: 1200 × 400 px (3:1)" />
      </div>

      {error && <p className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}

      <div className="flex justify-end gap-3">
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm cursor-pointer" style={{ color: '#1D1D1F99' }}>
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={saving || !name.trim() || !comuna || !slug}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: '#2563EB' }}
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
