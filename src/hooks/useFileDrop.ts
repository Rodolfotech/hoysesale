'use client';

import { useState, type DragEvent } from 'react';

// Permite soltar archivos sobre un elemento. Con enabled en false no hace nada.
// Ignora lo que no sean archivos, como una foto que se arrastra para reordenarla.
const hasFiles = (e: DragEvent<HTMLElement>) => e.dataTransfer.types.includes('Files');

export function useFileDrop(onDrop: (files: File[]) => void, enabled = true) {
  const [dragging, setDragging] = useState(false);

  const dropProps = enabled
    ? {
        // Sin preventDefault, el navegador abre el archivo y se sale de la página.
        onDragOver: (e: DragEvent<HTMLElement>) => { if (hasFiles(e)) { e.preventDefault(); setDragging(true); } },
        onDragLeave: (e: DragEvent<HTMLElement>) => { if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false); },
        onDrop: (e: DragEvent<HTMLElement>) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          setDragging(false);
          onDrop(Array.from(e.dataTransfer.files));
        },
      }
    : {};

  return { dragging, dropProps };
}
