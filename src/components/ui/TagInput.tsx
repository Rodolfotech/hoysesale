'use client';

import { useState, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from './Badge';
import { FormInput } from './FormInput';

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  max: number;
  maxLength: number;
}

// Lista de etiquetas de texto libre. Se agregan con Enter o coma, o al salir del campo.
export function TagInput({ label, value, onChange, max, maxLength }: TagInputProps) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const tag = draft.trim();
    setDraft('');
    if (!tag || value.length >= max) return;
    if (value.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onChange([...value, tag]);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    commit();
  };

  return (
    <div className="space-y-2">
      <div onKeyDown={onKeyDown} onBlur={commit}>
        <FormInput label={label} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={maxLength} placeholder={value.length >= max ? `Máximo ${max} etiquetas` : 'Escribe y presiona Enter'} />
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Etiquetas agregadas">
          {value.map((tag) => (
            <li key={tag}>
              <Badge tone="brand" className="gap-1">
                {tag}
                <button type="button" onClick={() => onChange(value.filter((t) => t !== tag))} className="cursor-pointer" aria-label={`Quitar etiqueta ${tag}`}>
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
