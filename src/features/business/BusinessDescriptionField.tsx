'use client';

import { BUSINESS_DESCRIPTION_MAX } from '@/lib/business';

interface BusinessDescriptionFieldProps {
  value: string;
  onChange: (value: string) => void;
}

// Campo de la descripción del negocio, con su límite de caracteres.
export function BusinessDescriptionField({ value, onChange }: BusinessDescriptionFieldProps) {
  return (
    <div>
      <label className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>
        Descripción (2 a 4 párrafos; separa los párrafos con una línea en blanco)
        <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={6} maxLength={BUSINESS_DESCRIPTION_MAX} className="mt-1 w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
      </label>
      <p className="text-xs mt-1 text-right" style={{ color: '#1D1D1F99' }}>Límite máximo {BUSINESS_DESCRIPTION_MAX} caracteres</p>
    </div>
  );
}
