'use client';

import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { FormInput } from './FormInput';
import type { LucideIcon } from 'lucide-react';

interface PasswordInputProps {
  label?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: LucideIcon;
  autoComplete?: string;
  filledBg?: string;
}

export function PasswordInput({
  label,
  value,
  onChange,
  placeholder = '••••••••',
  icon: Icon,
  autoComplete,
  filledBg,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <FormInput
      icon={Icon}
      label={label}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      autoComplete={autoComplete}
      filledBg={filledBg}
      rightElement={
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-gray-500 hover:text-gray-300 cursor-pointer"
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
    />
  );
}
