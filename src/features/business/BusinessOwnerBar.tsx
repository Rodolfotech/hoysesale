'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../../api';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { User } from '../../types';
import type { BusinessHighlight, BusinessProduct, BusinessService } from '@/lib/business';
import { BusinessForm, type BusinessFormInitial, type BusinessFormPayload } from './BusinessForm';
import { BusinessContentManager } from './BusinessContentManager';
import { saveBusinessEdits } from './saveBusiness';

interface BusinessOwnerBarProps {
  slug: string;
  pageUrl: string;
  initial: BusinessFormInitial;
  content: { products: BusinessProduct[]; services: BusinessService[]; highlights: BusinessHighlight[] };
}

// Barra del micro-sitio: "Compartir" para todos; "Editar", "Contenido" y "Ver publicación" solo para el dueño.
export function BusinessOwnerBar({ slug, pageUrl, initial, content }: BusinessOwnerBarProps) {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(false);
  const [open, setOpen] = useState(false);
  const [manage, setManage] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    authApi.me()
      .then(({ data }) => setIsOwner((data.user as User).slug === slug))
      .catch(() => setIsOwner(false));
  }, [slug]);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.open(`https://wa.me/?text=${encodeURIComponent(pageUrl)}`, '_blank', 'noopener');
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
        </>
      )}
      <Button variant="outline" onClick={share}>
        {copied ? 'Enlace copiado' : 'Compartir página'}
      </Button>

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
