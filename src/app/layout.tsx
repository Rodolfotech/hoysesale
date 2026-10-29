import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { AppProviders } from '@/components/AppProviders';
import './globals.css';

export const metadata: Metadata = {
  title: 'HoySeSale.cl',
  description: 'Eventos y experiencias en La Araucanía',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
