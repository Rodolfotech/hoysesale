'use client';

import { useId, useState } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { ADDRESS_LABELS, INSTAGRAM_LABELS, PHONE_LABELS, WEBSITE_LABELS, type AddressLabel, type InstagramLabel, type PhoneLabel, type WebsiteLabel } from '@/lib/business';
import { businessApi, usersApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { EditableField } from '../../components/ui/EditableField';
import { FormInput } from '../../components/ui/FormInput';
import { InstagramInput, instagramHandleFrom, instagramValueFrom } from '../../components/ui/InstagramInput';
import { Modal } from '../../components/ui/Modal';
import { PHONE_PREFIX, PhoneInput, phoneDigitsFrom } from '../../components/ui/PhoneInput';
import { WebsiteInput, websiteError, websiteRestFrom, websiteValueFrom } from '../../components/ui/WebsiteInput';
import { splitAddress } from './BusinessForm';
import { useIsOwner } from './useIsOwner';
import { useRefresh } from '@/hooks/useRefresh';

export interface BusinessContact {
  address: string | null;
  addressLabel: AddressLabel | null;
  phone: string | null;
  phoneLabel: PhoneLabel | null;
  instagram: string | null;
  instagramLabel: InstagramLabel | null;
  website: string | null;
  websiteLabel: WebsiteLabel | null;
}

interface LabelSelectProps<T extends string> {
  label: string;
  options: readonly T[];
  value: T | '';
  onChange: (value: T | '') => void;
  emptyLabel?: string; // opción para no mostrar texto
}

// Select del texto que acompaña a un dato de contacto.
function LabelSelect<T extends string>({ label, options, value, onChange, emptyLabel }: LabelSelectProps<T>) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm mb-1" style={{ color: '#1D1D1F' }}>{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T | '')} className="w-full px-3 py-2.5 rounded-xl text-sm light-form" style={{ color: '#1D1D1F' }}>
        {emptyLabel && <option value="">{emptyLabel}</option>}
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </div>
  );
}

