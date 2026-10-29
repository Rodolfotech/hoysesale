'use client';

import { useParams, Link } from '@/lib/router';
import { useState, useEffect } from 'react';
import { eventsApi, adminApi } from '../api';
import { useAuth } from '../context/AuthContext';
import type { Event } from '../types';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  ArrowLeft,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
} from 'lucide-react';
import { SocialPostMedia } from '../features/social/SocialPostMedia';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function EventDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      eventsApi.getBySlug(slug).then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
    }
  }, [slug]);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for browsers without clipboard API
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen pt-16 flex items-center justify-center" style={{ backgroundColor: '#F8FAFC' }}>
        <p className="text-sm" style={{ color: '#1D1D1F99' }}>Evento no encontrado</p>
      </div>
    );
  }

  const priceFromAddress = event.address && !event.address.startsWith('http') ? event.address : null;
  const isFree = !event.price && !priceFromAddress;
  const slides = [
    ...(event.imageUrl ? [{ type: 'image' as const, url: event.imageUrl }] : []),
    ...((event.socialFeed || []).filter(p => p.media_url).map(p => ({ type: 'post' as const, post: p }))),
  ];
  const currentSlide = slides[slideIndex] ?? null;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-20">

        <Link
          to="/categorias"
          className="inline-flex items-center gap-2 text-sm mb-6 transition-colors hover:opacity-70"
          style={{ color: '#2563EB' }}
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a eventos
        </Link>

        {/* Card principal */}
        <div className="rounded-2xl" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
          <div className="p-6 md:p-8">

            {/* Layout 2 columnas */}
            <div className="flex flex-col md:flex-row gap-8">

              {/* Columna izquierda — info */}
              <div className="flex-1 min-w-0">

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.category && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#E4EBFA', color: '#2563EB' }}>
                      {event.category.name}
                    </span>
                  )}
                  {isFree ? (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                      Gratis
                    </span>
                  ) : (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                      Evento de pago
                    </span>
                  )}
                  {event.isOnline && (
                    <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: '#FEF9C3', color: '#CA8A04' }}>
                      <Globe className="w-3 h-3" />
                      Online
                    </span>
                  )}
                </div>

                {/* Título */}
                <h1 className="text-xl md:text-2xl font-bold tracking-tight mb-5" style={{ color: '#1D1D1F' }}>
                  {event.title}
                </h1>

                {/* Filas de información */}
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#2563EB' }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#1D1D1F66' }}>Fecha</p>
                      <p className="text-sm font-medium capitalize" style={{ color: '#1D1D1F' }}>
                        {format(new Date(event.date), "EEEE d 'De' MMMM, yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#2563EB' }} />
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#1D1D1F66' }}>Hora</p>
                      <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>
                        {format(new Date(event.date), 'HH:mm')} hrs
                      </p>
                    </div>
                  </div>

                  {event.owner?.name && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#2563EB' }} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#1D1D1F66' }}>Organizador</p>
                        <p className="text-sm font-medium" style={{ color: '#1D1D1F' }}>
                          {event.owner.name}{event.city ? `, ${event.city}` : ''}
                        </p>
                      </div>
                    </div>
                  )}

                  {event.owner?.instagramUsername && (
                    <div className="flex items-start gap-3">
                      <InstagramIcon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: '#2563EB' } as React.CSSProperties} />
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide mb-0.5" style={{ color: '#1D1D1F66' }}>Instagram</p>
                        <a
                          href={`https://www.instagram.com/${event.owner.instagramUsername}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => { if (isAuthenticated) adminApi.trackInstagramClick(event?.id).catch(() => {}); }}
                          className="text-sm font-medium hover:underline"
                          style={{ color: '#2563EB' }}
                        >
                          @{event.owner.instagramUsername}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="my-6" style={{ borderTop: '1px solid #E4EBFA' }} />

                {/* Descripción */}
                <div>
                  <h2 className="text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>Descripción</h2>
                  <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#1D1D1F99' }}>{event.description}</p>
                </div>

                {event.content && (
                  <div className="mt-4">
                    <h2 className="text-sm font-semibold mb-2" style={{ color: '#1D1D1F' }}>Detalles</h2>
                    <p className="text-sm leading-relaxed" style={{ color: '#1D1D1F99' }}>{event.content}</p>
                  </div>
                )}
              </div>

              {/* Columna derecha — imagen/carousel */}
              {slides.length > 0 && (
                <div className="md:w-72 lg:w-80 shrink-0">
                  <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
                    {currentSlide?.type === 'image' && currentSlide.url && (
                      <img src={currentSlide.url} alt={event.title} className="w-full h-auto block" />
                    )}
                    {currentSlide?.type === 'post' && currentSlide.post && (
                      <SocialPostMedia post={currentSlide.post} className="w-full h-auto block" />
                    )}
                    {slides.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={() => setSlideIndex(i => (i - 1 + slides.length) % slides.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-100 opacity-80"
                          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                        >
                          <ChevronLeft className="w-4 h-4" style={{ color: '#1D1D1F' }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setSlideIndex(i => (i + 1) % slides.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-opacity hover:opacity-100 opacity-80"
                          style={{ backgroundColor: 'rgba(255,255,255,0.9)' }}
                        >
                          <ChevronRight className="w-4 h-4" style={{ color: '#1D1D1F' }} />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Feed de Instagram adicional */}
                  {event.socialFeed && event.socialFeed.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1.5" style={{ color: '#1D1D1F66' }}>
                        <Sparkles className="w-3.5 h-3.5" style={{ color: '#2563EB' }} />
                        Publicaciones
                      </h3>
                      <div className="grid grid-cols-3 gap-1.5">
                        {event.socialFeed.slice(0, 6).map((post, i) => (
                          post.media_url ? (
                            <a
                              key={i}
                              href={post.permalink || '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => { if (isAuthenticated) adminApi.trackInstagramClick(event?.id).catch(() => {}); }}
                              className="block aspect-square rounded-lg overflow-hidden"
                              style={{ border: '1px solid #E4EBFA' }}
                            >
                              <SocialPostMedia post={post} className="w-full h-full object-cover" />
                            </a>
                          ) : null
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ubicación + Compartir */}
        {(event.locationName || event.address || event.city) && (
          <div className="mt-4 flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <span className="text-sm" style={{ color: '#1D1D1F99' }}>
                {[event.locationName, event.address, event.city].filter(Boolean).join(', ')}
              </span>
            </div>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-all cursor-pointer"
              style={{ backgroundColor: '#2563EB' }}
            >
              {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              {copied ? '¡Copiado!' : 'Compartir'}
            </button>
          </div>
        )}

        {/* Mapa placeholder */}
        <div className="mt-4 rounded-2xl p-16 text-center" style={{ border: '1px solid #E4EBFA', backgroundColor: '#FFFFFF' }}>
          <div className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center" style={{ backgroundColor: '#E4EBFA' }}>
            <MapPin className="w-6 h-6" style={{ color: '#2563EB' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: '#1D1D1F' }}>Mapa de ubicación</p>
          <p className="text-xs" style={{ color: '#1D1D1F66' }}>
            {event.locationName ? `Agregar aquí mapa del ${event.locationName}` : 'Mapa no disponible'}
          </p>
        </div>

      </div>
    </div>
  );
}
