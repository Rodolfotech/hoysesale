'use client';

import { useId, useRef, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps {
  id?: string;
  icon?: LucideIcon;
  label?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  rightElement?: React.ReactNode;
  autoComplete?: string;
  filledBg?: string;
}

export function FormInput({
  id: propId,
  icon: Icon,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  rightElement,
  autoComplete,
  filledBg,
}: FormInputProps) {
  const generatedId = useId();
  const inputId = propId ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (filledBg && inputRef.current) {
      inputRef.current.style.setProperty('background', value ? filledBg : '#FFFFFF', 'important');
    }
  }, [value, filledBg]);

  return (
    <div>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium mb-1.5"
          style={{ color: '#1D1D1F', fontSize: '14px' }}
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: '#2563EB' }} />
        )}
        <input
          ref={inputRef}
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} ${rightElement ? 'pr-10' : 'pr-4'} py-2.5 rounded-xl text-sm light-form`}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
