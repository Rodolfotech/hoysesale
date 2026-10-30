'use client';

import { ITEM_IMAGE_MAX_BYTES, WEBP_TYPES } from '@/lib/media-limits';
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
  return (
    <ImagePicker
      label={label}
      value={value}
      onChange={onChange}
      onUpload={async (f) => (await businessApi.uploadItemImage(f)).data.url}
      hint="Máximo 2 MB · WEBP"
      maxBytes={ITEM_IMAGE_MAX_BYTES}
      allowedTypes={WEBP_TYPES}
      info={<><p className="font-semibold mb-1">Tamaño y formato de la imagen del {noun}</p><p>Tamaño recomendado: <b>800 × 600 px</b>.</p><p>Formato: <b>WEBP</b>.</p><p>Peso máximo: <b>2 MB</b>.</p></>}
    />
  );
}
