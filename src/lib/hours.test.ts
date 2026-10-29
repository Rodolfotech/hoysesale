import { describe, expect, it } from 'vitest';
import { BUSINESS_DAYS } from '@/constants/business';
import { chileNow, dayStatus, formatRangeInput, hoursText, parseRange } from './hours';

const at = (day: string, hh: number, mm = 0) => ({ day, minutes: hh * 60 + mm });

describe('horarios', () => {
  it('el día de hoy muestra Abierto dentro del rango y Cerrado fuera', () => {
    expect(dayStatus('12:00-23:00', 'lunes', at('lunes', 13))).toBe('Abierto');
    expect(dayStatus('12:00-23:00', 'lunes', at('lunes', 23, 30))).toBe('Cerrado');
    expect(dayStatus('12:00-23:00', 'lunes', at('lunes', 11, 59))).toBe('Cerrado');
  });

  it('un horario que cruza la medianoche sigue abierto después de las 00:00', () => {
    expect(dayStatus('20:00-02:00', 'viernes', at('viernes', 1))).toBe('Abierto');
    expect(dayStatus('20:00-02:00', 'viernes', at('viernes', 3))).toBe('Cerrado');
  });

  it('abierto y cerrado fijos no dependen de la hora', () => {
    expect(dayStatus('abierto', 'domingo', at('lunes', 3))).toBe('Abierto');
    expect(dayStatus('cerrado', 'sábado', at('sábado', 20))).toBe('Cerrado');
  });

  it('sin horario fijo muestra -', () => {
    expect(dayStatus('', 'martes', at('martes', 10))).toBe('-');
    expect(dayStatus(undefined, 'martes', at('martes', 10))).toBe('-');
  });

  it('un horario de otro día no puede saberse abierto ahora', () => {
    expect(dayStatus('12:00-23:00', 'jueves', at('lunes', 13))).toBe('Según horario');
    expect(hoursText('12:00-23:00', 'jueves', at('lunes', 13))).toBe('12:00-23:00');
  });

  it('en la página pública el día de hoy incluye su estado', () => {
    expect(hoursText('12:00-23:00', 'lunes', at('lunes', 13))).toBe('12:00-23:00 · Abierto');
    expect(hoursText('cerrado', 'domingo', at('lunes', 13))).toBe('Cerrado');
    expect(hoursText('', 'domingo', at('lunes', 13))).toBe('-');
  });

  it('el horario se escribe con formato 12:00-23:00 y solo dígitos', () => {
    expect(formatRangeInput('1200')).toBe('12:00');
    expect(formatRangeInput('12002300')).toBe('12:00-23:00');
    expect(formatRangeInput('12:00-23:00 abc')).toBe('12:00-23:00');
    expect(parseRange('12:00-23:00')).toEqual([720, 1380]);
  });

  it('el día actual de Chile es uno de los días del negocio', () => {
    expect(BUSINESS_DAYS).toContain(chileNow().day);
  });
});
