import { describe, expect, it } from 'vitest';
import { inOutingRange, outingRange } from './home';

// Las fechas se calculan con la hora de Chile (UTC-3 en noviembre).
const at = (iso: string) => new Date(iso);

describe('pestañas de Hoy se sale', () => {
  it('un miércoles: el finde va de viernes a domingo y la próxima semana de lunes a domingo', () => {
    const wed = at('2026-11-11T15:00:00-03:00');
    expect(outingRange('hoy', wed)).toEqual({ from: '2026-11-11', to: '2026-11-11' });
    expect(outingRange('finde', wed)).toEqual({ from: '2026-11-13', to: '2026-11-15' });
    expect(outingRange('proxima', wed)).toEqual({ from: '2026-11-16', to: '2026-11-22' });
    expect(outingRange('despues', wed)).toEqual({ from: '2026-11-23', to: '9999-12-31' });
  });

  it('un sábado: el finde empieza hoy', () => {
    expect(outingRange('finde', at('2026-11-14T10:00:00-03:00'))).toEqual({ from: '2026-11-14', to: '2026-11-15' });
  });

  it('usa el día de Chile aunque en UTC ya sea mañana', () => {
    const now = at('2026-11-13T22:30:00-03:00'); // 01:30 del sábado en UTC
    expect(inOutingRange('2026-11-13T23:00:00-03:00', 'hoy', now)).toBe(true);
    expect(inOutingRange('2026-11-14T01:00:00-03:00', 'hoy', now)).toBe(false);
  });
});
