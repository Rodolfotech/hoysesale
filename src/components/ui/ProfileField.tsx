'use client';

import type { CSSProperties } from 'react';
import { PHONE_PREFIX, formatPhoneDigits, normalizePhoneDigits, phoneDigitsFrom } from './PhoneInput';
import { Popover } from './Popover';

// Dígitos después del +569, aunque el número esté a medio escribir.
const phoneDigits = (value: string) => (value.startsWith(PHONE_PREFIX) ? value.slice(PHONE_PREFIX.length) : phoneDigitsFrom(value));

// Estilo de las etiquetas del perfil. También lo usa InstagramInput dentro del perfil.
export const PROFILE_LABEL_STYLE: CSSProperties = { fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" } as const;

interface ProfileFieldProps {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'select' | 'phone'; // phone: +569 fijo y 8 dígitos; value es +569XXXXXXXX o ''
  required?: boolean;
  disabled?: boolean;
  options?: readonly string[] | string[];
  groups?: readonly { label: string; options: readonly string[] }[]; // opciones agrupadas (optgroup)
  info?: string; // texto del popover de un campo obligatorio
  id?: string; // permite llevar el foco a este campo
}

// Campo del perfil. Los obligatorios llevan asterisco y un popover que lo explica.
export function ProfileField({ label, value, editing, onChange, placeholder, type = 'text', required, disabled, options, groups, info, id }: ProfileFieldProps) {
  return (
    <div>
      <div className="flex items-center gap-1.5" style={{ marginBottom: '6px' }}>
        <p style={PROFILE_LABEL_STYLE}>
          {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
        </p>
        {required && <Popover label={`Información de ${label.toLowerCase()}`}><p>{info ?? `${label} es obligatorio.`}</p></Popover>}
      </div>
      {editing && type === 'phone' ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={PHONE_PREFIX}
            readOnly
            tabIndex={-1}
            aria-label="Prefijo"
            className="profile-input w-20 shrink-0 text-sm px-3 py-2.5 rounded-xl text-center"
            style={{ backgroundColor: '#F1F5F9' }}
          />
          <input
            id={id}
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            value={formatPhoneDigits(phoneDigits(value))}
            onChange={(e) => {
              const digits = normalizePhoneDigits(e.target.value);
              if (/^[12]/.test(digits)) return; // un móvil chileno no empieza con 1 ni 2
              onChange?.(digits ? `${PHONE_PREFIX}${digits}` : '');
            }}
            placeholder={placeholder ?? '1234 5678'}
            disabled={disabled}
            className="profile-input w-full min-w-0 text-sm px-3 py-2.5 rounded-xl"
          />
        </div>
      ) : editing ? (
        type === 'select' && (options || groups) ? (
          <select
            id={id}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="profile-input w-full text-sm px-3 py-2.5 rounded-xl"
          >
            <option value="" disabled>{placeholder || `Seleccione ${label.toLowerCase()}`}</option>
            {options?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
            {groups?.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
              </optgroup>
            ))}
          </select>
        ) : (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="profile-input w-full text-sm px-3 py-2.5 rounded-xl"
          />
        )
      ) : (
        <div className="rounded-xl px-3 py-2.5" style={{ border: '1px solid #E4EBFA', backgroundColor: '#FFFFFF' }}>
          <p style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>
            {type === 'phone' && value ? `${PHONE_PREFIX} ${formatPhoneDigits(phoneDigits(value))}` : value || '—'}
          </p>
        </div>
      )}
    </div>
  );
}
