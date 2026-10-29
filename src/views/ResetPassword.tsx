'use client';

import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from '@/lib/router';
import { authApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
import { AuthHeader } from '../features/auth/AuthHeader';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GradientButton } from '../components/ui/GradientButton';
import { ErrorBanner } from '../components/ui/ErrorBanner';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // El backend ya dejó la sesión iniciada (cookie) y devuelve el usuario.
      const { data } = await authApi.resetPassword(token, password);
      setUser(data.user);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al restablecer contraseña');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center">
        <GlassCard padding="md" className="text-center max-w-sm mx-4">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Enlace inválido</h1>
          <p className="text-sm text-gray-400 mb-4">El enlace de recuperación no es válido o ya expiró.</p>
          <Link to="/forgot-password" className="text-neon-cyan hover:underline text-sm">
            Solicitar un nuevo enlace
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-neon-cyan/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4">
        <GlassCard glow="purple">
          <AuthHeader title="Nueva Contraseña" subtitle="Ingresa tu nueva contraseña" />

          <ErrorBanner message={error} />
          <ErrorBanner message={success ? 'Contraseña restablecida. Redirigiendo...' : ''} type="success" />

          {!success && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <PasswordInput
                label="Nueva Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <GradientButton type="submit" disabled={loading} loading={loading} loadingText="Restableciendo...">
                Restablecer Contraseña
              </GradientButton>
            </form>
          )}

          <p className="text-center text-sm text-gray-500 mt-6">
            <Link to="/login" className="text-neon-cyan hover:underline">
              Volver a inicio de sesión
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
