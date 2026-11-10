'use client';

import { openCookieSettings } from '@/lib/consent';

// Abre el panel de cookies para cambiar o retirar el consentimiento en cualquier momento.
export function CookieSettingsButton({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <button type="button" onClick={openCookieSettings} className={`cursor-pointer text-left ${className ?? ''}`} style={style}>
      Configurar cookies
    </button>
  );
}
