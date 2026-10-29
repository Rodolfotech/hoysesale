'use client';

import { useState, useEffect } from 'react';
import { useParams } from '@/lib/router';
import { eventsApi } from '../api';
import { FeaturedEventCard } from '../features/events/FeaturedEventCard';
import { EventCardSkeleton } from '../components/ui/EventCardSkeleton';
import type { Event } from '../types';

const CATEGORY_NAMES: Record<string, string> = {
  musica: 'Música',
  cultura: 'Cultura',
  gastronomia: 'Gastronomía',
  turismo: 'Turismo',
  trekking: 'Trekking',
  deportes: 'Deportes',
  ferias: 'Ferias',
  bienestar: 'Bienestar',
  fiestas: 'Fiestas',
};

const COMUNA_NAMES: Record<string, string> = {
  temuco: 'Temuco', carahue: 'Carahue', cholchol: 'Cholchol', cunco: 'Cunco',
  curarrehue: 'Curarrehue', freire: 'Freire', galvarino: 'Galvarino', gorbea: 'Gorbea',
  lautaro: 'Lautaro', loncoche: 'Loncoche', melipeuco: 'Melipeuco',
  'nueva-imperial': 'Nueva Imperial', 'padre-las-casas': 'Padre Las Casas',
  perquenco: 'Perquenco', pitrufquen: 'Pitrufquén', pucon: 'Pucón',
  'puerto-saavedra': 'Puerto Saavedra', 'teodoro-schmidt': 'Teodoro Schmidt',
  tolten: 'Toltén', vilcun: 'Vilcún', villarrica: 'Villarrica',
  angol: 'Angol', collipulli: 'Collipulli', curacautin: 'Curacautín',
  ercilla: 'Ercilla', lonquimay: 'Lonquimay', 'los-sauces': 'Los Sauces',
  lumaco: 'Lumaco', puren: 'Purén', renaico: 'Renaico', traiguen: 'Traiguén',
  victoria: 'Victoria',
};

export default function CategoryEvents() {
  const { slug: category } = useParams<{ slug: string }>();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  const slug = category || '';
  const isCategory = slug in CATEGORY_NAMES;
  const isComuna = slug in COMUNA_NAMES;
  const displayName = CATEGORY_NAMES[slug] || COMUNA_NAMES[slug] || slug;
  const subtitle = isCategory
    ? `Eventos de ${displayName} disponibles en La Araucanía.`
    : `Eventos disponibles en ${displayName}.`;

  useEffect(() => {
    setLoading(true);
    eventsApi.getAll({ limit: 100 })
      .then(({ data: { data } }) => {
        const filtered = data.filter((e: Event) => {
          if (isCategory) return e.category?.name.toLowerCase() === displayName.toLowerCase();
          if (isComuna) return e.city?.toLowerCase() === displayName.toLowerCase();
          return e.category?.name.toLowerCase() === slug || e.city?.toLowerCase() === slug;
        });
        setEvents(filtered);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, isCategory, isComuna, displayName]);

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-20">
        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '8px' }}>
          {displayName}
        </p>
        <p style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '32px' }}>
          {subtitle}
        </p>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-2xl p-16 text-center" style={{ border: '1px solid #E4EBFA' }}>
            <p style={{ fontSize: '14px', color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif" }}>
              No hay eventos en {displayName} disponibles en este momento.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
