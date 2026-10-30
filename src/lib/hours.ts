import { BUSINESS_DAYS } from '@/constants/business';

// Horario del negocio. Se guarda como JSON { clave: valor }.
// Clave: día de la semana ("lunes") o fecha especial ("2026-12-25"), que tiene prioridad sobre el día.
// Valor: "cerrado", o uno o más turnos: "09:00-13:00,15:00-19:00". Sin valor: horario no disponible.
// El estado (abierto o cerrado) nunca se guarda: se calcula con el horario y la hora actual del negocio.
export type BusinessHours = Record<string, string>;

// Quita los días vacíos y el antiguo valor manual "abierto": el estado siempre se calcula con el horario.
export function cleanBusinessHours(hours: BusinessHours): BusinessHours {
  return Object.fromEntries(Object.entries(hours).filter(([, value]) => value.trim() && value !== 'abierto'));
}

export const MAX_SHIFTS = 3;
export const CLOSED = 'cerrado';

const TIME_ZONE = 'America/Santiago';
const RANGE = '([01]\\d|2[0-3]):[0-5]\\d-([01]\\d|2[0-3]):[0-5]\\d';
const VALUE_PATTERN = new RegExp(`^(${CLOSED}|${RANGE}(,${RANGE})*)$`);
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MINUTES_PER_DAY = 24 * 60;

const DAY_FORMAT = new Intl.DateTimeFormat('es-CL', { timeZone: TIME_ZONE, weekday: 'long' });
const DATE_FORMAT = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
const TIME_FORMAT = new Intl.DateTimeFormat('en-GB', { timeZone: TIME_ZONE, hour: '2-digit', minute: '2-digit', hour12: false });

export type BusinessNow = { day: string; date: string; minutes: number };

// Día, fecha y hora en la zona horaria del negocio, no en la del visitante.
export function businessNow(date: Date = new Date()): BusinessNow {
  const [hour, minute] = TIME_FORMAT.format(date).split(':').map(Number);
  return { day: DAY_FORMAT.format(date).toLowerCase(), date: DATE_FORMAT.format(date), minutes: (hour % 24) * 60 + minute };
}

// Instante en que empezó el día de hoy en Chile.
export function businessDayStart(date: Date = new Date()): Date {
  const minute = Math.floor(date.getTime() / 60000);
  return new Date((minute - businessNow(date).minutes) * 60000);
}

export type Shift = { start: number; end: number; from: string; to: string };

const toMinutes = (time: string) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

// Convierte "09:00-13:00,15:00-19:00" en turnos, ordenados por hora de inicio.
export function parseShifts(value: string | undefined): Shift[] {
  const v = (value ?? '').trim();
  if (!v || v === CLOSED || !VALUE_PATTERN.test(v)) return [];
  return v
    .split(',')
    .map((range) => {
      const [from, to] = range.split('-');
      return { start: toMinutes(from), end: toMinutes(to), from, to };
    })
    .sort((a, b) => a.start - b.start);
}

// Un turno que termina antes de empezar cruza la medianoche (20:00-02:00).
const isOvernight = (shift: Shift) => shift.end <= shift.start;

// Motivo por el que un valor no es válido, o null si lo es.
export function shiftsProblem(value: string): string | null {
  if (value === '' || value === CLOSED) return null;
  if (!VALUE_PATTERN.test(value)) return 'Usa horas válidas, por ejemplo 09:00-18:00';
  const shifts = parseShifts(value);
  if (shifts.length > MAX_SHIFTS) return `Puedes agregar hasta ${MAX_SHIFTS} turnos`;
  if (shifts.some((s) => s.start === s.end)) return 'La apertura y el cierre no pueden ser iguales';
  for (let i = 1; i < shifts.length; i++) {
    const previous = shifts[i - 1];
    if (isOvernight(previous) || shifts[i].start < previous.end) return 'Los turnos no pueden superponerse';
  }
  return null;
}

function isValidDate(key: string): boolean {
  if (!DATE_PATTERN.test(key)) return false;
  const date = new Date(`${key}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(key);
}

// Valida el horario completo. Se usa en el servidor; el formulario usa shiftsProblem por fila.
export function hoursProblem(hours: BusinessHours): string | null {
  for (const [key, value] of Object.entries(hours)) {
    if (!(BUSINESS_DAYS as readonly string[]).includes(key) && !isValidDate(key)) return `Día o fecha no válida: ${key}`;
    const problem = shiftsProblem(value);
    if (problem) return `${key}: ${problem}`;
  }
  return null;
}

export type BusinessStatus = {
  state: 'open' | 'closed' | 'unavailable';
  label: string;
  detail?: string;
  today: string;
};

// La fecha especial reemplaza al horario normal de ese día.
const valueFor = (hours: BusinessHours, day: string, date: string): string | undefined => hours[date] ?? hours[day];

function previousDay(now: BusinessNow): { day: string; date: string } {
  const index = BUSINESS_DAYS.indexOf(now.day as (typeof BUSINESS_DAYS)[number]);
  const date = new Date(`${now.date}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() - 1);
  return { day: BUSINESS_DAYS[(index + 6) % 7], date: date.toISOString().slice(0, 10) };
}

// Texto de un día para la página pública.
export function hoursText(value: string | undefined): string {
  if ((value ?? '').trim() === CLOSED) return 'Cerrado';
  const shifts = parseShifts(value);
  return shifts.length > 0 ? shifts.map((s) => `${s.from} – ${s.to}`).join(', ') : 'No disponible';
}

// Calcula el estado con el horario y la hora actual. Abre en la hora de apertura y cierra justo en la hora de cierre.
export function getBusinessStatus(hours: BusinessHours | null | undefined, now: BusinessNow = businessNow()): BusinessStatus {
  const schedule = hours ?? {};
  const value = valueFor(schedule, now.day, now.date);
  const today = `Hoy, ${now.day}: ${hoursText(value)}`;

  // Un turno nocturno de ayer puede seguir abierto de madrugada.
  const yesterday = previousDay(now);
  const carried = parseShifts(valueFor(schedule, yesterday.day, yesterday.date)).find((s) => isOvernight(s) && now.minutes < s.end);
  if (carried) return { state: 'open', label: 'Abierto ahora', detail: `Cierra a las ${carried.to}`, today };

  if ((value ?? '').trim() === CLOSED) return { state: 'closed', label: 'Cerrado hoy', today };
  const shifts = parseShifts(value);
  if (shifts.length === 0) return { state: 'unavailable', label: 'Horario no disponible', today };

  const current = shifts.find((s) => now.minutes >= s.start && (isOvernight(s) || now.minutes < s.end));
  if (current) return { state: 'open', label: 'Abierto ahora', detail: `Cierra a las ${current.to}`, today };

  const next = shifts.find((s) => s.start > now.minutes);
  if (!next) return { state: 'closed', label: 'Cerrado por hoy', today };
  // Antes del primer turno abre más tarde; entre dos turnos está cerrado por ahora.
  return next === shifts[0]
    ? { state: 'closed', label: `Abre a las ${next.from}`, today }
    : { state: 'closed', label: 'Cerrado ahora', detail: `Abre a las ${next.from}`, today };
}
