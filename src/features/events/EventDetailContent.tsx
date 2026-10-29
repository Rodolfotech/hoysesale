'use client';

import { useState, useEffect } from 'react';
import { eventsApi, adminApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import type { Event } from '../../types';
import {
  Calendar,
  Clock,
  MapPin,
  Globe,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  User,
  Ticket,
} from 'lucide-react';
import { SocialPostMedia } from '../social/SocialPostMedia';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Paleta cromática del proyecto
const C = {
  dark:    '#1D1D1F',
  blue:    '#2563EB',
  neutral2: '#E4EBFA',
} as const;

// Estilos tipográficos según SPEC.md
const T = {
  label: { fontFamily: "'Raleway', system-ui, sans-serif", fontSize: '14px', fontWeight: 500, color: C.dark, lineHeight: '16px' } as React.CSSProperties,
  value: { fontFamily: "'Raleway', system-ui, sans-serif", fontSize: '14px', fontWeight: 400, color: C.dark, lineHeight: '16px' } as React.CSSProperties,
  title: { fontFamily: "'Raleway', system-ui, sans-serif", fontSize: '20px', fontWeight: 700, color: C.dark, lineHeight: '28px' } as React.CSSProperties,
  descTitle: { fontFamily: "'Raleway', system-ui, sans-serif", fontSize: '18px', fontWeight: 600, color: C.dark, lineHeight: '28px', wordBreak: 'break-word' } as React.CSSProperties,
  descBody: { fontFamily: "'Raleway', system-ui, sans-serif", fontSize: '18px', fontWeight: 400, color: C.dark, lineHeight: '28px', wordBreak: 'break-word', overflowWrap: 'break-word' } as React.CSSProperties,
} as const;

function InstagramIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function parseDescription(description: string) {
  const fullDesc = description.trim();
  const newlineIdx = fullDesc.indexOf('\n');
  if (newlineIdx === -1) return { title: '', body: fullDesc };
  return {
    title: fullDesc.slice(0, newlineIdx).trim(),
    body: fullDesc.slice(newlineIdx + 1).trim(),
  };
}

interface Props {
  slug: string;
  initialEvent?: Event;
}

export function EventDetailContent({ slug, initialEvent }: Props) {
  const { isAuthenticated } = useAuth();
  const [event, setEvent] = useState<Event | null>(initialEvent ?? null);
  const [loading, setLoading] = useState(!initialEvent);
  const [copied, setCopied] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  useEffect(() => {
    if (!initialEvent) {
      eventsApi.getBySlug(slug).then(({ data }) => {
        setEvent(data);
        setLoading(false);
      });
    }
  }, [slug, initialEvent]);

  const handleShare = async () => {
    const url = `${window.location.origin}/categorias/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: C.blue, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!event) return null;

  const priceFromAddress = event.address && !event.address.startsWith('http') ? event.address : null;
  const isFree = !event.price && !priceFromAddress;
  const slides = [
    ...(event.imageUrl ? [{ type: 'image' as const, url: event.imageUrl }] : []),
    ...((event.socialFeed || []).filter(p => p.media_url).map(p => ({ type: 'post' as const, post: p }))),
  ];
  const currentSlide = slides[slideIndex] ?? null;
  const { title: descTitle, body: descBody } = parseDescription(event.description || '');
  const locationParts = [event.locationName, priceFromAddress ? undefined : event.address, event.city].filter(Boolean);
  const location = locationParts.join(', ');

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6">

      {/* ── Sección superior: 2 columnas ── */}
      <div className="flex flex-col md:flex-row gap-8">

        {/* Columna izquierda — info */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {event.category && (
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#EFF6FF', color: C.blue }}>
                {event.category.name}
              </span>
            )}
            {isFree ? (
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#DCFCE7', color: '#16A34A' }}>
                Gratis
              </span>
            ) : (
              <span className="text-xs font-medium px-3 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#D97706' }}>
                Evento de pago
              </span>
            )}
            {event.isOnline && (
              <span className="flex items-center gap-1 text-xs px-3 py-1 rounded-full" style={{ backgroundColor: '#FEF9C3', color: '#CA8A04' }}>
                <Globe className="w-3 h-3" /> Online
              </span>
            )}
          </div>

          {/* Título */}
          <p style={T.title}>{event.title}</p>

          {/* Fecha + Hora en 2 columnas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
              <div>
                <p style={T.label}>Fecha</p>
                <p className="mt-0.5 capitalize" style={T.value}>
                  {format(new Date(event.date), "EEEE d 'De' MMMM, yyyy", { locale: es })}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
              <div>
                <p style={T.label}>Hora</p>
                <p className="mt-0.5" style={T.value}>{format(new Date(event.date), 'HH:mm')} hrs</p>
              </div>
            </div>
          </div>

          {/* Organizador + Entrada */}
          <div className="grid grid-cols-2 gap-4">
            {event.owner?.name && (
              <div className="flex items-start gap-2.5">
                <User className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
                <div>
                  <p style={T.label}>Organizador</p>
                  <p className="mt-0.5" style={T.value}>
                    {event.owner.name}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-2.5">
              <Ticket className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
              <div>
                <p style={T.label}>Entrada</p>
                <p className="mt-0.5" style={T.value}>
                  {isFree
                    ? 'Entrada Liberada'
                    : priceFromAddress
                      ? (isNaN(Number(priceFromAddress)) ? priceFromAddress : `$${Number(priceFromAddress).toLocaleString('es-CL')}`)
                      : (event.price ? `$${event.price.toLocaleString('es-CL')}` : 'Evento de pago')}
                </p>
              </div>
            </div>
          </div>

          {/* Instagram */}
          <div className="flex items-start gap-2.5">
            <InstagramIcon className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
            <div>
              <p style={T.label}>Instagram</p>
              {(() => {
                const ig = event.owner?.companyInstagram || event.owner?.instagramUsername;
                const handle = ig?.replace(/^@/, '');
                return handle ? (
                  <a
                    href={`https://www.instagram.com/${handle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => { if (isAuthenticated) adminApi.trackInstagramClick(event?.id).catch(() => {}); }}
                    className="mt-0.5 hover:underline inline-block"
                    style={{ ...T.value, color: C.blue }}
                  >
                    @{handle}
                  </a>
                ) : (
                  <p className="mt-0.5" style={T.value}>No disponible</p>
                );
              })()}
            </div>
          </div>

          {/* Divisor */}
          <div style={{ borderTop: `1px solid ${C.neutral2}` }} />

          {/* Descripción */}
          <div>
            <p style={{ ...T.label, marginBottom: '8px' }}>Descripción</p>
            {descTitle && <p style={{ ...T.descTitle, display: 'block', marginBottom: '4px' }}>{descTitle}</p>}
            {descBody && <p style={{ ...T.descBody, display: 'block' }}>{descBody}</p>}
          </div>

        </div>

        {/* Columna derecha — imagen / carousel */}
        {slides.length > 0 && (
          <div className="md:w-72 lg:w-80 shrink-0">
            <div className="relative rounded-xl overflow-hidden select-none" style={{ border: `1px solid ${C.neutral2}` }}>
              {currentSlide?.type === 'image' && currentSlide.url && (
                <img src={currentSlide.url} alt={event.title} className="w-full h-auto block" draggable={false} />
              )}
              {currentSlide?.type === 'post' && currentSlide.post && (
                <SocialPostMedia post={currentSlide.post} className="w-full h-auto block" />
              )}
              {slides.length > 1 && (
                <>
                  <button
                    type="button"
                    aria-label="Anterior"
                    onClick={() => setSlideIndex(i => (i - 1 + slides.length) % slides.length)}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                  >
                    <ChevronLeft className="w-5 h-5" style={{ color: C.dark }} />
                  </button>
                  <button
                    type="button"
                    aria-label="Siguiente"
                    onClick={() => setSlideIndex(i => (i + 1) % slides.length)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer shadow-md"
                    style={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                  >
                    <ChevronRight className="w-5 h-5" style={{ color: C.dark }} />
                  </button>
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                    {slides.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        aria-label={`Imagen ${i + 1}`}
                        onClick={() => setSlideIndex(i)}
                        className="w-1.5 h-1.5 rounded-full cursor-pointer transition-opacity"
                        style={{ backgroundColor: '#FFFFFF', opacity: i === slideIndex ? 1 : 0.5 }}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Ubicación + Compartir ── */}
      <div className="flex items-center justify-between gap-4 pt-4" style={{ borderTop: `1px solid ${C.neutral2}` }}>
        <div className="flex items-start gap-2.5 min-w-0">
          <MapPin className="w-4 h-4 shrink-0 mt-0.5" style={{ color: C.blue }} />
          <div className="min-w-0">
            <p style={T.label}>Ubicación</p>
            <p className="mt-0.5 truncate" style={T.value}>{location || 'No especificada'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer shrink-0"
          style={{ backgroundColor: C.blue }}
        >
          {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
          {copied ? '¡Copiado!' : 'Compartir'}
        </button>
      </div>

      {/* ── Mapa placeholder full-width ── */}
      <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.neutral2}`, backgroundColor: '#F1F5F9' }}>
        <div className="rounded-xl m-3 py-10 text-center" style={{ border: '1.5px dashed #CBD5E1', backgroundColor: '#FFFFFF' }}>
          <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            <MapPin className="w-5 h-5" style={{ color: C.blue }} />
          </div>
          <p className="text-sm font-medium" style={{ color: C.dark }}>Mapa de ubicación</p>
          <p className="text-xs mt-1" style={{ color: '#1D1D1F99' }}>
            {event.locationName ? `Agregar aquí mapa del ${event.locationName}` : 'Mapa no disponible'}
          </p>
        </div>
      </div>

    </div>
  );
}
