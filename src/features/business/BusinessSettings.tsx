'use client';

import { useState } from 'react';
import { businessApi } from '../../api';
import { BUSINESS_CATEGORIES, BUSINESS_AMENITIES, AMENITY_LABELS } from '../../constants/business';

interface BusinessSettingsProps {
  slug: string | null;
  initial: {
    category?: string | null;
    businessDescription?: string | null;
    amenities?: string[] | null;
    whatsappReservations?: string | null;
    mapUrl?: string | null;
  };
  onSaved?: (newSlug?: string) => void;
}

// Editor del micro-sitio del negocio, reutilizable (recibe datos y callbacks por props).
export function BusinessSettings({ slug, initial, onSaved }: BusinessSettingsProps) {
  const [pageSlug, setPageSlug] = useState(slug ?? '');
  const [category, setCategory] = useState(initial.category ?? '');
  const [description, setDescription] = useState(initial.businessDescription ?? '');
  const [amenities, setAmenities] = useState<string[]>(initial.amenities ?? []);
  const [whatsapp, setWhatsapp] = useState(initial.whatsappReservations ?? '');
  const [mapUrl, setMapUrl] = useState(initial.mapUrl ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const toggle = (a: string) =>
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      const { data } = await businessApi.updateMe({
        slug: pageSlug || undefined,
        category: category || undefined,
        businessDescription: description,
        amenities,
        whatsappReservations: whatsapp || undefined,
        mapUrl: mapUrl || undefined,
      });
      setMessage('Micro-sitio guardado');
      onSaved?.(data.slug ?? undefined);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setMessage(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo guardar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl p-6 space-y-4 bg-white" style={{ border: '1px solid #E4EBFA' }}>
      <div>
        <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Mi micro-sitio</p>
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Dirección de tu página</label>
        <div className="flex items-center gap-1 text-sm" style={{ color: '#1D1D1F99' }}>
          <span>hoysesale.cl/</span>
          <input
            value={pageSlug}
            onChange={(e) => setPageSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))}
            aria-label="Dirección de tu página"
            className="flex-1 px-3 py-2 rounded-xl text-sm light-form"
            style={{ color: '#1D1D1F' }}
          />
        </div>
        {pageSlug && (
          <a href={`/${pageSlug}`} target="_blank" rel="noopener noreferrer" className="text-xs hover:underline" style={{ color: '#2563EB' }}>
            Ver mi página
          </a>
        )}
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Categoría</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-xl text-sm light-form">
          <option value="">Sin categoría</option>
          {BUSINESS_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Descripción</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} maxLength={2000} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
      </div>

      <div>
        <p className="text-xs mb-2" style={{ color: '#1D1D1F99' }}>Comodidades</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_AMENITIES.map((a) => (
            <label key={a} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer" style={{ border: '1px solid #E4EBFA', backgroundColor: amenities.includes(a) ? '#EFF6FF' : '#FFFFFF' }}>
              <input type="checkbox" checked={amenities.includes(a)} onChange={() => toggle(a)} className="accent-blue-600" />
              {AMENITY_LABELS[a] ?? a}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>WhatsApp para reservas (+569XXXXXXXX)</label>
        <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="+56912345678" className="w-full px-3 py-2 rounded-xl text-sm light-form" />
      </div>

      <div>
        <label className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Enlace de mapa (Google Maps, opcional)</label>
        <input type="url" value={mapUrl} onChange={(e) => setMapUrl(e.target.value)} placeholder="https://maps.google.com/..." className="w-full px-3 py-2 rounded-xl text-sm light-form" />
      </div>

      <div className="flex items-center gap-3">
        <button type="button" onClick={save} disabled={saving} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50" style={{ backgroundColor: '#2563EB' }}>
          {saving ? 'Guardando...' : 'Guardar micro-sitio'}
        </button>
        {message && <p className="text-xs" style={{ color: message.startsWith('Micro') ? '#16A34A' : '#DC2626' }}>{message}</p>}
      </div>
    </section>
  );
}
