'use client';

import { useAuth } from '../../context/AuthContext';
import { useOwnerPreview } from './OwnerPreview';

// Indica si la sesión actual es la dueña del negocio. Solo decide qué se muestra: el servidor valida cada cambio.
// Durante "Ver como visitante" devuelve false, así la página se muestra como la ve cualquier visitante.
export function useIsOwner(slug: string): boolean {
  const { previewing } = useOwnerPreview();
  const isOwner = useAuth().user?.slug === slug;
  return isOwner && !previewing;
}
