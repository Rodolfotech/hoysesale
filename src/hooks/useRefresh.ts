'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

// Vuelve a pedir los datos de la página. Mientras dura, refreshing evita abrir un formulario con datos viejos.
export function useRefresh() {
  const router = useRouter();
  const [refreshing, startTransition] = useTransition();
  const refresh = () => startTransition(() => router.refresh());
  return { refresh, refreshing };
}
