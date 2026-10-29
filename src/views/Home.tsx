'use client';

import { useState, useEffect } from 'react';
import { eventsApi } from '../api';
import { getCached, setCached } from '../api/eventsCache';
import { HeroSearch } from '../features/events/HeroSearch';
import { EventsCarouselGrid } from '../features/events/EventsCarouselGrid';
import { CategoryGrid } from '../features/events/CategoryGrid';
import { ComunaGrid } from '../features/events/ComunaGrid';
import { UpcomingEventsCarousel } from '../features/events/UpcomingEventsCarousel';
import { OrganizerCTA } from '../features/events/OrganizerCTA';
import type { Event } from '../types';

const FEATURED_PARAMS = { limit: 100, dateFrom: new Date().toISOString().split('T')[0] };
const UPCOMING_PARAMS = { limit: 100 };

export default function Home() {
  const [featured, setFeatured] = useState<Event[]>(() => getCached<Event[]>(FEATURED_PARAMS) ?? []);
  const [upcoming, setUpcoming] = useState<Event[]>(() => getCached<Event[]>(UPCOMING_PARAMS) ?? []);
  const [loading, setLoading] = useState(
    () => getCached<Event[]>(FEATURED_PARAMS) === null || getCached<Event[]>(UPCOMING_PARAMS) === null
  );

  useEffect(() => {
    const cachedFeatured = getCached<Event[]>(FEATURED_PARAMS);
    const cachedUpcoming = getCached<Event[]>(UPCOMING_PARAMS);
    if (cachedFeatured) setFeatured(cachedFeatured);
    if (cachedUpcoming) setUpcoming(cachedUpcoming);
    if (cachedFeatured && cachedUpcoming) setLoading(false);

    Promise.all([
      eventsApi.getAll(FEATURED_PARAMS),
      eventsApi.getAll(UPCOMING_PARAMS),
    ])
      .then(([featuredRes, upcomingRes]) => {
        const f = featuredRes.data.data;
        const u = upcomingRes.data.data;
        setFeatured(f);
        setUpcoming(u);
        setCached(FEATURED_PARAMS, f);
        setCached(UPCOMING_PARAMS, u);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showSkeletons = loading && featured.length === 0;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#FFFFFF' }}>
      <HeroSearch />

      {/* Eventos destacados */}
      <section className="max-w-7xl mx-auto px-4 pt-12 pb-12">
        <EventsCarouselGrid
          events={featured}
          loading={showSkeletons}
          title="Eventos destacados"
          subtitle="Experiencias únicas que no te puedes perder"
        />
        <div className="text-center mt-8">
          <button
            type="button"
            onClick={() => document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-base font-semibold hover:underline cursor-pointer"
            style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}
          >
            Ver todos los eventos →
          </button>
        </div>
      </section>

      <div id="categorias"><CategoryGrid /></div>
      <div id="comunas"><ComunaGrid /></div>
      <UpcomingEventsCarousel events={upcoming} loading={loading && upcoming.length === 0} />
      <OrganizerCTA />
    </div>
  );
}
