'use client';

interface ProfileFieldProps {
  label: string;
  value: string;
  editing?: boolean;
  onChange?: (value: string) => void;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'select';
  required?: boolean;
  disabled?: boolean;
  options?: readonly string[] | string[];
}

export function ProfileField({ label, value, editing, onChange, placeholder, type = 'text', required, disabled, options }: ProfileFieldProps) {
  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px', color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>
        {label}{required && <span style={{ color: '#DC2626' }}> *</span>}
      </p>
      {editing ? (
        type === 'select' && options ? (
          <select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className="profile-input w-full text-sm px-3 py-2.5 rounded-xl"
          >
            <option value="" disabled>{placeholder || `Seleccione ${label.toLowerCase()}`}</option>
            {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input
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
            {value || '—'}
          </p>
        </div>
      )}
    </div>
  );
}
