'use client';

import { Camera } from 'lucide-react';

interface InstagramConnectButtonProps {
  connected: boolean;
  username: string | null;
  avatar: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
  onChangeAccount: () => void;
}

export function InstagramConnectButton({
  connected,
  username,
  avatar,
  onConnect,
  onDisconnect,
  onChangeAccount,
}: InstagramConnectButtonProps) {
  if (connected) {
    return (
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-pink-500/10 border border-pink-500/20">
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt="" className="w-8 h-8 rounded-full" />
          ) : (
            <Camera className="w-5 h-5 text-pink-400" />
          )}
          <div>
            <span className="text-sm text-pink-400 block">Instagram</span>
            {username && <span className="text-xs text-gray-400">@{username}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onChangeAccount}
            className="text-xs text-pink-400 hover:text-white transition-colors cursor-pointer"
          >
            Cambiar cuenta
          </button>
          <button
            type="button"
            onClick={onDisconnect}
            className="text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            Desconectar
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onConnect}
      className="w-full flex items-center justify-between px-4 py-3 rounded-xl glass text-gray-400 hover:text-white transition-all cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <Camera className="w-5 h-5" />
        <span className="text-sm">Instagram</span>
      </div>
      <span className="text-xs">Vincular</span>
    </button>
  );
}
