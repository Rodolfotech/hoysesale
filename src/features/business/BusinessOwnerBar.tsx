'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { businessApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import type { BusinessHighlight, BusinessProduct, BusinessService } from '@/lib/business';
import { BusinessForm, type BusinessFormInitial, type BusinessFormPayload } from './BusinessForm';
import { BusinessContentManager } from './BusinessContentManager';
import { saveBusinessEdits } from './saveBusiness';
import { useIsOwner } from './useIsOwner';

interface BusinessOwnerBarProps {
  slug: string;
  pageUrl: string;
  initial: BusinessFormInitial;
  content: { products: BusinessProduct[]; services: BusinessService[]; highlights: BusinessHighlight[] };
}

// Barra del micro-sitio: "Compartir" para todos; "Editar", "Contenido" y "Ver publicación" solo para el dueño.
export function BusinessOwnerBar({ slug, pageUrl, initial, content }: BusinessOwnerBarProps) {
  const router = useRouter();
  const isOwner = useIsOwner(slug);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const share = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener');
    }
  };

  const removePage = async () => {
    setDeleting(true);
    setDeleteError('');
    try {
      await businessApi.deletePage();
      window.location.href = '/profile';
    } catch {
      setDeleteError('No se pudo eliminar la página. Intenta de nuevo.');
      setDeleting(false);
    }
  };

  const save = async (payload: BusinessFormPayload) => {
    await saveBusinessEdits(payload);
    setOpen(false);
    if (payload.slug && payload.slug !== slug) {
      window.location.href = `/${payload.slug}`;
    } else {
      router.refresh();
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-end">
      {isOwner && (
        <>
          <Button onClick={() => setOpen(true)}>Editar</Button>
          <Button variant="outline" onClick={() => setManage(true)}>Contenido</Button>
          <Button variant="outline" href={pageUrl} target="_blank">
            Ver publicación
          </Button>
          <Button variant="outline" onClick={() => setConfirmDelete(true)} style={{ color: '#DC2626', borderColor: '#DC2626' }}>
            Eliminar página
          </Button>
        </>
      )}
      <Button variant="outline" onClick={share}>
        {copied ? 'Enlace copiado' : 'Compartir página'}
      </Button>

      <ConfirmDialog
        isOpen={confirmDelete}
        title="Eliminar página"
        message="Se borrarán la página del negocio, sus productos, servicios, destacados, reseñas y horarios. Tu perfil y tus eventos no se borran."
        confirmLabel="Eliminar página"
        danger
        loading={deleting}
        error={deleteError}
        onConfirm={removePage}
        onCancel={() => { setConfirmDelete(false); setDeleteError(''); }}
      />

      {isOwner && (
        <>
          <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
            <div className="px-6 pt-6">
              <h2 className="text-lg font-semibold">Editar página</h2>
            </div>
            <BusinessForm mode="edit" initial={initial} submitLabel="Guardar" onSubmit={save} onCancel={() => setOpen(false)} />
          </Modal>
          <BusinessContentManager
            open={manage}
            onClose={() => setManage(false)}
            products={content.products}
            services={content.services}
            highlights={content.highlights}
          />
        </>
      )}
    </div>
  );
}
