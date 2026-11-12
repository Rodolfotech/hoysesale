'use client';

import { Building2, User as UserIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { isBusinessCategory } from '@/constants/business';
import { isGiroOption } from '@/constants/giros';
import type { User } from '@/types';

export interface RequiredItem {
  group: 'empresa' | 'admin';
  label: string; // texto del chip
  fieldId: string; // id del campo del perfil al que lleva el chip
  done: boolean;
}

// Datos obligatorios del perfil: todos los de la empresa salvo el sitio web, y los del administrador.
// El correo no aparece: viene del registro y no se puede editar.
export function requiredProfileItems(user: User): RequiredItem[] {
  const filled = (value: string | null | undefined) => !!value?.trim();
  return [
    { group: 'empresa', label: 'Nombre', fieldId: 'perfil-nombre', done: filled(user.name) },
    { group: 'empresa', label: 'Instagram', fieldId: 'perfil-instagram', done: filled(user.companyInstagram) },
    { group: 'empresa', label: 'RUT', fieldId: 'perfil-rut', done: filled(user.companyRut) },
    { group: 'empresa', label: 'Giro', fieldId: 'perfil-giro', done: isGiroOption(user.companyGiro) },
    { group: 'empresa', label: 'Teléfono', fieldId: 'perfil-telefono', done: filled(user.companyPhone) },
    { group: 'empresa', label: 'Calle y número', fieldId: 'perfil-calle', done: /\d/.test(user.companyAddress ?? '') },
    { group: 'empresa', label: 'Categoría', fieldId: 'perfil-categoria', done: isBusinessCategory(user.category) },
    { group: 'empresa', label: 'Ciudad', fieldId: 'perfil-ciudad', done: filled(user.city) },
    { group: 'empresa', label: 'Comuna', fieldId: 'perfil-comuna', done: filled(user.comuna) },
    { group: 'admin', label: 'Nombre', fieldId: 'perfil-admin-nombre', done: filled(user.adminFirstName) },
    { group: 'admin', label: 'Apellidos', fieldId: 'perfil-admin-apellidos', done: filled(user.adminLastName) },
    { group: 'admin', label: 'RUT', fieldId: 'perfil-admin-rut', done: filled(user.adminRut) },
    { group: 'admin', label: 'Teléfono', fieldId: 'perfil-admin-telefono', done: filled(user.adminPhone) },
  ];
}

interface CompleteProfileModalProps {
  items: RequiredItem[];
  isOpen: boolean;
  onClose: () => void; // "Recordar más tarde" o la X
  onGoTo: (fieldId: string) => void; // abre la edición en ese campo
}

function Group({ icon, title, items, onGoTo }: { icon: ReactNode; title: string; items: RequiredItem[]; onGoTo: (fieldId: string) => void }) {
  if (items.length === 0) return null;
  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: '#1D1D1F' }}>{icon}{title}</p>
        <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
          {items.length} {items.length === 1 ? 'pendiente' : 'pendientes'}
        </span>
      </div>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.fieldId}>
            <button
              type="button"
              onClick={() => onGoTo(item.fieldId)}
              className="px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-colors hover:border-brand-blue"
              style={{ border: '1px solid #E4EBFA', backgroundColor: '#FFFFFF', color: '#1D1D1F' }}
            >
              {item.label} <span style={{ color: '#DC2626' }}>*</span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

// Aviso al entrar al perfil mientras falten datos obligatorios (cuenta nueva, por formulario o Google).
export function CompleteProfileModal({ items, isOpen, onClose, onGoTo }: CompleteProfileModalProps) {
  const pending = items.filter((item) => !item.done);
  const done = items.length - pending.length;
  const percent = items.length ? Math.round((done / items.length) * 100) : 100;

  return (
    <Modal isOpen={isOpen && pending.length > 0} onClose={onClose} maxWidth="md">
      <div className="p-6">
        <p style={{ fontSize: '20px', fontWeight: 600, color: '#1D1D1F' }}>Completa tu perfil</p>
        <p className="text-sm mt-1" style={{ color: '#2563EB' }}>
          Te faltan <strong>{pending.length} {pending.length === 1 ? 'dato obligatorio' : 'datos obligatorios'}</strong> para continuar. Toma unos 3 minutos.
        </p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5" style={{ color: '#1D1D1F99' }}>
            <span>Progreso</span>
            <span>{done} de {items.length} · {percent}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E4EBFA' }} role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={done} aria-label="Datos obligatorios completados">
            <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: '#1D1D1F' }} />
          </div>
        </div>

        <div className="mt-5 pt-5 space-y-5" style={{ borderTop: '1px solid #E4EBFA' }}>
          <Group icon={<Building2 className="w-4 h-4" aria-hidden="true" />} title="Datos de la empresa" items={pending.filter((i) => i.group === 'empresa')} onGoTo={onGoTo} />
          <Group icon={<UserIcon className="w-4 h-4" aria-hidden="true" />} title="Datos del administrador" items={pending.filter((i) => i.group === 'admin')} onGoTo={onGoTo} />
          <p className="text-xs" style={{ color: '#1D1D1F99' }}>Haz clic en un dato para ir directo a ese campo.</p>
        </div>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-2 sm:gap-3 px-6 py-4" style={{ borderTop: '1px solid #E4EBFA' }}>
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onClose}>Recordar más tarde</Button>
        <Button variant="dark" className="w-full sm:w-auto" onClick={() => pending[0] && onGoTo(pending[0].fieldId)}>Empezar por el primero →</Button>
      </div>
    </Modal>
  );
}
