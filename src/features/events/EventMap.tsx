interface EventMapProps {
  url: string;
  title: string;
}

// Mapa de Google incrustado. La política de seguridad de next.config.ts permite este origen.
export function EventMap({ url, title }: EventMapProps) {
  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
      <iframe src={url} title={`Mapa de ${title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="block w-full h-72 border-0" />
    </div>
  );
}
