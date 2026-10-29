import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  it('calcula días, horas, minutos y segundos hasta una fecha futura', () => {
    const to = new Date(Date.now() + (2 * 86400 + 3 * 3600 + 4 * 60 + 5) * 1000);
    const { result } = renderHook(() => useCountdown(to));
    expect(result.current.days).toBe(2);
    expect(result.current.hours).toBe(3);
    expect(result.current.minutes).toBe(4);
    expect(result.current.seconds).toBeGreaterThanOrEqual(4);
  });

  it('no baja de cero para una fecha pasada', () => {
    const { result } = renderHook(() => useCountdown(new Date(Date.now() - 60_000)));
    expect(result.current).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});
