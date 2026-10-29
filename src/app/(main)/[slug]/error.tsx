'use client';

import { useEffect } from 'react';
import { Button } from '../../../components/ui/Button';

// Se muestra si el backend no responde al cargar /<slug>. Permite reintentar sin recargar toda la app.
export default function SlugError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
      <h1 className="text-2xl font-semibold text-brand-dark">No pudimos cargar esta página</h1>
      <p className="text-sm text-brand-dark/60">
        Hay un problema de conexión con el servidor. Intenta de nuevo en unos segundos.
      </p>
      <div className="flex justify-center">
        <Button onClick={reset}>Intentar de nuevo</Button>
      </div>
    </main>
  );
}
