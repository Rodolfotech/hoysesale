// Slug de evento: título normalizado + sufijo de tiempo. El sufijo evita colisiones; no quitarlo.
export function eventSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúñü]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
  return `${base}-${Date.now().toString(36)}`;
}
