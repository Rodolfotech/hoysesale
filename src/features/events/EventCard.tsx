'use client';

import { Link } from '@/lib/router';
import { Calendar, MapPin, Globe, Users, Camera } from 'lucide-react';
import type { Event } from '../../types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
  event: Event;
  featured?: boolean;
}

export default function EventCard({ event, featured }: Props) {
  if (event.imageUrl) {
    return (
      <Link to={`/categorias/${event.slug}`} className="block rounded-xl overflow-hidden">
        <img
          src={event.imageUrl}
          alt={event.title}
          className="w-full h-auto block hover:scale-105 transition-transform duration-300"
        />
      </Link>
    );
  }

  return (
    <Link
      to={`/categorias/${event.slug}`}
      className={`group block relative overflow-hidden rounded-2xl border transition-all duration-300 hover:shadow-md ${
        featured ? 'shadow-sm' : ''
      }`}
      style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB33'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E4EBFA'; }}
    >
      <div className="relative p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            {event.category && (
              <span
                className="inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ backgroundColor: '#E4EBFA', color: '#2563EB' }}
              >
                {event.category.name}
              </span>
            )}
            <h3
              className={`font-semibold tracking-tight leading-snug ${featured ? 'text-xl' : 'text-base'}`}
              style={{ color: '#1D1D1F' }}
            >
              {event.title}
            </h3>
          </div>
          {event.isOnline && (
            <Globe className="w-4 h-4 shrink-0 ml-2" style={{ color: '#2563EB' }} />
          )}
        </div>

        <p className={`mb-4 line-clamp-2 ${featured ? 'text-base' : 'text-sm'}`} style={{ color: '#1D1D1F99' }}>
          {event.description}
        </p>

        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" style={{ color: '#9CA3AF' }} />
            <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '16px', color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>{format(new Date(event.date), "d 'de' MMMM, yyyy • HH:mm", { locale: es })}</span>
          </div>
          {event.locationName && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: '#9CA3AF' }} />
              <span style={{ fontSize: '14px', fontWeight: 500, lineHeight: '16px', color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>{event.locationName}{event.city ? `, ${event.city}` : ''}</span>
            </div>
          )}
        </div>

        {event.socialFeed && event.socialFeed.length > 0 && (
          <div className="mt-3 flex gap-1 overflow-x-auto">
            {event.socialFeed.slice(0, 3).map((post, i) => (
              <div key={i} className="w-14 h-14 rounded-lg overflow-hidden shrink-0" style={{ backgroundColor: '#F8FAFC' }}>
                {post.media_url ? (
                  <img src={post.media_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-4 h-4" style={{ color: '#2563EB66' }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: '#E4EBFA' }}>
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: '#2563EB' }}
            >
              {event.owner?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs" style={{ color: '#1D1D1F66' }}>{event.owner?.name}</span>
          </div>
          <div className="flex items-center gap-2">
            {event.socialFeed && event.socialFeed.length > 0 && (
              <span className="flex items-center gap-1 text-xs" style={{ color: '#2563EB' }}>
                <Camera className="w-3 h-3" />
                {event.socialFeed.length}
              </span>
            )}
            {event.attendees && (
              <div className="flex items-center gap-1 text-xs" style={{ color: '#1D1D1F66' }}>
                <Users className="w-3 h-3" />
                {event.attendees.length}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
