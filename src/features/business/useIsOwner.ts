'use client';

import { useAuth } from '../../context/AuthContext';

// Indica si la sesión actual es la dueña del negocio. Solo decide qué se muestra: el servidor valida cada cambio.
export function useIsOwner(slug: string): boolean {
  return useAuth().user?.slug === slug;
}
