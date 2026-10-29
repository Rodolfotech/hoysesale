'use client';

import type { User } from '../../types';
import { BusinessForm, type BusinessFormPayload } from './BusinessForm';
import { saveBusinessEdits } from './saveBusiness';

interface BusinessSettingsProps {
  user: User;
  onSaved?: (newSlug?: string) => void;
}

// Editor del micro-sitio dentro del perfil: el mismo formulario por pestañas que usa "Editar".
export function BusinessSettings({ user, onSaved }: BusinessSettingsProps) {
  const save = async (payload: BusinessFormPayload) => {
    await saveBusinessEdits(payload);
    onSaved?.(payload.slug);
  };

  return (
    <section className="rounded-2xl p-6 space-y-4 bg-white" style={{ border: '1px solid #E4EBFA' }}>
      <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Mi micro-sitio</p>
      <BusinessForm
        mode="edit"
        initial={{
          name: user.name,
          comuna: user.comuna,
          slug: user.slug ?? '',
          category: user.category,
          companyAddress: user.companyAddress,
          companyPhone: user.companyPhone,
          companyInstagram: user.companyInstagram,
          website: user.website,
          whatsappReservations: user.whatsappReservations,
          mapUrl: user.mapUrl,
          businessDescription: user.businessDescription,
          amenities: user.amenities,
          hours: user.hours,
          logoUrl: user.logoUrl,
          coverUrl: user.coverUrl,
        }}
        submitLabel="Guardar"
        onSubmit={save}
      />
    </section>
  );
}
