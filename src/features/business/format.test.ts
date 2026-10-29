import { describe, expect, it } from 'vitest';
import { TAG_LABELS, formatCLP, whatsappLink } from './format';

describe('formatCLP', () => {
  it('formatea pesos chilenos sin decimales', () => {
    expect(formatCLP(12900)).toMatch(/12\.900/);
    expect(formatCLP(0)).toMatch(/\$\s?0/);
  });
});

describe('whatsappLink', () => {
  it('quita los caracteres no numéricos del teléfono y codifica el mensaje', () => {
    const url = whatsappLink('+56 9 1234 5678', 'Hola, quiero reservar');
    expect(url.startsWith('https://wa.me/56912345678?text=')).toBe(true);
    expect(decodeURIComponent(url.split('text=')[1])).toBe('Hola, quiero reservar');
  });
});

describe('TAG_LABELS', () => {
  it('tiene una etiqueta para cada etiqueta de producto', () => {
    expect(Object.keys(TAG_LABELS).sort()).toEqual(['DEL_DIA', 'MAS_VENDIDO', 'NUEVO', 'REGALO']);
  });
});
