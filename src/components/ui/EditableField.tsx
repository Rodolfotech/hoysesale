'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { apiErrorMessage } from '@/lib/api-error';
import { Button } from './Button';
import { ConfirmDialog } from './ConfirmDialog';

interface EditableFieldProps {
  label: string; // nombre del campo para los botones, por ejemplo "WhatsApp"
  onCancel: () => void; // vuelve al valor guardado
  children: ReactNode;
  // Con onSave, el campo tiene su propio Guardar. Sin él, lo guarda el formulario que lo contiene.
  onSave?: () => Promise<void>;
  saveDisabled?: boolean;
  confirm?: { title: string; message: string; confirmLabel?: string }; // aviso antes de guardar
}

// Campo bloqueado con su propio botón Editar.
export function EditableField({ label, onCancel, children, onSave, saveDisabled = false, confirm }: EditableFieldProps) {
  const [editing, setEditing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fieldRef = useRef<HTMLFieldSetElement>(null);

  useEffect(() => {
    if (editing) fieldRef.current?.querySelector('input')?.focus();
  }, [editing]);

  const cancel = () => {
    onCancel();
    setError('');
    setEditing(false);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await onSave?.();
      setConfirming(false);
      setEditing(false);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Un fieldset deshabilitado bloquea cualquier input que tenga dentro. */}
      <fieldset ref={fieldRef} disabled={!editing} className="min-w-0">
        {children}
      </fieldset>
      {error && !confirming && <p role="alert" className="text-xs mt-2" style={{ color: '#DC2626' }}>{error}</p>}
      <div className="flex justify-end gap-2 mt-2">
        {editing ? (
          <>
            <Button variant="ghost" size="sm" onClick={cancel} disabled={saving} aria-label={`Cancelar edición de ${label}`}>Cancelar</Button>
            {onSave && (
              <Button size="sm" onClick={() => (confirm ? setConfirming(true) : save())} disabled={saving || saveDisabled} aria-label={`Guardar ${label}`}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            )}
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)} aria-label={`Editar ${label}`}>Editar</Button>
        )}
      </div>
      {confirm && (
        <ConfirmDialog
          isOpen={confirming}
          title={confirm.title}
          message={confirm.message}
          confirmLabel={confirm.confirmLabel}
          loading={saving}
          error={error}
          onConfirm={save}
          onCancel={() => { setConfirming(false); setError(''); }}
        />
      )}
    </div>
  );
}
