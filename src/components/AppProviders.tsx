'use client';

import { Suspense, type ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { Analytics } from './shared/Analytics';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Analytics />
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
          </div>
        }
      >
        {children}
      </Suspense>
    </AuthProvider>
  );
}
