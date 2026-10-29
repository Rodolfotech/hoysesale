'use client';

import { useId, useState } from 'react';
import { Upload } from 'lucide-react';
import { MEDIA_ACCEPTED_TYPES, MEDIA_MAX_BYTES } from './MediaUploader';

interface ImagePickerProps {
  label: string;
  value: string | null; // URL de la imagen guardada
  onUpload: (file: File) => Promise<string>; // devuelve la nueva URL
  onChange: (url: string) => void;
  aspect?: 'square' | 'wide';
  hint?: string;
}

// Imagen guardada con opción de cambiarla. Sube al elegir el archivo y conserva la URL.
export function ImagePicker({ label, value, onUpload, onChange, aspect = 'square', hint }: ImagePickerProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!MEDIA_ACCEPTED_TYPES.includes(file.type)) {
      setError('Formato no permitido (usa jpeg, png o webp)');
      return;
    }
    if (file.size > MEDIA_MAX_BYTES) {
      setError('La imagen supera el máximo de 5 MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      onChange(await onUpload(file));
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <p id={`${inputId}-label`} className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>{label}</p>
      <div className={`relative w-full ${aspect === 'wide' ? 'max-w-2xl aspect-[3/1]' : 'max-w-[200px] aspect-square'} rounded-xl overflow-hidden`} style={{ border: '1px solid #E4EBFA', backgroundColor: '#F8FAFC' }}>
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt={`${label} actual`} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs" style={{ color: '#1D1D1F99' }}>Sin imagen</div>
        )}
      </div>
      <label
        htmlFor={inputId}
        className="mt-2 inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium cursor-pointer focus-within:ring-2"
        style={{ color: '#2563EB', border: '1px solid #2563EB', backgroundColor: '#FFFFFF', opacity: uploading ? 0.5 : 1 }}
      >
        <Upload className="w-4 h-4" aria-hidden="true" />
        {uploading ? 'Subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
        <input
          id={inputId}
          type="file"
          accept={MEDIA_ACCEPTED_TYPES.join(',')}
          className="sr-only"
          disabled={uploading}
          aria-labelledby={`${inputId}-label`}
          onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
        />
      </label>
      {hint && <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>{hint}</p>}
      {error && <p role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
