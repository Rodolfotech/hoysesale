'use client';

import dynamic from 'next/dynamic';

// Se dibuja solo en el cliente: evita que se vea la pestaña por defecto antes de la guardada.
const CreateEventScreen = dynamic(() => import('../views/CreateEvent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-neon-cyan border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default CreateEventScreen;
