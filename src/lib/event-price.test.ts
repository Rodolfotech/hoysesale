import { describe, expect, it } from 'vitest';
import { formatEntryPrice, parseEntryPrice, priceDigits } from './event-price';

describe('valor de entrada', () => {
  it('elimina letras y caracteres especiales', () => {
    expect(priceDigits('$5a.0-0#0')).toBe('5000');
    expect(priceDigits('abc')).toBe('');
  });

  it('ignora ceros a la izquierda y limita el largo', () => {
    expect(priceDigits('0050')).toBe('50');
    expect(priceDigits('12345678901')).toBe('123456789');
  });

  it('muestra el formato $precio', () => {
    expect(formatEntryPrice('500')).toBe('$500');
    expect(formatEntryPrice('5000')).toBe('$5.000');
    expect(formatEntryPrice('1500000')).toBe('$1.500.000');
    expect(formatEntryPrice('')).toBe('');
  });

  it('lee precios guardados y descarta textos o enlaces', () => {
    expect(parseEntryPrice('$5.000')).toBe('5000');
    expect(parseEntryPrice('adhesión voluntaria')).toBe('');
    expect(parseEntryPrice('https://entradas.cl')).toBe('');
    expect(parseEntryPrice(null)).toBe('');
  });
});
