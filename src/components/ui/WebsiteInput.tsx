'use client';

import { useId } from 'react';

// Sitio web: prefijo fijo https:// y el usuario escribe solo el dominio o la ruta.
export const WEBSITE_PREFIX = 'https://';

// Quita el protocolo y los espacios: solo queda lo que escribe el usuario.
export function normalizeWebsiteRest(raw: string): string {
  return raw.replace(/^https?:\/\//i, '').replace(/\s+/g, '');
}

// Parte que va después de https:// a partir del valor guardado.
export function websiteRestFrom(stored: string | null | undefined): string {
  return normalizeWebsiteRest(stored ?? '');
}

// Un dominio válido tiene un nombre y una extensión: www.mitienda.cl o mitienda.cl/menu. Vacío es válido (opcional).
export function websiteError(rest: string): string | undefined {
  const clean = normalizeWebsiteRest(rest);
  if (!clean) return undefined;
  return /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}([/?#].*)?$/i.test(clean) ? undefined : 'Escribe un dominio válido, por ejemplo www.mitienda.cl';
}

// Valor que se guarda: https://dominio (o undefined si está vacío).
export function websiteValueFrom(rest: string): string | undefined {
  const clean = normalizeWebsiteRest(rest);
  return clean ? `${WEBSITE_PREFIX}${clean}` : undefined;
}

interface WebsiteInputProps {
  label: string;
  value: string; // lo que va después de https://
  onChange: (rest: string) => void;
  error?: string;
  id?: string;
}

export function WebsiteInput({ label, value, onChange, error, id }: WebsiteInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium mb-1.5" style={{ color: '#1D1D1F', fontSize: '14px' }}>
        {label}
      </label>
      <div
        className="flex items-stretch rounded-xl overflow-hidden light-form"
        style={{ border: error ? '1px solid #DC2626' : undefined }}
      >
        <span className="flex items-center px-3 text-sm select-none" style={{ backgroundColor: '#F1F5F9', color: '#1D1D1F' }} aria-hidden="true">
          {WEBSITE_PREFIX}
        </span>
        <input
          id={inputId}
          type="text"
          inputMode="url"
          autoComplete="url"
          value={value}
          onChange={(e) => onChange(normalizeWebsiteRest(e.target.value))}
          placeholder="www.mitienda.cl"
          maxLength={200}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className="flex-1 px-3 py-2 text-sm outline-none bg-transparent"
          style={{ color: '#1D1D1F' }}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>
          {error}
        </p>
      )}
    </div>
  );
}
