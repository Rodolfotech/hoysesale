// Mapa de un evento: Google solo permite incrustar su vista "embed", no el enlace que copia el usuario.
const COORDS = [
  /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/, // ubicación exacta del lugar
  /@(-?\d+\.\d+),(-?\d+\.\d+)/, // centro de la vista
  /[?&](?:ll|q|query|destination)=(-?\d+\.\d+)(?:,|%2C)(-?\d+\.\d+)/i, // Waze y enlaces con parámetros
];

function placeFromMapUrl(url: string): string | null {
  for (const pattern of COORDS) {
    const match = url.match(pattern);
    if (match) return `${match[1]},${match[2]}`;
  }
  const name = url.match(/\/maps\/place\/([^/@?]+)/)?.[1];
  if (!name) return null;
  try {
    return decodeURIComponent(name.replace(/\+/g, ' '));
  } catch {
    return null;
  }
}

// Usa el primer lugar disponible. Sin ninguno no hay mapa.
export function mapEmbedUrl(mapUrl: string | null | undefined, ...places: (string | null | undefined)[]): string | null {
  const place = (mapUrl && placeFromMapUrl(mapUrl)) || places.find((p) => p?.trim());
  return place ? `https://www.google.com/maps?q=${encodeURIComponent(place)}&z=15&output=embed` : null;
}
