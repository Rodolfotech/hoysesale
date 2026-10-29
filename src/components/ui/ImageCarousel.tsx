'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ImageCarouselProps {
  images: string[];
  alt: string;
}

// Carrusel de fotos: con una sola imagen no muestra flechas; con varias, las flechas se desactivan en los extremos.
export function ImageCarousel({ images, alt }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  if (images.length === 0) return null;

  const last = images.length - 1;
  const arrowClass = 'absolute top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-full bg-white shadow disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div className="relative">
      <div className="overflow-hidden rounded-2xl aspect-[4/3] bg-brand-neutral-2">
        <img src={images[index]} alt={`${alt} (${index + 1} de ${images.length})`} className="w-full h-full object-cover" />
      </div>
      {images.length > 1 && (
        <>
          <button type="button" aria-label="Imagen anterior" onClick={() => setIndex((i) => i - 1)} disabled={index === 0} className={`${arrowClass} left-2`}>
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </button>
          <button type="button" aria-label="Imagen siguiente" onClick={() => setIndex((i) => i + 1)} disabled={index === last} className={`${arrowClass} right-2`}>
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </button>
          <p className="text-center text-xs mt-2" style={{ color: '#1D1D1F99' }}>{index + 1} / {images.length}</p>
        </>
      )}
    </div>
  );
}
