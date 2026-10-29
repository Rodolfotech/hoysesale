import { BUSINESS_DAYS } from '@/constants/business';

// Horario de un día. Valores guardados:
// - "" (vacío): sin horario fijo, se muestra "-".
// - "abierto" / "cerrado": estado fijo que elige el desplegable.
// - "12:00-23:00": horario; el estado se calcula con la hora de Chile.
export const HOURS_PATTERN = /^(abierto|cerrado|([01]\d|2[0-3]):[0-5]\d-([01]\d|2[0-3]):[0-5]\d)$/;
export const HOURS_ERROR = 'El horario debe ser 12:00-23:00, abierto o cerrado';

// Sábado y domingo también pueden marcarse como cerrados.
export const WEEKEND_DAYS: readonly string[] = ['sábado', 'domingo'];

const DAY_FORMAT = new Intl.DateTimeFormat('es-CL', { timeZone: 'America/Santiago', weekday: 'long' });
const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { timeZone: 'America/Santiago', hour: '2-digit', minute: '2-digit', hour12: false });

export type ChileNow = { day: string; minutes: number };

export function chileNow(date: Date = new Date()): ChileNow {
  const day = DAY_FORMAT.format(date).toLowerCase();
  const [hour, minute] = TIME_FORMAT.format(date).split(':').map(Number);
  return { day, minutes: hour * 60 + minute };
}

// Convierte "12:00-23:00" en minutos del día. Devuelve null si no es un horario completo.
export function parseRange(value: string): [number, number] | null {
  const match = value.match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})$/);
  if (!match) return null;
  return [Number(match[1]) * 60 + Number(match[2]), Number(match[3]) * 60 + Number(match[4])];
}

// Estado de un día. Si el horario es de otro día, no se puede saber si está abierto ahora.
export function dayStatus(value: string | undefined, day: string, now: ChileNow = chileNow()): string {
  const v = (value ?? '').trim();
  if (v === 'abierto') return 'Abierto';
  if (v === 'cerrado') return 'Cerrado';
  const range = parseRange(v);
  if (!range) return '-';
  if (day !== now.day) return 'Según horario';
  const [start, end] = range;
  // Horarios que cruzan la medianoche (20:00-02:00).
  const open = end > start ? now.minutes >= start && now.minutes < end : now.minutes >= start || now.minutes < end;
  return open ? 'Abierto' : 'Cerrado';
}

// Texto para la página pública: el horario tal cual, o el estado fijo.
export function hoursText(value: string | undefined, day: string, now: ChileNow = chileNow()): string {
  const v = (value ?? '').trim();
  if (v === 'abierto' || v === 'cerrado') return dayStatus(v, day, now);
  if (!parseRange(v)) return '-';
  return day === now.day ? `${v} · ${dayStatus(v, day, now)}` : v;
}

// Escribe el horario mientras el usuario tipea: solo dígitos, con formato 12:00-23:00.
export function formatRangeInput(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  let out = d.slice(0, 2);
  if (d.length > 2) out += `:${d.slice(2, 4)}`;
  if (d.length > 4) out += `-${d.slice(4, 6)}`;
  if (d.length > 6) out += `:${d.slice(6, 8)}`;
  return out;
}

export { BUSINESS_DAYS };
