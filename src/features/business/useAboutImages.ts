'use client';

import { useState } from 'react';
import { businessApi } from '../../api';
import type { AboutItem } from './AboutImages';

// Fotos de "Nosotros": lo guardado en el servidor y lo que se ve en el formulario hasta presionar Guardar.
export function useAboutImages(initial: string[]) {
  const [saved, setSaved] = useState(initial);
  const [items, setItems] = useState<AboutItem[]>(initial.map((url) => ({ url })));

  // Primero quita y después sube, para no pasar el máximo. Si algo falla, reintentar no repite lo que ya se guardó.
  const save = async () => {
    let current = saved;
    for (const url of current.filter((image) => !items.some((item) => item.url === image))) {
      current = (await businessApi.deleteAboutImage(url)).data.aboutImages ?? [];
      setSaved(current);
    }
    const next = [...items];
    for (const [index, item] of next.entries()) {
      if (!item.file) continue;
      current = (await businessApi.uploadAboutImage(item.file)).data.aboutImages ?? [];
      next[index] = { url: current[current.length - 1] };
      setSaved(current);
      setItems([...next]);
    }
    const order = next.map((item) => item.url);
    if (order.some((url, index) => url !== current[index])) {
      current = (await businessApi.reorderAboutImages(order)).data.aboutImages ?? [];
      setSaved(current);
    }
  };

  return { items, setItems, save };
}