function ContactDialog({ contact, onClose, onSaved }: { contact: BusinessContact; onClose: () => void; onSaved: () => void }) {
  const [initialStreet, initialNumber] = splitAddress(contact.address);
  const [street, setStreet] = useState(initialStreet);
  const [number, setNumber] = useState(initialNumber);
  const [addressLabel, setAddressLabel] = useState<AddressLabel | ''>(contact.addressLabel ?? ADDRESS_LABELS[0]);
  const [phone, setPhone] = useState(phoneDigitsFrom(contact.phone));
  const [phoneLabel, setPhoneLabel] = useState<PhoneLabel | ''>(contact.phoneLabel ?? '');
  const [instagram, setInstagram] = useState(instagramHandleFrom(contact.instagram));
  const [savedInstagram, setSavedInstagram] = useState(instagram);
  const [instagramLabel, setInstagramLabel] = useState<InstagramLabel | ''>(contact.instagramLabel ?? INSTAGRAM_LABELS[0]);
  const [website, setWebsite] = useState(websiteRestFrom(contact.website));
  const [savedWebsite, setSavedWebsite] = useState(website);
  const [websiteLabel, setWebsiteLabel] = useState<WebsiteLabel | ''>(contact.websiteLabel ?? WEBSITE_LABELS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const phoneIncomplete = phone.length > 0 && phone.length < 8;

  // El Instagram y el sitio web son los mismos del perfil: se guardan aparte, con un aviso antes de cambiarlos.
  const saveInstagram = async () => {
    await usersApi.updateProfile({ companyInstagram: instagramValueFrom(instagram) ?? null });
    setSavedInstagram(instagram);
    onSaved();
  };

  const saveWebsite = async () => {
    await businessApi.updateMe({ website: websiteValueFrom(website) ?? null });
    setSavedWebsite(website);
    onSaved();
  };

  const submit = async () => {
    setSaving(true);
    setError('');
    try {
      // Dirección y teléfono son datos del perfil; los textos son del micro-sitio. null borra el dato.
      await usersApi.updateProfile({
        companyAddress: [street.trim(), number].filter(Boolean).join(' '),
        companyPhone: phone ? `${PHONE_PREFIX}${phone}` : null,
      });
      await businessApi.updateMe({ phoneLabel: phoneLabel || null, addressLabel: addressLabel || null, instagramLabel: instagramLabel || null, websiteLabel: websiteLabel || null });
      onClose();
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudieron guardar los datos'));
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
      <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar contacto</h2>
      <div>
        <p className="text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>Dirección</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormInput label="Calle" value={street} onChange={(e) => setStreet(e.target.value)} />
          </div>
          <FormInput label="Número" inputMode="numeric" value={number} onChange={(e) => setNumber(e.target.value.replace(/\D/g, '').slice(0, 6))} />
        </div>
        <div className="mt-3">
          <LabelSelect label="Texto de la dirección" options={ADDRESS_LABELS} value={addressLabel} onChange={setAddressLabel} />
        </div>
      </div>
      <PhoneInput
        label="Teléfono"
        value={phone}
        onChange={setPhone}
        hint="Ingresa un teléfono válido para que te comuniques con tus clientes."
        info={<p>Agrega un teléfono de la empresa que permita atención al cliente, dudas, respuestas o directamente contacto para atender pedidos.</p>}
      />
      <LabelSelect label="Texto del teléfono" options={PHONE_LABELS} value={phoneLabel} onChange={setPhoneLabel} emptyLabel="Sin texto" />
      <EditableField
        label="Instagram"
        onCancel={() => setInstagram(savedInstagram)}
        onSave={saveInstagram}
        saveDisabled={instagram === savedInstagram}
        confirm={{
          title: 'Actualizar Instagram',
          message: 'Este Instagram es el mismo de tu perfil. Si lo guardas, también se actualizará en tu perfil.',
          confirmLabel: 'Guardar',
        }}
      >
        <InstagramInput label="Instagram" value={instagram} onChange={setInstagram} />
      </EditableField>
      <LabelSelect label="Texto del Instagram" options={INSTAGRAM_LABELS} value={instagramLabel} onChange={setInstagramLabel} />
      <EditableField
        label="Sitio web"
        onCancel={() => setWebsite(savedWebsite)}
        onSave={saveWebsite}
        saveDisabled={website === savedWebsite || !!websiteError(website)}
        confirm={{
          title: 'Actualizar sitio web',
          message: savedWebsite
            ? 'Este sitio web es el mismo de tu perfil. Si lo guardas, también se actualizará en tu perfil.'
            : 'Tu perfil aún no tiene sitio web. Si lo guardas, también se actualizará en tu perfil.',
          confirmLabel: 'Guardar',
        }}
      >
        <WebsiteInput label="Sitio web" value={website} onChange={setWebsite} error={websiteError(website)} />
      </EditableField>
      <LabelSelect label="Texto del sitio web" options={WEBSITE_LABELS} value={websiteLabel} onChange={setWebsiteLabel} />
      <div className="flex flex-wrap items-center justify-end gap-3">
        {error && <p role="alert" className="text-sm mr-auto" style={{ color: '#DC2626' }}>{error}</p>}
        <Button variant="ghost" onClick={onClose} disabled={saving}>Cancelar</Button>
        <Button onClick={submit} disabled={saving || !street.trim() || phoneIncomplete}>{saving ? 'Guardando...' : 'Guardar'}</Button>
      </div>
    </div>
  );
}

interface BusinessContactEditProps {
  slug: string;
  contact: BusinessContact;
  className?: string; // posición del botón
}

// Botón Editar de los datos de contacto en el micro-sitio. Solo lo ve el dueño.
export function BusinessContactEdit({ slug, contact, className = '' }: BusinessContactEditProps) {
  const isOwner = useIsOwner(slug);
  const { refresh, refreshing } = useRefresh();
  const [open, setOpen] = useState(false);

  if (!isOwner) return null;

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} disabled={refreshing} className={className} aria-label="Editar contacto">Editar</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <ContactDialog contact={contact} onClose={() => setOpen(false)} onSaved={refresh} />
      </Modal>
    </>
  );
}
