'use client';

import type { ReactNode } from 'react';
import { Navigate } from '@/lib/router';
import { useAuth } from '../context/AuthContext';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

interface AdminGuardProps {
  children: ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner color="purple" size="lg" />
      </div>
    );
  }

  // User is authenticated but does not have the ADMIN role → redirect
  if (user && user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  // user is null (not logged in) → Admin page shows its own login form
  return <>{children}</>;
}
