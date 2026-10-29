'use client';

import { useId } from 'react';

// Teléfono chileno móvil: prefijo fijo +569 y 8 dígitos. Acepta espacios al pegar.
export const PHONE_PREFIX = '+569';

export function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  // Si pegan el número completo con el 569 incluido, se quita el prefijo
  if (digits.length === 11 && digits.startsWith('569')) digits = digits.slice(3);
  return digits.slice(0, 8);
}

interface PhoneInputProps {
  label: string;
  value: string; // solo los 8 dígitos
  onChange: (digits: string) => void;
  error?: string;
  required?: boolean;
  id?: string;
}

export function PhoneInput({ label, value, onChange, error, required, id }: PhoneInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm mb-1" style={{ color: '#1D1D1F' }}>
        {label}
      </label>
      <div
        className="flex items-stretch rounded-xl overflow-hidden light-form"
        style={{ border: error ? '1px solid #DC2626' : undefined }}
      >
        <span className="flex items-center px-3 text-sm select-none" style={{ backgroundColor: '#F1F5F9', color: '#1D1D1F99' }} aria-hidden="true">
          {PHONE_PREFIX}
        </span>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={value}
          onChange={(e) => onChange(normalizePhoneDigits(e.target.value))}
          placeholder="3 5364 591"
          maxLength={12}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
          style={{ color: '#1D1D1F' }}
        />
      </div>
      {error ? (
        <p id={errorId} role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>
          {error}
        </p>
      ) : (
        <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Ingresa 8 dígitos después de +569</p>
      )}
    </div>
  );
}
