'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { formatEntryPrice, parseEntryPrice } from '@/lib/event-price';
import { EventDetailModal } from '../events/EventDetailModal';
import { FeaturedEventCard } from '../events/FeaturedEventCard';
import type { Event } from '../../types';
import { Link } from '@/lib/router';
import { BUSINESS_DAYS } from '@/constants/business';
import {
  ENTRY_TYPE_LABELS, OUTING_RANGES, inOutingRange,
  type HomeEvent, type HomeExperience, type HomeNews, type OutingRange,
} from '@/lib/home';

const TZ = 'America/Santiago';
const fmt = (date: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('es-CL', { timeZone: TZ, ...options }).format(new Date(date));
const clp = (n: number) => `$${n.toLocaleString('es-CL')}`;

// El valor de entrada se guarda en address ("$80.000"); sin valor, el evento es gratis (igual que FeaturedEventCard).
// Si el tipo de entrada es Cover o Consumo mínimo, se muestra junto al valor.
function entryInfo(e: HomeEvent): { free: boolean; text: string } {
  const price = formatEntryPrice(parseEntryPrice(e.address));
  const kind = e.entryType && e.entryType !== 'GRATIS' ? ENTRY_TYPE_LABELS[e.entryType] : null;
  if (!price && !kind) return { free: true, text: 'Gratis' };
  return { free: false, text: [kind, price].filter(Boolean).join(' · ') };
}

// Colores para los eventos sin imagen (se elige uno fijo por evento).
const SWATCHES = [
  { bg: '#1E3A8A', text: '#BFDBFE' }, { bg: '#065F46', text: '#A7F3D0' }, { bg: '#7C2D12', text: '#FED7AA' },
  { bg: '#9A3412', text: '#FDE68A' }, { bg: '#581C87', text: '#E9D5FF' }, { bg: '#134E4A', text: '#99F6E4' },
];
const swatch = (id: string) => SWATCHES[[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % SWATCHES.length];

const headingStyle = { fontSize: 'clamp(28px, 4vw, 40px)', lineHeight: 1.1, fontWeight: 800, letterSpacing: '-0.02em', color: '#111827' };

function SectionHeader({ badge, badgeColor, title, subtitle, aside }: { badge: string; badgeColor: { bg: string; text: string }; title: string; subtitle: string; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
      <div>
        <span className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2" style={{ backgroundColor: badgeColor.bg, color: badgeColor.text }}>{badge}</span>
        <h2 style={headingStyle}>{title}</h2>
        <p className="mt-1 text-base" style={{ color: '#4B5563' }}>{subtitle}</p>
      </div>
      {aside}
    </div>
  );
}

function MoreButton({ open, onClick, label }: { open: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" aria-expanded={open} onClick={onClick} className="text-base font-semibold hover:underline cursor-pointer" style={{ color: '#111827' }}>
      {open ? 'Ver menos ↑' : `${label} →`}
    </button>
  );
}

// ---- Hoy se sale ----

export function OutingsSection({ events }: { events: HomeEvent[] }) {
  const byRange = Object.fromEntries(OUTING_RANGES.map(({ id }) => [id, events.filter((e) => inOutingRange(e.date, id))])) as Record<OutingRange, HomeEvent[]>;
  const [range, setRange] = useState<OutingRange>(() => OUTING_RANGES.find(({ id }) => byRange[id].length > 0)?.id ?? 'hoy');
  const tabsRef = useRef<HTMLDivElement>(null);
  // En celular las pestañas se desplazan: la elegida queda a la vista.
  useEffect(() => {
    const list = tabsRef.current;
    const tab = list?.querySelector<HTMLElement>('[aria-selected="true"]');
    if (list && tab) list.scrollLeft = tab.offsetLeft - list.clientWidth / 2 + tab.clientWidth / 2;
  }, [range]);
  const [all, setAll] = useState(false);
  if (events.length === 0) return null;
  const list = byRange[range];

  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <SectionHeader
        badge="Eventos" badgeColor={{ bg: '#EFF6FF', text: '#1D4ED8' }} title="Hoy se sale" subtitle="Conciertos, ferias y panoramas con fecha"
        aside={
          <div ref={tabsRef} role="tablist" aria-label="Fecha" className="relative flex max-w-full overflow-x-auto rounded-xl p-1" style={{ backgroundColor: '#F3F4F6' }}>
            {OUTING_RANGES.map(({ id, label }) => (
              <button key={id} type="button" role="tab" aria-selected={range === id} onClick={() => { setRange(id); setAll(false); }}
                className={`shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm cursor-pointer ${range === id ? 'bg-white shadow-sm font-semibold' : ''}`}
                style={{ color: range === id ? '#1D4ED8' : '#374151' }}>
                {label}
              </button>
            ))}
          </div>
        }
      />
      {list.length === 0
        ? <p className="py-10 text-center" style={{ color: '#6B7280' }}>No hay eventos publicados para estas fechas.</p>
        : <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-start">{(all ? list : list.slice(0, 4)).map((e) => <FeaturedEventCard key={e.id} event={e as unknown as Event} />)}</div>}
      {list.length > 4 && <div className="text-center mt-8"><MoreButton open={all} onClick={() => setAll((v) => !v)} label="Ver cartelera completa" /></div>}
    </section>
  );
}

// Avisos para la visita (¡Te esperamos!, Sin reserva…) que marca el local al publicar.
function VisitNotes({ notes }: { notes: string[] }) {
  if (notes.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {notes.map((note) => <li key={note} className="rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>{note}</li>)}
    </ul>
  );
}

// ---- Experiencias todo el año ----

const DAY_INITIALS = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

function ExperienceCard({ event, onOpen }: { event: HomeExperience; onOpen: () => void }) {
  const entry = entryInfo(event);
  return (
    <article className="rounded-2xl border overflow-hidden flex flex-col bg-white" style={{ borderColor: '#E5E7EB' }}>
      <div className="relative aspect-[2/1] overflow-hidden" style={{ backgroundColor: swatch(event.id).bg }}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover" />
          : <span aria-hidden className="absolute left-5 bottom-4 right-5 truncate uppercase" style={{ color: swatch(event.id).text, fontSize: '34px', fontWeight: 800, letterSpacing: '-0.02em' }}>{event.title.split(' ')[0]}</span>}
        {event.category && <span className="absolute top-3 left-3 rounded-full bg-white px-2.5 py-0.5 text-xs font-semibold" style={{ color: '#047857' }}>{event.category.name}</span>}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="leading-snug" style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>{event.title}</h3>
        <p className="mt-1 text-sm" style={{ color: '#4B5563' }}>{[event.owner.name, event.owner.comuna ?? event.city].filter(Boolean).join(' · ')}</p>
        {event.openDays.length > 0 && (
          <ul aria-label="Días de atención" className="mt-3 flex gap-1.5">
            {BUSINESS_DAYS.map((day, i) => {
              const on = event.openDays.includes(day);
              return (
                <li key={day} title={`${day}: ${on ? 'atiende' : 'no atiende'}`} className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold"
                  style={on ? { backgroundColor: '#047857', color: '#FFFFFF' } : { backgroundColor: '#F3F4F6', color: '#9CA3AF' }}>
                  <span aria-hidden>{DAY_INITIALS[i]}</span><span className="sr-only">{day} {on ? 'atiende' : 'no atiende'}</span>
                </li>
              );
            })}
          </ul>
        )}
        {event.publicationEndDate && <p className="mt-3 text-sm" style={{ color: '#374151' }}>Disponible hasta el {fmt(event.publicationEndDate, { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        <VisitNotes notes={event.notes} />
        <div className="mt-auto pt-4 flex items-end justify-between gap-2">
          {entry.free
            ? <span className="rounded-full px-2.5 py-0.5 text-sm font-semibold" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>Gratis</span>
            : <span className="text-base font-bold" style={{ color: '#111827' }}>{entry.text}</span>}
          <button type="button" onClick={onOpen} className="rounded-lg px-5 py-2.5 text-sm font-semibold text-white cursor-pointer hover:opacity-90" style={{ backgroundColor: '#047857' }}>Ver detalle</button>
        </div>
      </div>
    </article>
  );
}

export function ExperiencesSection({ events }: { events: HomeExperience[] }) {
  const [open, setOpen] = useState<string | null>(null);
  const [all, setAll] = useState(false);
  if (events.length === 0) return null;
  return (
    <section style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        <SectionHeader
          badge="Actividades" badgeColor={{ bg: '#ECFDF5', text: '#047857' }} title="Experiencias todo el año" subtitle="Tours, termas y rutas de las empresas de turismo"
          aside={events.length > 3 ? <MoreButton open={all} onClick={() => setAll((v) => !v)} label="Ver todas las actividades" /> : undefined}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(all ? events : events.slice(0, 3)).map((e) => <ExperienceCard key={e.id} event={e} onOpen={() => setOpen(e.slug)} />)}
        </div>
      </div>
      {open && <EventDetailModal slug={open} onClose={() => setOpen(null)} />}
    </section>
  );
}

// ---- Lo nuevo en la región ----

const AVATAR_COLORS = ['#7C3AED', '#C2410C', '#0F766E', '#BE123C', '#1D4ED8', '#047857'];
// "Café de la Plaza" → CP: se saltan las palabras en minúscula.
const initials = (name: string) => {
  const words = name.split(/\s+/).filter((w) => /^[\p{L}\d]/u.test(w));
  const main = words.filter((w) => /^[\p{Lu}\d]/u.test(w));
  return (main.length > 0 ? main : words).slice(0, 2).map((w) => w[0].toUpperCase()).join('');
};

function ago(date: string, now: number): string {
  const minutes = Math.max(0, Math.round((now - new Date(date).getTime()) / 60000));
  if (minutes < 60) return minutes <= 1 ? 'recién' : `hace ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'ayer';
  if (days < 30) return `hace ${days} días`;
  return fmt(date, { day: 'numeric', month: 'short' });
}

function NewsCard({ item, index, now }: { item: HomeNews; index: number; now: number }) {
  const { business } = item;
  const [open, setOpen] = useState(false);
  const content = (
    <>
        <div className="flex items-center gap-3 mb-3">
          {business.logoUrl
            ? <img src={business.logoUrl} alt="" className="w-10 h-10 rounded-full object-cover" />
            : <span aria-hidden className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white" style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>{initials(business.name)}</span>}
          <div className="min-w-0">
            <p className="font-semibold truncate" style={{ color: '#111827' }}>{business.name}</p>
            <p className="text-xs" style={{ color: '#6B7280' }}>{[business.comuna, ago(item.createdAt, now)].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
        <div className="relative aspect-square rounded-2xl overflow-hidden" style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}>
          {item.imageUrl
            ? <img src={item.imageUrl} alt="" loading="lazy" decoding="async" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-transform" />
            : <span aria-hidden className="absolute inset-0 flex items-center justify-center text-white/80" style={{ fontSize: '56px', fontWeight: 800 }}>{initials(business.name)}</span>}
          {item.price !== null && <span className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white" style={{ backgroundColor: '#111827CC' }}>{clp(item.price)}</span>}
        </div>
        <p className="mt-3 font-semibold" style={{ color: '#111827' }}>{item.title}</p>
        {item.description && <p className="mt-1 text-sm line-clamp-2" style={{ color: '#4B5563' }}>{item.description}</p>}
        <VisitNotes notes={item.notes} />
    </>
  );
  // Una novedad abre su detalle; un producto o servicio lleva al micro-sitio del local.
  return (
    <article>
      {item.eventSlug
        ? <button type="button" onClick={() => setOpen(true)} className="group block w-full text-left cursor-pointer">{content}</button>
        : <Link to={`/${business.slug}`} className="group block">{content}</Link>}
      {open && item.eventSlug && <EventDetailModal slug={item.eventSlug} onClose={() => setOpen(false)} />}
    </article>
  );
}

export function NewsSection({ items }: { items: HomeNews[] }) {
  const [all, setAll] = useState(false);
  const [now] = useState(() => Date.now());
  if (items.length === 0) return null;
  return (
    <section className="max-w-7xl mx-auto px-4 py-12">
      <SectionHeader
        badge="Novedades" badgeColor={{ bg: '#F5F3FF', text: '#6D28D9' }} title="Lo nuevo en la región" subtitle="Lo último que publican los locales, cafés y comercios"
        aside={items.length > 4 ? <MoreButton open={all} onClick={() => setAll((v) => !v)} label="Ver más novedades" /> : undefined}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {(all ? items : items.slice(0, 4)).map((item, i) => <NewsCard key={item.id} item={item} index={i} now={now} />)}
      </div>
    </section>
  );
}
