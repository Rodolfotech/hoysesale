'use client';

import { useEffect, useState } from 'react';
import { Upload, X } from 'lucide-react';

export const MEDIA_ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const MEDIA_MAX_BYTES = 5 * 1024 * 1024;

interface MediaUploaderProps {
  file: File | null;
  onChange: (file: File | null) => void;
  onError?: (message: string) => void;
}

// Selector de imagen reutilizable: valida formato y tamaño, y muestra vista previa.
export function MediaUploader({ file, onChange, onError }: MediaUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handlePick = (picked: File | undefined) => {
    if (!picked) return;
    if (!MEDIA_ACCEPTED_TYPES.includes(picked.type)) {
      onError?.('Formato no permitido (usa jpeg, png o webp)');
      return;
    }
    if (picked.size > MEDIA_MAX_BYTES) {
      onError?.('La imagen supera el máximo de 5 MB');
      return;
    }
    onChange(picked);
  };

  return (
    <div>
      {preview ? (
        <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
          <img src={preview} alt="Vista previa" className="w-full h-auto object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="Quitar imagen"
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}
          >
            <X className="w-4 h-4" style={{ color: '#1D1D1F' }} />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-2 rounded-xl py-8 cursor-pointer text-sm"
          style={{ border: '1px dashed #2563EB', color: '#2563EB', backgroundColor: '#F8FAFC' }}
        >
          <Upload className="w-6 h-6" />
          <span>Subir imagen (jpeg, png o webp, máx. 5 MB)</span>
          <input
            type="file"
            accept={MEDIA_ACCEPTED_TYPES.join(',')}
            className="hidden"
            onChange={(e) => handlePick(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  );
}
