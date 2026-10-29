'use client';

import { useState } from 'react';
import { businessApi } from '../../api';
import { ABOUT_MAX_IMAGES } from '@/lib/media-limits';

// Fotos del negocio para "Nosotros" (hasta 3). Cada cambio se guarda al momento, igual que productos y servicios.
export function AboutImages({ images, onChange }: { images: string[]; onChange: (images: string[]) => void }) {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const upload = async (file: File | undefined) => {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const { data } = await businessApi.uploadAboutImage(file);
      onChange(data.aboutImages ?? []);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || 'No se pudo subir la imagen');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (url: string) => {
    setError('');
    try {
      const { data } = await businessApi.deleteAboutImage(url);
      onChange(data.aboutImages ?? []);
    } catch {
      setError('No se pudo quitar la imagen');
    }
  };

  const canUpload = images.length < ABOUT_MAX_IMAGES && !busy;

  return (
    <div className="space-y-3">
      <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Fotos del negocio</p>
      <p className="text-xs" style={{ color: '#1D1D1F99' }}>Hasta {ABOUT_MAX_IMAGES} imágenes · JPG, PNG o WEBP · máximo 4 MB</p>
      {images.length > 0 && (
        <ul className="grid grid-cols-3 gap-3">
          {images.map((url) => (
            <li key={url} className="space-y-1">
              <div className="aspect-[4/3] overflow-hidden rounded-xl" style={{ border: '1px solid #E4EBFA' }}>
                <img src={url} alt="Foto del negocio" className="w-full h-full object-cover" />
              </div>
              <button type="button" onClick={() => remove(url)} className="text-xs underline cursor-pointer" style={{ color: '#DC2626' }}>Quitar</button>
            </li>
          ))}
        </ul>
      )}
      {canUpload && (
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer" style={{ border: '1px solid #2563EB', color: '#2563EB' }}>
          {busy ? 'Subiendo...' : 'Subir foto'}
          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => { upload(e.target.files?.[0]); e.target.value = ''; }} />
        </label>
      )}
      {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
