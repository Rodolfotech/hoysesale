'use client';

import { useNavigate } from '@/lib/router';
import { EventSearchForm, type EventSearchParams } from '../../components/ui/EventSearchForm';

export function HeroSearch() {
  const navigate = useNavigate();

  const handleSearch = (params: EventSearchParams) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.fecha) qs.set('fecha', params.fecha);
    if (params.categoria) qs.set('categoria', params.categoria);
    if (params.ciudad) qs.set('ciudad', params.ciudad);
    if (params.gratis) qs.set('gratis', 'true');
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    navigate(`/categorias?${qs.toString()}`);
  };

  return (
    <div className="bg-white">
      {/* Imagen contenida con bordes redondeados */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative w-full rounded-b-3xl overflow-hidden" style={{ height: '380px' }}>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/home/home_eventos.webp)' }}
          />
          <div className="absolute inset-0 bg-black/70" />

          {/* Título y subtítulo */}
          <div className="relative z-10 flex flex-col items-center justify-end h-full pb-28 text-center px-8 w-full">
            <h1
              className="text-5xl md:text-6xl font-semibold text-white drop-shadow-lg w-full"
              style={{ fontFamily: 'var(--font-brand)' }}
            >
              Descubre La Araucanía
            </h1>
            <p className="text-base md:text-xl text-white/85 mt-3 w-full">
              Explora eventos únicos, naturaleza y cultura en el corazón del sur de Chile
            </p>
          </div>
        </div>
      </div>

      {/* Card que sobresale de la imagen hacia abajo */}
      <div className="max-w-7xl mx-auto px-10 -mt-27 relative z-20 pb-6">
        <EventSearchForm onSearch={handleSearch} />
      </div>
    </div>
  );
}
