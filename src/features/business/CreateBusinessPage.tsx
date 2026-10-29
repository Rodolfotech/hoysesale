'use client';

import { useState } from 'react';
import { businessApi } from '../../api';
import type { User } from '../../types';
import { Modal } from '../../components/ui/Modal';
import { BusinessForm, slugifyName, type BusinessFormPayload } from './BusinessForm';

interface CreateBusinessPageProps {
  user: User;
  onUpdated: (patch: Partial<User>) => void;
}

// Botón "Crear página" (o "Ir a página" si ya existe) y su modal de creación.
export function CreateBusinessPage({ user, onUpdated }: CreateBusinessPageProps) {
  const [open, setOpen] = useState(false);

  // Con página creada, el acceso está en el navbar ("Ir a página").
  if (user.slug) return null;

  const create = async (payload: BusinessFormPayload) => {
    const { data } = await businessApi.createPage(payload);
    onUpdated(data);
    setOpen(false);
  };

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white hover:opacity-90 cursor-pointer" style={{ backgroundColor: '#2563EB' }}>
        Crear página
      </button>
      <Modal isOpen={open} onClose={() => setOpen(false)} maxWidth="2xl">
        <div className="px-6 pt-6">
          <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Crear página del negocio</h2>
        </div>
        <BusinessForm
          mode="create"
          initial={{ name: user.name, comuna: user.comuna, slug: slugifyName(user.name ?? '') }}
          submitLabel="Crear"
          onSubmit={create}
        />
      </Modal>
    </>
  );
}
