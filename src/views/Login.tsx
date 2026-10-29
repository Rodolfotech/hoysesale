'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from '@/lib/router';
import { LogIn, Mail, ArrowLeft } from 'lucide-react';
import { authApi } from '../api';
import { FormInput } from '../components/ui/FormInput';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GradientButton } from '../components/ui/GradientButton';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { GoogleOAuthButton } from '../features/auth/GoogleOAuthButton';
import { AuthDivider } from '../features/auth/AuthDivider';

export default function Login() {
  const [email, setEmail] = usePersistentState('draft:login:email', '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type === 'google-code') {
        if (e.data.error) {
          setGoogleLoading(false);
          setError('Error al iniciar sesión con Google');
          return;
        }
        if (e.data.code) {
          try {
            // El backend deja la cookie de sesión; hay que cargar el usuario en el contexto antes de navegar.
            const { data } = await authApi.googleLogin(e.data.code);
            setUser(data.user);
            navigate('/profile');
          } catch {
            setGoogleLoading(false);
            setError('Error al iniciar sesión con Google');
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/profile');
    } catch {
      setError('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="flex items-stretch gap-12 w-full" style={{ maxWidth: '1280px', minHeight: '720px' }}>

      {/* Panel izquierdo — branding */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden shrink-0"
        style={{ width: '580px', borderRadius: '24px', padding: '56px' }}
      >
        <img
          src="/login/fondo_iniciar_sesion.png"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ borderRadius: '24px' }}
        />
        <img src="/login/Logohoysesale-blanco.svg" alt="HoySeSale" className="w-auto self-start relative z-10" style={{ height: '56px' }} />
        <div className="relative z-10">
          <p style={{ fontSize: '48px', fontWeight: 700, color: '#FFFFFF', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '58px' }}>
            La Araucanía,<br />en un solo lugar
          </p>
          <p className="mt-5" style={{ fontSize: '30px', fontWeight: 400, color: 'rgba(255,255,255,0.85)', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '38px' }}>
            Descubre eventos, y vive<br />experiencias únicas en la<br />región.
          </p>
        </div>
        <p className="relative z-10" style={{ fontSize: '22px', fontWeight: 600, color: '#FFFFFF', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '28px' }}>
          Hoysesale.cl
        </p>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex flex-col shrink-0" style={{ width: '520px' }}>
        {/* Regresar */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 mb-6 hover:underline"
          style={{ fontSize: '14px', fontWeight: 500, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '16px' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Regresar al inicio de <span style={{ fontWeight: 600, color: '#2563EB' }}>Hoysesale.cl</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl p-10 flex-1 flex flex-col justify-center mt-10 shadow-md" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
                <img src="/Isotipo.svg" alt="" className="w-8 h-8" />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '32px' }}>
                Bienvenido de vuelta
              </p>
              <p className="mt-1" style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '16px' }}>
                Ingresa a tu cuenta
              </p>
            </div>

            <ErrorBanner message={error} />

            <GoogleOAuthButton
              loading={googleLoading}
              onLoadingChange={setGoogleLoading}
              onError={setError}
            />

            <AuthDivider />

            <form onSubmit={handleSubmit} className="space-y-4">
              <FormInput
                icon={Mail}
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                autoComplete="email"
                required
                filledBg="#E4EBFA"
              />
              <PasswordInput
                label="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                filledBg="#E4EBFA"
              />
              <GradientButton type="submit" disabled={loading} loading={loading} loadingText="Ingresando..." icon={LogIn}>
                Ingresar
              </GradientButton>
            </form>

            <p className="text-center mt-4" style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif" }}>
              <Link to="/forgot-password" className="hover:underline" style={{ fontWeight: 500, color: '#2563EB' }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </p>
            <p className="text-center mt-3" style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif" }}>
              ¿No tienes cuenta?{' '}
              <Link to="/register" className="hover:underline" style={{ fontWeight: 600, color: '#2563EB' }}>
                Registrarse
              </Link>
            </p>
          </div>
      </div>

      </div>
    </div>
  );
}
