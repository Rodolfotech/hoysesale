'use client';

import { useEffect, useState } from 'react';
import type { User } from '../../types';
import { businessApi } from '../../api';
import { BusinessForm, type BusinessFormPayload } from './BusinessForm';
import { productsToOffer, servicesToOffer, type OfferItem } from './OfferItems';
import { saveBusinessEdits } from './saveBusiness';

interface BusinessSettingsProps {
  user: User;
  onSaved?: (newSlug?: string) => void;
}

// Editor del micro-sitio dentro del perfil: el mismo formulario por pestañas que usa "Editar".
export function BusinessSettings({ user, onSaved }: BusinessSettingsProps) {
  // Productos y servicios vienen del micro-sitio público (el perfil no los trae).
  const [content, setContent] = useState<{ products: OfferItem[]; services: OfferItem[] } | null>(user.slug ? null : { products: [], services: [] });

  useEffect(() => {
    if (!user.slug) return;
    let cancelled = false;
    businessApi.getBySlug(user.slug)
      .then(({ data }) => {
        if (!cancelled) setContent({ products: productsToOffer(data.products ?? []), services: servicesToOffer(data.services ?? []) });
      })
      .catch(() => {
        if (!cancelled) setContent({ products: [], services: [] });
      });
    return () => { cancelled = true; };
  }, [user.slug]);

  const save = async (payload: BusinessFormPayload) => {
    await saveBusinessEdits(payload);
    onSaved?.(payload.slug);
  };

  return (
    <section className="rounded-2xl p-6 space-y-4 bg-white" style={{ border: '1px solid #E4EBFA' }}>
      <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Mi micro-sitio</p>
      {!content ? (
        <p className="text-sm" style={{ color: '#1D1D1F99' }}>Cargando datos del micro-sitio...</p>
      ) : (
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
            aboutImages: user.aboutImages ?? [],
            products: content.products,
            services: content.services,
          }}
          submitLabel="Guardar"
          onSubmit={save}
        />
      )}
    </section>
  );
}
