'use client';

import { useState } from 'react';
import { Camera, X } from 'lucide-react';
import { socialApi } from '../../api';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';

interface InstagramLinkModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function InstagramLinkModal({ open, onClose, onSuccess, onError }: InstagramLinkModalProps) {
  const [username, setUsername] = useState('');
  const [linking, setLinking] = useState(false);

  if (!open) return null;

  const handlePermitir = async () => {
    setLinking(true);
    try {
      const { data } = await socialApi.getInstagramAuthUrl();

      const w = 600, h = 700;
      const x = window.screenX + (window.innerWidth - w) / 2;
      const y = window.screenY + (window.innerHeight - h) / 2;

      const popup = window.open(
        data.url,
        'instagram-auth',
        `width=${w},height=${h},left=${x},top=${y},popup=1`,
      );

      if (!popup) {
        onError('El navegador bloqueó la ventana emergente. Permite popups e intenta de nuevo.');
        setLinking(false);
        return;
      }

      const timer = setTimeout(() => {
        setLinking(false);
        onError('Tiempo de espera agotado. Intenta de nuevo.');
      }, 120000);

      (window as any).__igTimer = timer;

      const handleMessage = async (e: MessageEvent) => {
        if (e.data?.type === 'instagram-code') {
          clearTimeout(timer);
          window.removeEventListener('message', handleMessage);

          if (e.data.error) {
            setLinking(false);
            onError('Vinculación cancelada o rechazada.');
            return;
          }

          try {
            const { data: user } = await socialApi.instagramCallback(e.data.code);

            if (username && user?.instagramUsername && user.instagramUsername !== username.replace('@', '')) {
              setLinking(false);
              onError(`La cuenta vinculada (@${user.instagramUsername}) no coincide con el usuario ingresado.`);
              return;
            }

            setLinking(false);
            onSuccess();
            onClose();
          } catch {
            setLinking(false);
            onError('Error al conectar Instagram. Verifica tus credenciales e intenta de nuevo.');
          }
        }
      };

      window.addEventListener('message', handleMessage);
    } catch {
      setLinking(false);
      onError('Error al iniciar la vinculación. Intenta de nuevo.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass rounded-2xl p-8 w-full max-w-md mx-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Vincular Instagram</h2>
          <p className="text-sm text-gray-400 mt-1">
            Ingresa tu usuario de Instagram para vincular tu cuenta
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Usuario de Instagram
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">@</span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.replace('@', ''))}
              placeholder="usuario"
              className="w-full pl-8 pr-4 py-2.5 rounded-xl text-sm"
              disabled={linking}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handlePermitir}
          disabled={linking || !username.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
        >
          {linking ? (
            <>
              <LoadingSpinner color="pink" size="sm" />
              Vinculando...
            </>
          ) : (
            'Permitir'
          )}
        </button>

        <p className="text-xs text-gray-500 text-center mt-4">
          Al hacer clic en Permitir, serás redirigido a Instagram para autorizar la conexión.
        </p>
      </div>
    </div>
  );
}
