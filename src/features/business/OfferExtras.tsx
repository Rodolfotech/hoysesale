'use client';

import Link from 'next/link';
import { AMENITY_LABELS, BUSINESS_AMENITIES } from '../../constants/business';

interface OfferExtrasProps {
  amenities: string[];
  onAmenitiesChange: (amenities: string[]) => void;
  disabled?: boolean; // bloquea las comodidades mientras se guardan
}

// Eventos y comodidades de Oferta. Lo usan Editar página y Agregar producto.
export function OfferExtras({ amenities, onAmenitiesChange, disabled = false }: OfferExtrasProps) {
  const toggle = (amenity: string) =>
    onAmenitiesChange(amenities.includes(amenity) ? amenities.filter((current) => current !== amenity) : [...amenities, amenity]);

  return (
    <>
      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Eventos</p>
        <p className="text-sm" style={{ color: '#1D1D1F99' }}>Tus eventos aparecen automáticamente en la página del negocio. Para publicar uno nuevo, créalo desde la sección de eventos.</p>
        <Link href="/create-event" className="inline-block text-sm font-medium underline" style={{ color: '#2563EB' }}>Crear evento</Link>
      </div>

      <div>
        <p className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Comodidades</p>
        <div className="flex flex-wrap gap-2">
          {BUSINESS_AMENITIES.map((amenity) => (
            <label key={amenity} className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full cursor-pointer" style={{ border: '1px solid #E4EBFA', backgroundColor: amenities.includes(amenity) ? '#EFF6FF' : '#FFFFFF' }}>
              <input type="checkbox" checked={amenities.includes(amenity)} disabled={disabled} onChange={() => toggle(amenity)} />
              {AMENITY_LABELS[amenity] ?? amenity}
            </label>
          ))}
        </div>
      </div>
    </>
  );
}
