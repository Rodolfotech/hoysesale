'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useState } from 'react';
import { Link } from '@/lib/router';
import api from '../api/client';
import { Mail, Send, ArrowLeft } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = usePersistentState('draft:forgot:email', '');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-full max-w-sm mx-4">
          <div className="rounded-2xl p-8 text-center shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
              <Mail className="w-7 h-7" style={{ color: '#16A34A' }} />
            </div>
            <h1 className="text-lg font-bold mb-2" style={{ color: '#1D1D1F' }}>Revisa tu bandeja de entrada</h1>
            <p className="text-sm mb-6" style={{ color: '#1D1D1F99' }}>
              Si el correo <strong style={{ color: '#1D1D1F' }}>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: '#2563EB' }}
            >
              <ArrowLeft className="w-3 h-3" />
              Volver a inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="w-full max-w-sm mx-4">
        <div className="rounded-2xl p-8 shadow-sm" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
              <Mail className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1D1D1F' }}>Recuperar Contraseña</h1>
            <p className="text-sm mt-1" style={{ color: '#1D1D1F99' }}>Te enviaremos un enlace a tu correo</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#1D1D1F' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none light-form"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#2563EB' }}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Enviando...' : 'Enviar enlace'}
            </button>
          </form>

          <p className="text-center mt-5">
            <Link
              to="/login"
              className="inline-flex items-center gap-1 text-sm font-medium hover:underline"
              style={{ color: '#2563EB' }}
            >
              <ArrowLeft className="w-3 h-3" />
              Volver a inicio de sesión
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
