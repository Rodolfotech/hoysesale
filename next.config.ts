import type { NextConfig } from 'next';

// Sin nonces: 'unsafe-inline' es necesario para los scripts de Next y permite mantener páginas estáticas y en caché.
// Las imágenes llegan de Supabase e Instagram (CDN con varios dominios), por eso se permite cualquier https.
// En desarrollo no se aplica: el refresco en caliente necesita eval y websockets.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "media-src 'self' blob: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests', // una imagen antigua en http se pide por https en vez de bloquearse
].join('; ');

// Frontend y API viven en la misma app: las rutas /api/* son route handlers (src/app/api).
const nextConfig: NextConfig = {
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [{
      source: '/:path*',
      headers: [
        { key: 'Content-Security-Policy', value: CONTENT_SECURITY_POLICY },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }];
  },
};

export default nextConfig;
