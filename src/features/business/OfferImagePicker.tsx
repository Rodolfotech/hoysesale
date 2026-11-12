'use client';

import { ITEM_IMAGE_MAX_BYTES, SERVICE_IMAGE_TYPES, WEBP_TYPES } from '@/lib/media-limits';
import { businessApi } from '../../api';
import { ImagePicker } from '../media/ImagePicker';

interface OfferImagePickerProps {
  type: 'products' | 'services';
  label: string;
  value: string | null;
  onChange: (url: string) => void;
}

// Imagen de un producto o servicio: mismas reglas en el formulario del negocio y en el gestor de contenido.
export function OfferImagePicker({ type, label, value, onChange }: OfferImagePickerProps) {
  const noun = type === 'products' ? 'producto' : 'servicio';
  const isService = type === 'services';
  return (
    <ImagePicker
      label={label}
      value={value}
      onChange={onChange}
      onUpload={async (f) => (await businessApi.uploadItemImage(f, type)).data.url}
      hint={isService ? 'Máximo 2 MB · WEBP, JPG o PNG' : 'Máximo 2 MB · WEBP'}
      maxBytes={ITEM_IMAGE_MAX_BYTES}
      allowedTypes={isService ? Object.keys(SERVICE_IMAGE_TYPES) : WEBP_TYPES}
      droppable
      info={<><p className="font-semibold mb-1">Tamaño y formato de la imagen del {noun}</p><p>Tamaño recomendado: <b>800 × 600 px</b>.</p><p>Formato: <b>WEBP</b>.</p><p>Peso máximo: <b>2 MB</b>.</p>{isService && <p className="mt-1">Te sugerimos subirla en <b>.webp</b>: pesa menos y carga más rápido. También se aceptan <b>JPG</b> y <b>PNG</b>.</p>}</>}
    />
  );
}
