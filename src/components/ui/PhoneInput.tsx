'use client';

import { useId } from 'react';

// Teléfono chileno móvil: prefijo fijo +56 9 (bandera de Chile) y 8 dígitos, con un espacio cada 4 (1234 5678).
// Los dígitos no pueden empezar con 1 ni 2.
export const PHONE_PREFIX = '+569';
const DIGITS = 8;

// Solo dígitos, máximo 8. Si pegan el número completo con el 569 incluido, se quita el prefijo.
export function normalizePhoneDigits(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.length > DIGITS && digits.startsWith('569')) digits = digits.slice(3);
  return digits.slice(0, DIGITS);
}

// Convierte el teléfono guardado (+569XXXXXXXX) en los 8 dígitos del campo.
export function phoneDigitsFrom(stored: string | null | undefined): string {
  return normalizePhoneDigits(stored ?? '');
}

// Formato visible: 1234 5678.
export function formatPhoneDigits(digits: string): string {
  return digits.replace(/^(\d{4})(\d{1,4})/, '$1 $2');
}

function ChileFlag() {
  return (
    <svg viewBox="0 0 900 600" width="20" height="14" aria-hidden="true" className="shrink-0 rounded-sm">
      <rect width="900" height="300" fill="#FFFFFF" />
      <rect y="300" width="900" height="300" fill="#D52B1E" />
      <rect width="300" height="300" fill="#0039A6" />
      <path d="M150.0 50.0 L173.5 117.6 L245.1 119.1 L188.0 162.4 L208.8 230.9 L150.0 190.0 L91.2 230.9 L112.0 162.4 L54.9 119.1 L126.5 117.6 Z" fill="#FFFFFF" />
    </svg>
  );
}

interface PhoneInputProps {
  label: string;
  value: string; // solo los 8 dígitos, sin espacios
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
        <span className="flex items-center gap-2 px-3 text-sm select-none" style={{ backgroundColor: '#F1F5F9', color: '#1D1D1F' }} aria-hidden="true">
          <ChileFlag />
          +56 9
        </span>
        <input
          id={inputId}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={formatPhoneDigits(value)}
          onChange={(e) => {
            const next = normalizePhoneDigits(e.target.value);
            // Un móvil chileno no empieza con 1 ni 2: ese dígito se descarta.
            if (/^[12]/.test(next)) return;
            onChange(next);
          }}
          placeholder="1234 5678"
          maxLength={9}
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
        <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Ingresa 8 dígitos. No pueden empezar con 1 ni 2.</p>
      )}
    </div>
  );
}
