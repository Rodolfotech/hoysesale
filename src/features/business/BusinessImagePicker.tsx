'use client';

import { COVER_IMAGE_TYPES, COVER_MAX_BYTES, COVER_SIZE, LOGO_IMAGE_TYPES, LOGO_MAX_BYTES } from '@/lib/media-limits';
import { businessApi } from '../../api';
import { ImagePicker } from '../media/ImagePicker';

interface BusinessImagePickerProps {
  kind: 'logo' | 'cover';
  value: string | null;
  onChange: (url: string) => void;
  rounded?: boolean; // muestra el logo con marco redondo
}

// Selector del logo o la portada. La imagen se guarda en el servidor apenas se sube.
export function BusinessImagePicker({ kind, value, onChange, rounded }: BusinessImagePickerProps) {
  if (kind === 'logo') {
    return (
      <ImagePicker
        label="Logo"
        value={value}
        rounded={rounded}
        onChange={onChange}
        onUpload={async (f) => (await businessApi.uploadImage('logo', f)).data.logoUrl as string}
        droppable
        hint="Máximo 10 KB · Ideal en WEBP"
        maxBytes={LOGO_MAX_BYTES}
        allowedTypes={Object.keys(LOGO_IMAGE_TYPES)}
        info={<><p className="font-semibold mb-1">Tamaño y formato del logo</p><p>Tamaño recomendado: <b>400 × 400 px</b>.</p><p>Formato recomendado: <b>WEBP</b>. También puedes usar JPG, PNG o GIF.</p><p>Peso máximo: <b>10 KB</b>.</p></>}
      />
    );
  }
  return (
    <ImagePicker
      label="Portada"
      value={value}
      onChange={onChange}
      onUpload={async (f) => (await businessApi.uploadImage('cover', f)).data.coverUrl as string}
      aspect="wide"
      droppable
      hint="1200 × 400 px · Máximo 90 KB · JPG, JPEG o WEBP"
      maxBytes={COVER_MAX_BYTES}
      allowedTypes={Object.keys(COVER_IMAGE_TYPES)}
      requiredSize={COVER_SIZE}
      info={<><p className="font-semibold mb-1">Medida y peso de la portada</p><p>Medida: <b>1200 × 400 px</b>.</p><p>Peso máximo: <b>90 KB</b>.</p><p>Formato: <b>JPG</b>, <b>JPEG</b> o <b>WEBP</b>.</p></>}
    />
  );
}
