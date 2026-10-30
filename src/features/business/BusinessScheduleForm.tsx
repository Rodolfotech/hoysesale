'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { BUSINESS_DAYS } from '@/constants/business';
import { CLOSED, MAX_SHIFTS, parseShifts, shiftsProblem, type BusinessHours } from '@/lib/hours';

type DraftShift = { from: string; to: string };

const EMPTY_SHIFT: DraftShift = { from: '', to: '' };
const inputClass = 'w-full px-2 py-1.5 rounded-lg text-xs light-form disabled:opacity-50';

function draftFrom(value: string): DraftShift[] {
  const shifts = parseShifts(value).map(({ from, to }) => ({ from, to }));
  return shifts.length > 0 ? shifts : [EMPTY_SHIFT];
}

// Solo los turnos completos forman parte del horario.
function serialize(shifts: DraftShift[]): string {
  return shifts.filter((s) => s.from && s.to).map((s) => `${s.from}-${s.to}`).join(',');
}

interface ScheduleRowProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onRemove?: () => void;
}

// Una fila del horario: turnos de apertura y cierre, y un selector de horario normal o cerrado.
function ScheduleRow({ label, value, onChange, onRemove }: ScheduleRowProps) {
  // Los turnos a medio escribir viven aquí, para que no se borren mientras se completan.
  const [shifts, setShifts] = useState<DraftShift[]>(() => draftFrom(value));
  const closed = value === CLOSED;
  const problem = closed ? null : shiftsProblem(value);
  const incomplete = !closed && shifts.some((s) => Boolean(s.from) !== Boolean(s.to));

  const update = (next: DraftShift[]) => {
    setShifts(next);
    onChange(serialize(next));
  };
  const setTime = (index: number, field: keyof DraftShift, time: string) =>
    update(shifts.map((shift, i) => (i === index ? { ...shift, [field]: time } : shift)));

  return (
    <div className="space-y-1.5">
      {shifts.map((shift, index) => (
        <div key={index} className="grid grid-cols-[76px_1fr_1fr_124px_28px] items-center gap-2">
          <span className="text-xs capitalize" style={{ color: '#1D1D1F' }}>{index === 0 ? label : ''}</span>
          <input type="time" lang="en-GB" step={60} value={shift.from} disabled={closed} onChange={(e) => setTime(index, 'from', e.target.value)} aria-label={`Apertura, ${label}, turno ${index + 1}`} className={inputClass} />
          <input type="time" lang="en-GB" step={60} value={shift.to} disabled={closed} onChange={(e) => setTime(index, 'to', e.target.value)} aria-label={`Cierre, ${label}, turno ${index + 1}`} className={inputClass} />
          {index === 0 ? (
            <select
              value={closed ? CLOSED : 'normal'}
              onChange={(e) => onChange(e.target.value === CLOSED ? CLOSED : serialize(shifts))}
              aria-label={`Tipo de horario, ${label}`}
              className="px-2 py-1.5 rounded-lg text-xs light-form"
            >
              <option value="normal">Horario normal</option>
              <option value={CLOSED}>Cerrado</option>
            </select>
          ) : (
            <span />
          )}
          {index > 0 ? (
            <button type="button" onClick={() => update(shifts.filter((_, i) => i !== index))} aria-label={`Quitar turno ${index + 1}, ${label}`} className="flex justify-center cursor-pointer" style={{ color: '#DC2626' }}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : onRemove ? (
            <button type="button" onClick={onRemove} aria-label={`Quitar fecha ${label}`} className="flex justify-center cursor-pointer" style={{ color: '#DC2626' }}>
              <Trash2 className="w-4 h-4" aria-hidden="true" />
            </button>
          ) : (
            <span />
          )}
        </div>
      ))}
      <div className="pl-[84px] space-y-1">
        {!closed && shifts.length < MAX_SHIFTS && (
          <button type="button" onClick={() => setShifts([...shifts, EMPTY_SHIFT])} className="inline-flex items-center gap-1 text-xs cursor-pointer" style={{ color: '#2563EB' }}>
            <Plus className="w-3 h-3" aria-hidden="true" />
            Agregar turno
          </button>
        )}
        {problem && <p role="alert" className="text-xs" style={{ color: '#DC2626' }}>{problem}</p>}
        {!problem && incomplete && <p className="text-xs" style={{ color: '#B45309' }}>Completa apertura y cierre para guardar este turno.</p>}
      </div>
    </div>
  );
}

// El antiguo valor manual "abierto" se trata como un día sin horario.
const rowValue = (hours: BusinessHours, key: string) => {
  const value = (hours[key] ?? '').trim();
  return value === 'abierto' ? '' : value;
};

const headerClass = 'grid grid-cols-[76px_1fr_1fr_124px_28px] gap-2 text-xs';

// Administrador de horarios: turnos por día, días cerrados y fechas especiales.
// Solo guarda el horario; el estado abierto o cerrado se calcula en getBusinessStatus.
export function BusinessScheduleForm({ hours, onChange }: { hours: BusinessHours; onChange: (next: BusinessHours) => void }) {
  const [newDate, setNewDate] = useState('');
  const dates = Object.keys(hours).filter((key) => !(BUSINESS_DAYS as readonly string[]).includes(key)).sort();

  const addDate = () => {
    if (!newDate || newDate in hours) return;
    onChange({ ...hours, [newDate]: CLOSED });
    setNewDate('');
  };
  const removeDate = (date: string) => {
    const next = { ...hours };
    delete next[date];
    onChange(next);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className={headerClass} style={{ color: '#1D1D1F99' }}>
          <span />
          <span>Apertura</span>
          <span>Cierre</span>
          <span />
          <span />
        </div>
        {BUSINESS_DAYS.map((day) => (
          <ScheduleRow key={day} label={day} value={rowValue(hours, day)} onChange={(value) => onChange({ ...hours, [day]: value })} />
        ))}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold" style={{ color: '#1D1D1F' }}>Fechas especiales</p>
        <p className="text-xs" style={{ color: '#1D1D1F99' }}>Feriados o días con otro horario. Reemplazan el horario normal de esa fecha.</p>
        {dates.map((date) => (
          <ScheduleRow key={date} label={date} value={rowValue(hours, date)} onChange={(value) => onChange({ ...hours, [date]: value })} onRemove={() => removeDate(date)} />
        ))}
        <div className="flex items-center gap-2">
          <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} aria-label="Fecha especial" className="px-2 py-1.5 rounded-lg text-xs light-form" />
          <button type="button" onClick={addDate} disabled={!newDate} className="inline-flex items-center gap-1 text-xs cursor-pointer disabled:opacity-50" style={{ color: '#2563EB' }}>
            <Plus className="w-3 h-3" aria-hidden="true" />
            Agregar fecha
          </button>
        </div>
      </div>
    </div>
  );
}
