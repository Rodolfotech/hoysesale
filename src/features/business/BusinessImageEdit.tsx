'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Circle, Square } from 'lucide-react';
import { LOGO_SHAPES, LOGO_SHAPE_LABELS, type LogoShape } from '@/lib/business';
import { apiErrorMessage } from '@/lib/api-error';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { BusinessImagePicker } from './BusinessImagePicker';
import { useIsOwner } from './useIsOwner';

const SHAPE_ICONS = { round: Circle, square: Square } as const;

interface BusinessImageEditProps {
  slug: string;
  kind: 'logo' | 'cover';
  value: string | null;
  logoShape?: LogoShape; // solo para el logo
  className?: string; // posición del botón
}

// Botón Editar del logo o la portada en el micro-sitio. Solo lo ve el dueño.
export function BusinessImageEdit({ slug, kind, value, logoShape = 'round', className = '' }: BusinessImageEditProps) {
  const router = useRouter();
  const isOwner = useIsOwner(slug);
  const [open, setOpen] = useState(false);
  const [shape, setShape] = useState(logoShape);
  const [savingShape, setSavingShape] = useState(false);
  const [shapeError, setShapeError] = useState('');
  const name = kind === 'logo' ? 'logo' : 'portada';

  if (!isOwner) return null;

  const saved = () => {
    setOpen(false);
    router.refresh();
  };

  // El marco se guarda al elegirlo, igual que la imagen.
  const chooseShape = async (next: LogoShape) => {
    setSavingShape(true);
    setShapeError('');
    try {
      await businessApi.updateMe({ logoShape: next });
      setShape(next);
      router.refresh();
    } catch (err) {
      setShapeError(apiErrorMessage(err, 'No se pudo cambiar el marco'));
    } finally {
      setSavingShape(false);
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className={className} aria-label={`Editar ${name}`}>Editar</Button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <div className="p-6 space-y-4">
          <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Editar {name}</h2>
          <BusinessImagePicker kind={kind} value={value} onChange={saved} rounded={kind === 'logo' && shape === 'round'} />
          {kind === 'logo' && (
            <div>
              <p className="text-xs mb-2" style={{ color: '#1D1D1F' }}>Marco del logo</p>
              <div role="group" aria-label="Marco del logo" className="flex gap-2">
                {/* El marco en uso se ve opaco y no se puede elegir: solo queda disponible el otro. */}
                {LOGO_SHAPES.map((option) => (
                  <Button
                    key={option}
                    variant="outline"
                    size="sm"
                    icon={SHAPE_ICONS[option]}
                    disabled={option === shape || savingShape}
                    aria-pressed={option === shape}
                    onClick={() => chooseShape(option)}
                    className="disabled:cursor-not-allowed"
                  >
                    {LOGO_SHAPE_LABELS[option]}
                  </Button>
                ))}
              </div>
              {shapeError && <p role="alert" className="text-xs mt-2" style={{ color: '#DC2626' }}>{shapeError}</p>}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
