'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { Eye, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/Button';

interface OwnerPreviewState {
  previewing: boolean; // el dueño está viendo su página como visitante
  setPreviewing: (value: boolean) => void;
}

const OwnerPreviewContext = createContext<OwnerPreviewState>({ previewing: false, setPreviewing: () => undefined });

export const useOwnerPreview = () => useContext(OwnerPreviewContext);

// Envuelve el micro-sitio. Solo cambia lo que ve el navegador del dueño: no envía nada al servidor.
export function OwnerPreviewProvider({ children }: { children: ReactNode }) {
  const [previewing, setPreviewing] = useState(false);
  return <OwnerPreviewContext.Provider value={{ previewing, setPreviewing }}>{children}</OwnerPreviewContext.Provider>;
}

// "Ver como visitante" junto a los botones del dueño y, durante la vista previa, el aviso fijo para volver a editar.
export function OwnerPreviewToggle({ slug }: { slug: string }) {
  const { user } = useAuth();
  const { previewing, setPreviewing } = useOwnerPreview();

  // Se compara con la sesión real: durante la vista previa useIsOwner devuelve false.
  if (user?.slug !== slug) return null;

  const change = (value: boolean) => {
    setPreviewing(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!previewing) {
    return <Button variant="outline" icon={Eye} onClick={() => change(true)}>Ver como visitante</Button>;
  }

  return (
    <div role="status" className="fixed z-40 top-20 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md flex items-center justify-between gap-3 rounded-2xl bg-brand-dark text-white shadow-lg px-4 py-3">
      <p className="text-sm">Así ven tu página los visitantes.</p>
      <Button variant="primary" size="sm" icon={Pencil} onClick={() => change(false)}>Volver a editar</Button>
    </div>
  );
}
