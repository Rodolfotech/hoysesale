'use client';

import { useEffect } from 'react';
import { useSearchParams } from '@/lib/router';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');

    if (!window.opener) return;

    if (!code) {
      window.opener.postMessage({ type: 'google-code', error: true }, window.location.origin);
      window.close();
      return;
    }

    // Solo a una página de este mismo sitio: el código no debe llegar a otro dominio.
    window.opener.postMessage({ type: 'google-code', code }, window.location.origin);
    window.close();
  }, [searchParams]);

  return null;
}
