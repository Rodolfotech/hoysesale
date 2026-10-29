'use client';

import { MapPin, MessageCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

interface BottomBarProps {
  mapHref: string | null;
  contactHref: string | null;
}

// Barra fija inferior con las dos acciones principales del micro-sitio.
export function BottomBar({ mapHref, contactHref }: BottomBarProps) {
  if (!mapHref && !contactHref) return null;
  return (
    <nav aria-label="Acciones rápidas" className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-1.5 rounded-full bg-brand-dark p-1.5 shadow-xl">
      {mapHref && (
        <Button href={mapHref} target="_blank" variant="ghost" icon={MapPin} className="text-white hover:bg-white/10">
          Cómo llegar
        </Button>
      )}
      {contactHref && (
        <Button href={contactHref} target="_blank" variant="success" icon={MessageCircle}>
          Contactar
        </Button>
      )}
    </nav>
  );
}
