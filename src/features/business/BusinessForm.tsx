'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useEffect, useState } from 'react';
import { PhoneInput, phoneDigitsFrom } from '@/components/ui/PhoneInput';
import { Popover } from '@/components/ui/Popover';
import { EditableField } from '@/components/ui/EditableField';
import { UnderlineTabs } from '@/components/ui/UnderlineTabs';
import { WebsiteInput, websiteError, websiteRestFrom, websiteValueFrom } from '@/components/ui/WebsiteInput';
import { InstagramInput, instagramHandleFrom, instagramValueFrom } from '@/components/ui/InstagramInput';
import { FormInput } from '../../components/ui/FormInput';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { COMUNAS } from '../../constants/comunas';
import { BUSINESS_CATEGORIES } from '../../constants/business';

import { BUSINESS_DAYS } from '../../constants/business';
export { BUSINESS_DAYS };

// Separa "Calle 123" en calle y número. Si no termina en número, todo queda como calle.
export function splitAddress(address: string | null | undefined): [string, string] {
  const match = (address ?? '').match(/^(.*?)\s+(\d{1,6})$/);
  return match ? [match[1], match[2]] : [address ?? '', ''];
}

// Nombre del negocio: solo letras, números y espacios; máximo 20 caracteres; cada palabra con mayúscula inicial.
export function formatBusinessName(text: string): string {
  return text
    .replace(/[^\p{L}\p{N} ]/gu, '')
    .slice(0, 20)
    .replace(/(^|\s)(\p{L})/gu, (_match, sep: string, letter: string) => sep + letter.toUpperCase());
}

// Convierte un texto en la URL del negocio: sin acentos, solo minúsculas y números, máximo 20 caracteres.
export function slugifyName(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 20);
}

export interface BusinessFormInitial {
  slug?: string | null;
  companyPhone?: string | null;
  website?: string | null;
  whatsappReservations?: string | null;
  mapUrl?: string | null;
}

// URL, sitio web y botones de la barra. Lo demás se agrega y cambia con los botones de la propia página.
// null borra el dato guardado.
export interface BusinessFormPayload {
  slug?: string;
  website: string | null;
  // En la edición solo se envían si cambiaron: undefined no toca el dato guardado.
  whatsappReservations?: string | null;
  mapUrl?: string | null;
}

interface BusinessFormProps {
  mode: 'create' | 'edit';
  initial: BusinessFormInitial;
  submitLabel: string;
  onSubmit: (payload: BusinessFormPayload) => Promise<void>;
  onCancel?: () => void;
}

// Formulario del micro-sitio. Lo usan la creación y la edición (reutilizable, sin lógica de página).
const TABS = ['contact'] as const;
const TAB_LABELS = { contact: 'Encuéntranos' } as const;

const whatsappValue = (digits: string) => (digits ? `+569${digits}` : null);

