'use client';

import dynamic from 'next/dynamic';

// Se dibuja solo en el cliente: evita que se vean datos por defecto antes de los guardados.
const ProfileScreen = dynamic(() => import('../views/Profile'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default ProfileScreen;
