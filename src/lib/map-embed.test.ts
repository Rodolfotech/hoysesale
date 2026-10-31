import { describe, expect, it } from 'vitest';
import { mapEmbedUrl } from './map-embed';

const query = (url: string | null) => (url ? new URL(url).searchParams.get('q') : null);

describe('mapEmbedUrl', () => {
  it('prefiere el punto exacto del lugar sobre el centro de la vista', () => {
    const url = 'https://www.google.com/maps/place/Mirador/@-39.30,-71.90,15z/data=!3m1!4b1!3d-39.3010!4d-71.9123';
    expect(query(mapEmbedUrl(url))).toBe('-39.3010,-71.9123');
  });

  it('usa el centro de la vista si no hay punto exacto', () => {
    expect(query(mapEmbedUrl('https://www.google.com/maps/@-39.30,-71.90,15z'))).toBe('-39.30,-71.90');
  });

  it('lee coordenadas de Waze', () => {
    expect(query(mapEmbedUrl('https://www.waze.com/ul?ll=-38.73%2C-72.59&navigate=yes'))).toBe('-38.73,-72.59');
  });

  it('usa el nombre del lugar si no hay coordenadas', () => {
    expect(query(mapEmbedUrl('https://www.google.com/maps/place/Mirador+Piedra+Sagrada'))).toBe('Mirador Piedra Sagrada');
  });

  it('cae en la dirección con enlaces cortos o vacíos', () => {
    expect(query(mapEmbedUrl('https://maps.app.goo.gl/abc', 'Bulnes 123, Temuco'))).toBe('Bulnes 123, Temuco');
    expect(query(mapEmbedUrl(null, null, ' ', 'Villarrica'))).toBe('Villarrica');
  });

  it('sin lugar no hay mapa', () => {
    expect(mapEmbedUrl(null, null, '')).toBeNull();
  });
});
