'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from '@/lib/router';
import { UserPlus, Mail, User } from 'lucide-react';
import { authApi } from '../api';
import { GlassCard } from '../components/ui/GlassCard';
import { PhoneInput } from '@/components/ui/PhoneInput';
import { FormInput } from '../components/ui/FormInput';
import { PasswordInput } from '../components/ui/PasswordInput';
import { GradientButton } from '../components/ui/GradientButton';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { GoogleOAuthButton } from '../features/auth/GoogleOAuthButton';
import { AuthHeader } from '../features/auth/AuthHeader';
import { AuthDivider } from '../features/auth/AuthDivider';
import { COMUNAS } from '../constants/comunas';

export default function Register() {
  const [name, setName] = usePersistentState('draft:register:name', '');
  const [adminFirstName, setAdminFirstName] = usePersistentState('draft:register:adminFirstName', '');
  const [adminLastName, setAdminLastName] = usePersistentState('draft:register:adminLastName', '');
  const [adminPhone, setAdminPhone] = usePersistentState('draft:register:adminPhone', '');
  const [phoneError, setPhoneError] = useState('');
  const clearRegisterDraft = () => ['name', 'adminFirstName', 'adminLastName', 'adminPhone', 'comuna', 'email'].forEach((k) => window.sessionStorage.removeItem(`draft:register:${k}`));
  const [comuna, setComuna] = usePersistentState('draft:register:comuna', '');
  const [email, setEmail] = usePersistentState('draft:register:email', '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMessage = async (e: MessageEvent) => {
      if (e.data?.type === 'google-code') {
        if (e.data.error) {
          setGoogleLoading(false);
          setError('Error al registrarse con Google');
          return;
        }
        if (e.data.code) {
          try {
            await authApi.googleLogin(e.data.code);
            navigate('/profile');
          } catch {
            setGoogleLoading(false);
            setError('Error al registrarse con Google');
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
      if (adminPhone.length !== 8) {
        setPhoneError('El teléfono debe tener 8 dígitos después de +569');
        return;
      }
      await register({ name, adminFirstName, adminLastName, adminPhone: `+569${adminPhone}`, comuna, email, password });
      clearRegisterDraft();
      navigate('/profile');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al registrarse');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-100px] right-[-100px] w-[300px] h-[300px] bg-neon-pink/10 rounded-full blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-100px] w-[300px] h-[300px] bg-neon-purple/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4">
        <GlassCard glow="pink">
          <AuthHeader title="Crear Cuenta" subtitle="Únete a la comunidad" />
          <ErrorBanner message={error} />
          <GoogleOAuthButton
            loading={googleLoading}
            onLoadingChange={setGoogleLoading}
            onError={setError}
            label="Registrarse con Google"
            windowName="google-register"
          />
          <AuthDivider />
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormInput
              icon={User}
              label="Nombre de la empresa o emprendimiento"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre comercial"
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                icon={User}
                label="Tu nombre"
                value={adminFirstName}
                onChange={(e) => setAdminFirstName(e.target.value)}
                placeholder="Nombre"
                required
              />
              <FormInput
                icon={User}
                label="Tu apellido"
                value={adminLastName}
                onChange={(e) => setAdminLastName(e.target.value)}
                placeholder="Apellido"
                required
              />
            </div>
            <PhoneInput
              label="Teléfono / WhatsApp"
              value={adminPhone}
              onChange={(digits) => { setAdminPhone(digits); setPhoneError(''); }}
              error={phoneError}
              required
            />
            <div>
              <label className="block text-sm mb-1" style={{ color: '#1D1D1F' }}>Comuna</label>
              <select value={comuna} onChange={(e) => setComuna(e.target.value)} required className="w-full px-3 py-2 rounded-xl text-sm light-form">
                <option value="">Selecciona tu comuna</option>
                {COMUNAS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <FormInput
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <PasswordInput
              icon={Mail}
              label="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <GradientButton type="submit" disabled={loading} loading={loading} loadingText="Registrando..." gradient="purple-pink" icon={UserPlus}>
              Crear Cuenta
            </GradientButton>
          </form>
          <p className="text-center text-sm mt-6" style={{ color: '#1D1D1F99' }}>
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="font-medium hover:underline" style={{ color: '#2563EB' }}>
              Iniciar Sesión
            </Link>
          </p>
        </GlassCard>
      </div>
    </div>
  );
}
