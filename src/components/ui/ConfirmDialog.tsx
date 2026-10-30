'use client';

import { Modal } from './Modal';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  // Acción destructiva: el botón de confirmar se muestra en rojo.
  danger?: boolean;
  loading?: boolean;
  error?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

// Modal de aviso reutilizable para confirmar una acción (por ejemplo, eliminar).
export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  danger = false,
  loading = false,
  error,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} maxWidth="sm">
      <div className="p-6 space-y-4">
        <h2 className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>{title}</h2>
        <p className="text-sm" style={{ color: '#1D1D1F99' }}>{message}</p>
        {error && <p role="alert" className="text-sm" style={{ color: '#DC2626' }}>{error}</p>}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm cursor-pointer disabled:opacity-50"
            style={{ color: '#1D1D1F99' }}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50"
            style={{ backgroundColor: danger ? '#DC2626' : '#2563EB' }}
          >
            {loading ? 'Procesando...' : confirmLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
