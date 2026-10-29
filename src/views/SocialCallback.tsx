'use client';

import { useEffect } from 'react';
import { useSearchParams } from '@/lib/router';

export default function SocialCallback() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (!window.opener) return;

    if (error) {
      window.opener.postMessage({ type: 'instagram-code', error: true }, '*');
      window.close();
      return;
    }

    if (!code) {
      window.opener.postMessage({ type: 'instagram-code', error: true }, '*');
      window.close();
      return;
    }

    window.opener.postMessage({ type: 'instagram-code', code }, '*');
    window.close();
  }, [searchParams]);

  return null;
}
