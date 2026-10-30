import { describe, expect, it } from 'vitest';
import { businessDayStart, businessNow, cleanBusinessHours, getBusinessStatus, hoursProblem, hoursText, parseShifts, shiftsProblem } from './hours';

// 2026-10-28 es miércoles.
const at = (day: string, date: string, hh: number, mm = 0) => ({ day, date, minutes: hh * 60 + mm });
const miercoles = (hh: number, mm = 0) => at('miércoles', '2026-10-28', hh, mm);

describe('getBusinessStatus', () => {
  const week = { miércoles: '09:00-18:00', sábado: '09:00-13:00', domingo: 'cerrado' };

  it('abre en la hora de apertura y cierra justo en la hora de cierre', () => {
    expect(getBusinessStatus(week, miercoles(9)).label).toBe('Abierto ahora');
    expect(getBusinessStatus(week, miercoles(17, 59)).state).toBe('open');
    expect(getBusinessStatus(week, miercoles(18)).state).toBe('closed');
  });

  it('indica cuándo cierra y cuándo abre', () => {
    expect(getBusinessStatus(week, miercoles(11, 30)).detail).toBe('Cierra a las 18:00');
    expect(getBusinessStatus(week, miercoles(8)).label).toBe('Abre a las 09:00');
    expect(getBusinessStatus(week, miercoles(19)).label).toBe('Cerrado por hoy');
  });

  it('un día cerrado muestra Cerrado hoy', () => {
    expect(getBusinessStatus(week, at('domingo', '2026-11-01', 11)).label).toBe('Cerrado hoy');
  });

  it('sin horario no asume que está cerrado', () => {
    expect(getBusinessStatus(null, miercoles(11)).state).toBe('unavailable');
    expect(getBusinessStatus({ jueves: '09:00-18:00' }, miercoles(11)).label).toBe('Horario no disponible');
  });

  it('entre dos turnos está cerrado y avisa cuándo vuelve a abrir', () => {
    const split = { miércoles: '09:00-13:00,15:00-19:00' };
    expect(getBusinessStatus(split, miercoles(10)).state).toBe('open');
    expect(getBusinessStatus(split, miercoles(14))).toMatchObject({ label: 'Cerrado ahora', detail: 'Abre a las 15:00' });
    expect(getBusinessStatus(split, miercoles(16)).detail).toBe('Cierra a las 19:00');
  });

  it('un turno nocturno sigue abierto de madrugada del día siguiente', () => {
    const night = { viernes: '20:00-02:00' };
    expect(getBusinessStatus(night, at('viernes', '2026-10-30', 21)).state).toBe('open');
    expect(getBusinessStatus(night, at('sábado', '2026-10-31', 1))).toMatchObject({ state: 'open', detail: 'Cierra a las 02:00' });
    expect(getBusinessStatus(night, at('sábado', '2026-10-31', 2)).state).toBe('unavailable');
  });

  it('el viernes de madrugada no usa el turno que empieza esa noche', () => {
    expect(getBusinessStatus({ viernes: '20:00-02:00' }, at('viernes', '2026-10-30', 1)).state).toBe('closed');
  });

  it('una fecha especial reemplaza al horario normal', () => {
    const holiday = { miércoles: '09:00-18:00', '2026-10-28': 'cerrado' };
    expect(getBusinessStatus(holiday, miercoles(11)).label).toBe('Cerrado hoy');
    expect(getBusinessStatus(holiday, at('miércoles', '2026-11-04', 11)).state).toBe('open');
  });

  it('el estado ya no depende de un valor manual "abierto"', () => {
    expect(getBusinessStatus({ miércoles: 'abierto' }, miercoles(11)).state).toBe('unavailable');
  });
});

describe('validación del horario', () => {
  it('acepta turnos, cerrado y vacío', () => {
    expect(shiftsProblem('09:00-13:00,15:00-19:00')).toBeNull();
    expect(shiftsProblem('20:00-02:00')).toBeNull();
    expect(shiftsProblem('cerrado')).toBeNull();
    expect(shiftsProblem('')).toBeNull();
  });

  it('rechaza horarios inválidos', () => {
    expect(shiftsProblem('abierto')).not.toBeNull();
    expect(shiftsProblem('09:00-09:00')).not.toBeNull();
    expect(shiftsProblem('09:00-14:00,13:00-19:00')).not.toBeNull();
    expect(shiftsProblem('08:00-09:00,10:00-11:00,12:00-13:00,14:00-15:00')).not.toBeNull();
  });

  it('solo admite días de la semana y fechas reales', () => {
    expect(hoursProblem({ lunes: '09:00-18:00', '2026-12-25': 'cerrado' })).toBeNull();
    expect(hoursProblem({ feriado: 'cerrado' })).not.toBeNull();
    expect(hoursProblem({ '2026-02-30': 'cerrado' })).not.toBeNull();
  });
});

describe('businessDayStart', () => {
  it('devuelve la medianoche de Chile', () => {
    expect(businessDayStart(new Date('2026-10-28T15:30:45Z')).toISOString()).toBe('2026-10-28T03:00:00.000Z');
  });

  it('usa el día de Chile aunque en UTC ya sea el siguiente', () => {
    expect(businessDayStart(new Date('2026-10-29T02:00:00Z')).toISOString()).toBe('2026-10-28T03:00:00.000Z');
  });
});

describe('textos del horario', () => {
  it('muestra turnos, cerrado o no disponible', () => {
    expect(hoursText('09:00-13:00,15:00-19:00')).toBe('09:00 – 13:00, 15:00 – 19:00');
    expect(hoursText('cerrado')).toBe('Cerrado');
    expect(hoursText(undefined)).toBe('No disponible');
  });

  it('ordena los turnos por hora de inicio', () => {
    expect(parseShifts('15:00-19:00,09:00-13:00').map((s) => s.from)).toEqual(['09:00', '15:00']);
  });

  it('usa la hora de Chile aunque el visitante esté en otra zona', () => {
    expect(businessNow(new Date('2026-10-28T15:00:00Z'))).toEqual({ day: 'miércoles', date: '2026-10-28', minutes: 12 * 60 });
  });
});

describe('cleanBusinessHours', () => {
  it('quita días vacíos y el antiguo valor abierto', () => {
    expect(cleanBusinessHours({ lunes: '09:00-18:00', martes: ' ', miercoles: 'abierto', domingo: 'cerrado' })).toEqual({ lunes: '09:00-18:00', domingo: 'cerrado' });
  });
});
