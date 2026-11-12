'use client';

import { useId, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { apiErrorMessage } from '@/lib/api-error';
import { ITEM_IMAGE_MAX_BYTES, SERVICE_IMAGE_TYPES } from '@/lib/media-limits';
import { useFileDrop } from '@/hooks/useFileDrop';
import { Popover } from '../../components/ui/Popover';
import { businessApi } from '../../api';

interface ServiceImageDropProps {
  value: string | null;
  onChange: (url: string) => void; // '' quita la imagen
}

// Imagen de un servicio: recuadro para arrastrar o elegir el archivo. Sube al elegirlo y conserva la URL.
export function ServiceImageDrop({ value, onChange }: ServiceImageDropProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const pick = async (file: File | undefined) => {
    if (!file) return;
    if (!SERVICE_IMAGE_TYPES[file.type]) {
      setError('Formato no permitido. Usa WEBP, JPG o PNG');
      return;
    }
    if (file.size > ITEM_IMAGE_MAX_BYTES) {
      setError('La imagen es muy pesada. Tamaño máximo 2 MB');
      return;
    }
    setError('');
    setUploading(true);
    try {
      onChange((await businessApi.uploadItemImage(file, 'services')).data.url);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo subir la imagen'));
    } finally {
      setUploading(false);
    }
  };

  const { dragging, dropProps } = useFileDrop((files) => { if (!uploading) pick(files[0]); });

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <p id={`${inputId}-label`} className="text-sm font-medium" style={{ color: '#1D1D1F' }}>
          Imagen del servicio <span className="font-normal" style={{ color: '#1D1D1F99' }}>(opcional)</span>
        </p>
        <Popover label="Información de la imagen del servicio">
          <p className="font-semibold mb-1">Tamaño y formato de la imagen del servicio</p>
          <p>Tamaño recomendado: <b>800 × 600 px</b>.</p>
          <p>Formato: <b>WEBP</b>.</p>
          <p>Peso máximo: <b>2 MB</b>.</p>
          <p className="mt-1">Te sugerimos subirla en <b>.webp</b>: pesa menos y carga más rápido. También se aceptan <b>JPG</b> y <b>PNG</b>.</p>
        </Popover>
      </div>
      {value ? (
        <div className="relative w-full max-w-xs aspect-[4/3] rounded-xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }} {...dropProps}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Imagen del servicio" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer"
            style={{ backgroundColor: '#FFFFFFE6', color: '#1D1D1F' }}
            aria-label="Quitar imagen del servicio"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className="flex flex-col items-center justify-center gap-2 w-full py-8 px-4 rounded-xl text-center cursor-pointer focus-within:ring-2"
          style={{ border: '1.5px dashed #2563EB', backgroundColor: dragging ? '#DBEAFE' : '#EFF6FF', opacity: uploading ? 0.6 : 1 }}
          {...dropProps}
        >
          <ImagePlus className="w-6 h-6" style={{ color: '#2563EB' }} aria-hidden="true" />
          <span className="text-sm font-medium" style={{ color: '#1D1D1F' }}>
            {uploading ? 'Subiendo…' : 'Arrastra una imagen o haz clic para elegir'}
          </span>
          <span className="text-xs" style={{ color: '#1D1D1F99' }}>WEBP, JPG o PNG · Máximo 2 MB</span>
          <input
            id={inputId}
            type="file"
            accept={Object.keys(SERVICE_IMAGE_TYPES).join(',')}
            className="sr-only"
            disabled={uploading}
            aria-labelledby={`${inputId}-label`}
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>
      )}
      {error && <p role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
