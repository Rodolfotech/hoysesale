'use client';

import { useId } from 'react';

// Usuario de Instagram: prefijo fijo @ y hasta 30 caracteres (letras, números, _ y .).
// No se permiten guiones, @, emojis ni dos puntos seguidos.
export const INSTAGRAM_MAX = 30;
export const INSTAGRAM_HANDLE_PATTERN = /^[A-Za-z0-9_](?:[A-Za-z0-9_.]{0,28}[A-Za-z0-9_])?$/;

export function normalizeInstagramHandle(raw: string): string {
  return raw
    .replace(/[^A-Za-z0-9_.]/g, '')
    .replace(/\.{2,}/g, '.')
    .slice(0, INSTAGRAM_MAX);
}

// Usuario a partir del valor guardado ("@usuario" o una URL de instagram.com).
export function instagramHandleFrom(stored: string | null | undefined): string {
  const value = (stored ?? '').trim();
  if (/^https?:\/\//i.test(value)) {
    try {
      return normalizeInstagramHandle(new URL(value).pathname.split('/').filter(Boolean)[0] ?? '');
    } catch {
      return '';
    }
  }
  return normalizeInstagramHandle(value);
}

// Valor que se guarda: "@usuario" sin puntos al final.
export function instagramValueFrom(handle: string): string | undefined {
  const clean = handle.replace(/\.+$/, '');
  return clean ? `@${clean}` : undefined;
}

interface InstagramInputProps {
  label: string;
  value: string; // solo el usuario, sin @
  onChange: (handle: string) => void;
  error?: string;
  id?: string;
}

export function InstagramInput({ label, value, onChange, error, id }: InstagramInputProps) {
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
          @
        </span>
        <input
          id={inputId}
          type="text"
          autoComplete="off"
          value={value}
          onChange={(e) => onChange(normalizeInstagramHandle(e.target.value))}
          placeholder="mi_local"
          maxLength={INSTAGRAM_MAX}
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
        <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>Hasta 30 caracteres: letras, números, _ o .</p>
      )}
    </div>
  );
}