export function BusinessForm({ mode, initial, submitLabel, onSubmit, onCancel }: BusinessFormProps) {
  const draftKey = `draft:business:${mode}:${initial.slug ?? 'new'}`;
  const [slug, setSlug] = usePersistentState(`${draftKey}:slug`, initial.slug ?? '');
  // La URL sigue al nombre hasta que el usuario la edita; en un negocio existente no cambia sola.
  const [slugTouched, setSlugTouched] = useState(mode === 'edit');
  // Resultado de la última revisión de URL. Solo se usa si corresponde a la URL actual.
  const [slugResult, setSlugResult] = useState<{ slug: string; available: boolean; message?: string; suggestion?: string } | null>(null);
  const slugStatus: { available: boolean | null; message?: string; suggestion?: string } = slugResult && slugResult.slug === slug ? slugResult : { available: null };
  // Una URL antigua que no cambia no impide guardar: el servidor tampoco la revalida.
  const slugBlocked = slugStatus.available === false && !(mode === 'edit' && slug === initial.slug);

  // Revisa la URL 400 ms después de la última tecla.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      businessApi.checkSlug(slug)
        .then(({ data }) => { if (!cancelled) setSlugResult({ ...data, slug }); })
        .catch(() => undefined);
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [slug]);
  const [website, setWebsite] = usePersistentState(`${draftKey}:website`, websiteRestFrom(initial.website));
  // Por defecto el WhatsApp es el mismo teléfono, hasta que el usuario lo cambie a mano.
  const [whatsappTouched, setWhatsappTouched] = useState(!!initial.whatsappReservations);
  const [whatsapp, setWhatsapp] = usePersistentState(`${draftKey}:whatsapp`, phoneDigitsFrom(initial.whatsappReservations) || phoneDigitsFrom(initial.companyPhone));
  const [mapUrl, setMapUrl] = usePersistentState(`${draftKey}:mapUrl`, initial.mapUrl ?? '');
  // Al editar, estos dos campos no usan borrador: bloqueados deben mostrar siempre lo guardado.
  const savedWhatsapp = phoneDigitsFrom(initial.whatsappReservations) || phoneDigitsFrom(initial.companyPhone);
  const savedMapUrl = initial.mapUrl ?? '';
  const [editWhatsapp, setEditWhatsapp] = useState(savedWhatsapp);
  const [editMapUrl, setEditMapUrl] = useState(savedMapUrl);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      const clearAll = () => ['slug','name','comuna','category','street','number','phone','instagram','website','whatsapp','mapUrl','description','amenities','hours','logoUrl','coverUrl'].forEach((k) => window.sessionStorage.removeItem(`${draftKey}:${k}`));
      await onSubmit(
        {
          slug: slug.trim(),
          website: websiteValueFrom(website) ?? null,
          ...(mode === 'create'
            ? { whatsappReservations: whatsappValue(whatsapp), mapUrl: mapUrl.trim() || null }
            : {
                ...(editWhatsapp !== savedWhatsapp && { whatsappReservations: whatsappValue(editWhatsapp) }),
                ...(editMapUrl !== savedMapUrl && { mapUrl: editMapUrl.trim() || null }),
              }),
        },
      );
      clearAll();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  const whatsappField = (value: string, onChange: (digits: string) => void) => (
    <>
      <PhoneInput label="WhatsApp del botón Contactar" value={value} onChange={onChange} />
      <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>También se usa para reservas y pedidos. Si lo dejas vacío, se usa el teléfono.</p>
    </>
  );

  const mapUrlField = (value: string, onChange: (url: string) => void) => (
    <>
      <FormInput label="Enlace del botón Cómo llegar" value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://maps.google.com/..." />
      <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Google Maps o Waze. Si lo dejas vacío, se usa la dirección exacta.</p>
    </>
  );

  const label = 'block text-xs mb-1';

  return (
    <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
      <UnderlineTabs tabs={TABS} labels={TAB_LABELS} active="contact" onChange={() => undefined} />

      <div className="space-y-5">
      <div>
        <div className="flex items-center gap-1.5">
          <p className={label} style={{ color: '#1D1D1F99' }}>Dirección de tu página</p>
          <Popover label="Información de la dirección de tu página">
            <p>La URL solo puede tener letras minúsculas y números, hasta 20 caracteres.</p>
          </Popover>
        </div>
        <div className="flex items-center gap-1 text-sm" style={{ color: '#1D1D1F99' }}>
          <span>hoysesale.cl/</span>
          <input value={slug} onChange={(e) => { setSlugTouched(true); setSlug(slugifyName(e.target.value)); }} aria-label="Dirección de la página" className="flex-1 px-3 py-2 rounded-xl text-sm light-form" style={{ color: '#1D1D1F' }} />
        </div>
        {/* Solo se muestra cuando la URL ya existe (tiene sugerencia). Los errores de formato no se muestran en rojo. */}
        {slugStatus.available === false && slugStatus.suggestion && (
          <p role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>
            {slugStatus.message}
            {slugStatus.suggestion && (
              <>
                {' · '}
                <button type="button" onClick={() => setSlug(slugStatus.suggestion!)} className="underline font-medium">Usar {slugStatus.suggestion}</button>
              </>
            )}
          </p>
        )}
        {slugStatus.available === true && <p className="text-xs mt-1" style={{ color: '#16A34A' }}>URL disponible</p>}
        <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Usa números para que tu URL sea única.</p>
        {mode === 'create' && <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Puedes cambiarla después con el botón Encuéntranos.</p>}
      </div>

      <WebsiteInput label="Sitio web" value={website} onChange={setWebsite} error={websiteError(website)} />

      <fieldset className="rounded-xl p-4 space-y-3" style={{ border: '1px solid #E4EBFA' }}>
        <legend className="px-1 text-sm font-medium" style={{ color: '#1D1D1F' }}>Botones de la barra inferior</legend>
        {mode === 'edit' ? (
          <>
            <EditableField label="WhatsApp" onCancel={() => setEditWhatsapp(savedWhatsapp)}>
              {whatsappField(editWhatsapp, setEditWhatsapp)}
            </EditableField>
            <EditableField label="Cómo llegar" onCancel={() => setEditMapUrl(savedMapUrl)}>
              {mapUrlField(editMapUrl, setEditMapUrl)}
            </EditableField>
          </>
        ) : (
          <>
            <div>{whatsappField(whatsapp, (digits) => { setWhatsapp(digits); setWhatsappTouched(true); })}</div>
            <div>{mapUrlField(mapUrl, setMapUrl)}</div>
          </>
        )}
      </fieldset>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p role="alert" className="text-sm mr-auto" style={{ color: '#DC2626' }}>{error}</p>}
        {onCancel && (
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm cursor-pointer" style={{ color: '#1D1D1F99' }}>
            Cancelar
          </button>
        )}
        <button
          type="button"
          onClick={submit}
          disabled={saving || !slug || slugBlocked || !!websiteError(website)}
          className="px-6 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50"
          style={{ backgroundColor: '#2563EB' }}
        >
          {saving ? 'Guardando...' : submitLabel}
        </button>
      </div>
    </div>
  );
}
