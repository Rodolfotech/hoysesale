'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { FeaturedEventCard } from './FeaturedEventCard';
import { EventCardSkeleton } from '../../components/ui/EventCardSkeleton';
import type { Event } from '../../types';

const PAGE_SIZE = 4;

interface Props {
  events: Event[];
  loading: boolean;
  title: string;
  subtitle: string;
}

export function EventsCarouselGrid({ events, loading, title, subtitle }: Props) {
  const [page, setPage] = useState(0);

  useEffect(() => { setPage(0); }, [events]);

  const totalPages = Math.ceil(events.length / PAGE_SIZE);
  const hasPrev = page > 0;
  const hasNext = page < totalPages - 1;
  const visible = events.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const showSkeletons = loading && events.length === 0;

  return (
    <div>
      {/* Encabezado */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold tracking-tight" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>
          {title}
        </h2>
        <p className="mt-2 text-base font-medium" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>
          {subtitle}
        </p>
      </div>

      {/* Grid con flechas laterales sobre la imagen */}
      <div className="relative">

        {/* Flecha izquierda — centrada en la imagen (4:5 → imagen ocupa ~62% del alto total de la card) */}
        {hasPrev && (
          <button
            type="button"
            aria-label="Página anterior"
            onClick={() => setPage(p => p - 1)}
            className="hidden lg:flex absolute left-0 -translate-x-1/2 z-10 w-11 h-11 rounded-full items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
            style={{ top: '31%', backgroundColor: '#FFFFFF' }}
          >
            <ChevronLeft className="w-5 h-5" style={{ color: '#2563EB' }} />
          </button>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
          {showSkeletons
            ? Array.from({ length: PAGE_SIZE }).map((_, i) => <EventCardSkeleton key={i} />)
            : visible.map(event => <FeaturedEventCard key={event.id} event={event} />)
          }
        </div>

        {/* Flecha derecha */}
        {hasNext && (
          <button
            type="button"
            aria-label="Página siguiente"
            onClick={() => setPage(p => p + 1)}
            className="hidden lg:flex absolute right-0 translate-x-1/2 z-10 w-11 h-11 rounded-full items-center justify-center shadow-lg cursor-pointer hover:scale-105 transition-transform"
            style={{ top: '31%', backgroundColor: '#FFFFFF' }}
          >
            <ChevronRight className="w-5 h-5" style={{ color: '#2563EB' }} />
          </button>
        )}

        {/* Flechas mobile — debajo del grid, centradas */}
        {totalPages > 1 && (
          <div className="flex lg:hidden justify-center gap-3 mt-6">
            <button
              type="button"
              aria-label="Página anterior"
              onClick={() => setPage(p => p - 1)}
              disabled={!hasPrev}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow cursor-pointer disabled:opacity-30"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <ChevronLeft className="w-5 h-5" style={{ color: '#2563EB' }} />
            </button>
            <button
              type="button"
              aria-label="Página siguiente"
              onClick={() => setPage(p => p + 1)}
              disabled={!hasNext}
              className="w-10 h-10 rounded-full flex items-center justify-center shadow cursor-pointer disabled:opacity-30"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <ChevronRight className="w-5 h-5" style={{ color: '#2563EB' }} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
