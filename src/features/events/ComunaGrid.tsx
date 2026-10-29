'use client';

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from '@/lib/router';
import { eventsApi } from '../../api';
import { COMUNAS } from '../../constants/comunas';
import { Pagination } from '../../components/ui/Pagination';
import type { Event } from '../../types';

const PER_PAGE = 8;

const PRIORITY_COMUNAS = [
  'Temuco',
  'Villarrica',
  'Pucón',
  'Nueva Imperial',
  'Puerto Saavedra',
  'Angol',
  'Traiguén',
  'Carahue',
];

// WebP con fallback JPG para cada comuna con foto
const COMUNA_IMAGE: Record<string, { webp: string; jpg: string }> = {
  'Temuco':          { webp: '/comunas/temuco.webp',          jpg: '/comunas/temuco.jpg' },
  'Villarrica':      { webp: '/comunas/villarrica.webp',      jpg: '/comunas/villarrica.jpg' },
  'Pucón':           { webp: '/comunas/pucon.webp',           jpg: '/comunas/pucon.jpg' },
  'Nueva Imperial':  { webp: '/comunas/nueva-imperial.webp',  jpg: '/comunas/nueva-imperial.jpg' },
  'Puerto Saavedra': { webp: '/comunas/puerto-saavedra.webp', jpg: '/comunas/puerto-saavedra.jpg' },
  'Angol':           { webp: '/comunas/angol.webp',           jpg: '/comunas/angol.jpg' },
  'Traiguén':        { webp: '/comunas/traiguen.webp',        jpg: '/comunas/traiguen.jpg' },
  'Carahue':         { webp: '/comunas/carahue.webp',         jpg: '/comunas/carahue.jpg' },
};

const FALLBACK_COLORS = ['#1D3461','#0F766E','#15803D','#7C3AED','#0369A1','#BE185D','#374151','#0891B2'];

function getFallbackColor(name: string): string {
  return FALLBACK_COLORS[name.charCodeAt(0) % FALLBACK_COLORS.length];
}

interface ComunaData {
  name: string;
  count: number;
}

interface Props {
  title?: string;
  subtitle?: string;
}

export function ComunaGrid({
  title = 'Descubre experiencias por comuna',
  subtitle = 'Explora eventos y experiencias en las distintas comunas de la región.',
}: Props) {
  const navigate = useNavigate();
  const sectionRef = useRef<HTMLElement>(null);
  // Inicializa con las comunas prioritarias de inmediato — sin esperar la API
  const [comunas, setComunas] = useState<ComunaData[]>(() => {
    const priority = PRIORITY_COMUNAS.map((name) => ({ name, count: 0 }));
    const rest = COMUNAS
      .filter((name) => !PRIORITY_COMUNAS.includes(name))
      .map((name) => ({ name, count: 0 }));
    return [...priority, ...rest];
  });
  const [page, setPage] = useState(1);

  function handlePageChange(newPage: number) {
    setPage(newPage);
    requestAnimationFrame(() => {
      if (sectionRef.current) {
        window.scrollTo({ top: sectionRef.current.offsetTop - 72, behavior: 'smooth' });
      }
    });
  }

  // Carga los conteos en segundo plano sin bloquear el render inicial
  useEffect(() => {
    eventsApi.getAll({ limit: 100 })
      .then(({ data: { data } }) => {
        const counts: Record<string, number> = {};
        (data as Event[]).forEach((e) => {
          if (e.city) counts[e.city] = (counts[e.city] || 0) + 1;
        });
        setComunas((prev) =>
          prev.map((c) => ({ ...c, count: counts[c.name] || 0 }))
        );
      })
      .catch(() => {});
  }, []);

  const totalPages = Math.ceil(comunas.length / PER_PAGE);
  const visible = comunas.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <section ref={sectionRef} className="w-full py-12" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>{title}</h2>
          <p className="mt-2 text-base font-medium max-w-xl mx-auto" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>{subtitle}</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {visible.map(({ name, count }, index) => {
            const img = COMUNA_IMAGE[name];
            // Las primeras 4 comunas (above the fold) cargan eager, el resto lazy
            const loadingStrategy = index < 4 ? 'eager' : 'lazy';
            return (
              <button
                key={name}
                type="button"
                onClick={() => navigate(`/${name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`)}
                className="relative w-full rounded-2xl overflow-hidden cursor-pointer group"
              >
                {/* Capa 1: color fallback (fondo base) */}
                <div
                  className="absolute inset-0"
                  style={{ backgroundColor: getFallbackColor(name) }}
                />

                {/* Capa 2: foto WebP con fallback JPG */}
                {img ? (
                  <picture>
                    <source srcSet={img.webp} type="image/webp" />
                    <img
                      src={img.jpg}
                      alt={name}
                      loading={loadingStrategy}
                      decoding="async"
                      className="relative block w-full h-auto transition-transform duration-500 group-hover:scale-105"
                    />
                  </picture>
                ) : (
                  <div className="w-full" style={{ height: '200px' }} />
                )}

                {/* Capa 3: overlay oscuro */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition-colors" />

                {/* Capa 4: texto */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                  <p className="text-white font-semibold text-lg leading-tight" style={{ fontFamily: "'Raleway', sans-serif" }}>{name}</p>
                  <p className="text-white/80 text-sm mt-0.5" style={{ fontFamily: "'Raleway', sans-serif" }}>{count} Evento{count !== 1 ? 's' : ''}</p>
                </div>
              </button>
            );
          })}
        </div>

        <Pagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
      </div>
    </section>
  );
}
