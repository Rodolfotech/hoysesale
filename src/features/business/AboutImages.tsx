'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Popover } from '@/components/ui/Popover';
import { useFileDrop } from '@/hooks/useFileDrop';
import { ABOUT_MAX_IMAGES, MAX_IMAGE_BYTES } from '@/lib/media-limits';

const ABOUT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Foto de "Nosotros". Con file, aún no está guardada: url es solo la vista previa.
export interface AboutItem {
  url: string;
  file?: File;
}

interface AboutImagesProps {
  items: AboutItem[];
  onChange: (items: AboutItem[]) => void;
}

// Fotos del negocio para "Nosotros" (hasta 3). Los cambios quedan pendientes hasta presionar Guardar en el formulario.
export function AboutImages({ items, onChange }: AboutImagesProps) {
  const [error, setError] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);

  // Al arrastrar no aplica el filtro del selector, por eso se revisa cada archivo.
  const add = (files: File[]) => {
    if (files.length === 0) return;
    // El máximo se explica en el popover: lo que sobra simplemente no se toma.
    const free = ABOUT_MAX_IMAGES - items.length;
    if (free <= 0) return;
    let problem = '';
    const added: AboutItem[] = [];
    for (const file of files.slice(0, free)) {
      if (!ABOUT_TYPES.includes(file.type)) problem = 'Formato no permitido (usa JPG, PNG o WEBP)';
      else if (file.size > MAX_IMAGE_BYTES) problem = 'La imagen es muy pesada. Tamaño máximo 4 MB';
      else added.push({ url: URL.createObjectURL(file), file });
    }
    setError(problem);
    onChange([...items, ...added]);
  };

  const { dragging, dropProps } = useFileDrop(add);

  const endDrag = () => {
    setDraggedIndex(null);
    setTargetIndex(null);
  };

  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (item: AboutItem) => {
    setError('');
    if (item.file) URL.revokeObjectURL(item.url);
    onChange(items.filter((current) => current !== item));
  };

  return (
    <div className="space-y-3" {...dropProps}>
      <div className="flex items-center gap-1.5">
        <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Fotos del negocio</p>
        <Popover label="Información de las fotos del negocio">
          <p className="font-semibold mb-1">Fotos del negocio</p>
          <p>Puedes subir hasta <b>{ABOUT_MAX_IMAGES} imágenes</b>.</p>
          <p>Formato: <b>JPG</b>, <b>PNG</b> o <b>WEBP</b>.</p>
          <p>Peso máximo: <b>4 MB</b>.</p>
          <p>Se publican al presionar <b>Guardar</b>.</p>
        </Popover>
      </div>
      {items.length > 0 && (
        <ul className="grid grid-cols-3 gap-3">
          {items.map((item, index) => (
            <li
              key={item.url}
              draggable
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(index)); setDraggedIndex(index); }}
              onDragOver={(e) => { if (draggedIndex !== null) { e.preventDefault(); setTargetIndex(index); } }}
              onDrop={(e) => { if (draggedIndex !== null) { e.preventDefault(); move(draggedIndex, index); endDrag(); } }}
              onDragEnd={endDrag}
              className="relative cursor-move"
              style={{ opacity: draggedIndex === index ? 0.5 : 1 }}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-xl" style={{ border: `${targetIndex === index ? '2px solid #2563EB' : '1px solid #E4EBFA'}` }}>
                <img src={item.url} alt="Foto del negocio" draggable={false} className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => remove(item)}
                aria-label={`Quitar foto ${index + 1}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full flex items-center justify-center shadow cursor-pointer hover:opacity-80"
                style={{ backgroundColor: '#FFFFFF', color: '#1D1D1F' }}
              >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {items.length > 1 && <p className="text-xs" style={{ color: '#1D1D1F99' }}>Arrastra las fotos para cambiar el orden. La primera es la que se ve al entrar.</p>}
      {items.length < ABOUT_MAX_IMAGES && (
        <label
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium cursor-pointer"
          style={{ border: `1px ${dragging ? 'dashed' : 'solid'} #2563EB`, color: '#2563EB', backgroundColor: dragging ? '#EFF6FF' : undefined }}
        >
          Subir foto o arrastrar aquí
          <input type="file" accept={ABOUT_TYPES.join(',')} className="sr-only" onChange={(e) => { add(Array.from(e.target.files ?? [])); e.target.value = ''; }} />
        </label>
      )}
      {error && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{error}</p>}
    </div>
  );
}
