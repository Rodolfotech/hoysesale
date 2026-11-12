'use client';

import { useId, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Plus, X } from 'lucide-react';
import { SERVICE_DESCRIPTION_MAX, SERVICE_TAGS_MAX, SERVICE_TAG_MAX_LENGTH, SERVICE_TAG_SUGGESTIONS, SERVICE_TITLE_MAX } from '@/lib/business';
import { Badge } from '../../components/ui/Badge';
import { ServiceImageDrop } from './ServiceImageDrop';

const fieldClass = 'w-full px-4 py-2.5 rounded-xl text-sm light-form';
const optional = <span className="font-normal" style={{ color: '#1D1D1F99' }}>(opcional)</span>;

// Nombre del campo a la izquierda y contador a la derecha (0/60).
function FieldHeader({ htmlFor, children, count, max }: { htmlFor: string; children: ReactNode; count: number; max: number }) {
  return (
    <div className="flex items-baseline justify-between gap-3 mb-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium" style={{ color: '#1D1D1F' }}>{children}</label>
      <span className="text-xs tabular-nums" style={{ color: '#1D1D1F99' }} aria-live="polite">{count}/{max}</span>
    </div>
  );
}

interface ServiceFieldsProps {
  name: string;
  onNameChange: (value: string) => void;
  description: string;
  onDescriptionChange: (value: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  imageUrl: string;
  onImageChange: (url: string) => void;
}

// Campos del formulario de servicio: nombre, descripción, etiquetas con sugerencias e imagen.
export function ServiceFields({ name, onNameChange, description, onDescriptionChange, tags, onTagsChange, imageUrl, onImageChange }: ServiceFieldsProps) {
  const ids = { name: useId(), description: useId(), tags: useId() };
  const [draft, setDraft] = useState('');
  const full = tags.length >= SERVICE_TAGS_MAX;

  const addTag = (raw: string) => {
    const tag = raw.trim().slice(0, SERVICE_TAG_MAX_LENGTH);
    if (!tag || full || tags.some((t) => t.toLowerCase() === tag.toLowerCase())) return;
    onTagsChange([...tags, tag]);
  };
  const commit = () => { addTag(draft); setDraft(''); };
  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' && e.key !== ',') return;
    e.preventDefault();
    commit();
  };
  const suggestions = SERVICE_TAG_SUGGESTIONS.filter((s) => !tags.some((t) => t.toLowerCase() === s.toLowerCase()));

  return (
    <div className="space-y-5">
      <div>
        <FieldHeader htmlFor={ids.name} count={name.length} max={SERVICE_TITLE_MAX}>
          Nombre del servicio <span style={{ color: '#DC2626' }}>*</span>
        </FieldHeader>
        <input id={ids.name} value={name} onChange={(e) => onNameChange(e.target.value)} maxLength={SERVICE_TITLE_MAX} placeholder="Ej: Viaje premium" required className={fieldClass} />
      </div>

      <div>
        <FieldHeader htmlFor={ids.description} count={description.length} max={SERVICE_DESCRIPTION_MAX}>
          Descripción {optional}
        </FieldHeader>
        <textarea id={ids.description} value={description} onChange={(e) => onDescriptionChange(e.target.value)} maxLength={SERVICE_DESCRIPTION_MAX} rows={3} placeholder="Ej: Recorrido por la ciudad en auto deportivo, 30 minutos." className={`${fieldClass} resize-none`} />
      </div>

      <div>
        <FieldHeader htmlFor={ids.tags} count={tags.length} max={SERVICE_TAGS_MAX}>
          Etiquetas {optional}
        </FieldHeader>
        <input
          id={ids.tags}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={commit}
          maxLength={SERVICE_TAG_MAX_LENGTH}
          disabled={full}
          placeholder={full ? `Máximo ${SERVICE_TAGS_MAX} etiquetas` : 'Escribe una etiqueta...'}
          className={fieldClass}
        />
        {tags.length > 0 && (
          <ul className="flex flex-wrap gap-2 mt-2" aria-label="Etiquetas agregadas">
            {tags.map((tag) => (
              <li key={tag}>
                <Badge tone="brand" className="gap-1">
                  {tag}
                  <button type="button" onClick={() => onTagsChange(tags.filter((t) => t !== tag))} className="cursor-pointer" aria-label={`Quitar etiqueta ${tag}`}>
                    <X className="w-3 h-3" aria-hidden="true" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs mt-2" style={{ color: '#1D1D1F99' }}>Presiona Enter o coma para agregar.{suggestions.length > 0 && !full && ' Sugerencias:'}</p>
        {suggestions.length > 0 && !full && (
          <ul className="flex flex-wrap gap-2 mt-2" aria-label="Etiquetas sugeridas">
            {suggestions.map((s) => (
              <li key={s}>
                <button
                  type="button"
                  onClick={() => addTag(s)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs cursor-pointer hover:border-brand-blue"
                  style={{ border: '1px dashed #CBD5E1', color: '#1D1D1F99' }}
                >
                  <Plus className="w-3 h-3" aria-hidden="true" />
                  {s}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ServiceImageDrop value={imageUrl || null} onChange={onImageChange} />
    </div>
  );
}
