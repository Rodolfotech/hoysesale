'use client';

import { useState } from 'react';
import { Calendar, Clock, Tag, Send, ExternalLink, MapPin, Ticket, Type, AlignLeft } from 'lucide-react';
import { SocialPostMedia } from './SocialPostMedia';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { eventsApi } from '../../api';
import { clearCache } from '../../api/eventsCache';
import type { SocialPost } from '../../types';
import { COMUNAS } from '../../constants/comunas';

type EventType = '' | 'gratis' | 'compra' | 'cupo';

interface InstagramPostPublisherProps {
  post: SocialPost;
  onPublished?: () => void;
}

export function InstagramPostPublisher({ post, onPublished }: InstagramPostPublisherProps) {
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [comuna, setComuna] = useState('');
  const [tipo, setTipo] = useState<EventType>('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [descriptionText, setDescriptionText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imageError, setImageError] = useState(false);

  if (imageError) return null;

  const handlePublish = async () => {
    if (!title.trim()) { setError('El título es obligatorio'); return; }
    if (!eventDate) { setError('La fecha del evento es obligatoria'); return; }
    if (!eventTime) { setError('La hora del evento es obligatoria'); return; }
    if (!comuna) { setError('La comuna es obligatoria'); return; }
    if (!tipo) { setError('El tipo de evento es obligatorio'); return; }
    if (!startDate) { setError('La fecha de inicio de publicación es obligatoria'); return; }
    if (!endDate) { setError('La fecha de término de publicación es obligatoria'); return; }
    if (!category) { setError('La categoría es obligatoria'); return; }
    setLoading(true);
    setError('');
    const description = [subtitle.trim(), descriptionText.trim()].filter(Boolean).join('\n') || post.caption || title;
    try {
      const eventDateTime = new Date(`${eventDate}T${eventTime}`).toISOString();
      await eventsApi.create({
        title: title.trim(),
        description,
        date: eventDateTime,
        publicationStartDate: new Date(startDate).toISOString(),
        publicationEndDate: new Date(endDate).toISOString(),
        categoryName: category || undefined,
        imageUrl: post.media_url || undefined,
        instagramMediaId: post.id || undefined,
        city: comuna,
        isOnline: false,
        address: tipo === 'compra' && ticketUrl ? ticketUrl : undefined,
      });
      setSuccess(true);
      clearCache();
      onPublished?.();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al publicar el evento'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="rounded-xl p-4 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
        <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center" style={{ backgroundColor: '#DCFCE7' }}>
          <Send className="w-5 h-5" style={{ color: '#16A34A' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: '#16A34A' }}>Evento publicado</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
      {post.media_url && (
        <SocialPostMedia
          post={post}
          className="w-full h-auto block"
          onImageError={() => setImageError(true)}
        />
      )}
      <div className="p-4 space-y-3">
        {post.caption && (
          <p className="text-sm line-clamp-2" style={{ color: '#1D1D1F99' }}>{post.caption}</p>
        )}
        <div className="flex items-center justify-between text-xs" style={{ color: '#1D1D1F66' }}>
          <span>{format(new Date(post.timestamp), "dd MMM yyyy", { locale: es })}</span>
          {post.permalink && (
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:underline"
              style={{ color: '#2563EB' }}
            >
              <ExternalLink className="w-3 h-3" />
              Instagram
            </a>
          )}
        </div>

        {/* Título */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#1D1D1F99' }}>Título</p>
          <div className="flex items-start gap-2">
            <Type className="w-4 h-4 shrink-0 mt-1.5" style={{ color: '#2563EB' }} />
            <div className="flex-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, 45))}
                placeholder="Título del evento"
                className="w-full px-3 py-1.5 rounded-lg text-xs light-form"
              />
              <p className="text-right text-[10px] mt-0.5" style={{ color: title.length >= 45 ? '#DC2626' : '#1D1D1F66' }}>
                {title.length}/45
              </p>
            </div>
          </div>
        </div>

        {/* Descripción */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#1D1D1F99' }}>Descripción</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <AlignLeft className="w-4 h-4 shrink-0 mt-1.5" style={{ color: '#2563EB' }} />
              <div className="flex-1">
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value.slice(0, 50))}
                  placeholder="Subtítulo"
                  rows={4}
                  className="w-full px-3 py-1.5 rounded-lg text-xs light-form resize-none overflow-hidden"
                />
                <p className="text-right text-[10px] mt-0.5" style={{ color: subtitle.length >= 50 ? '#DC2626' : '#1D1D1F66' }}>
                  {subtitle.length}/50
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <AlignLeft className="w-4 h-4 shrink-0 mt-1.5" style={{ color: '#2563EB' }} />
              <div className="flex-1">
                <textarea
                  value={descriptionText}
                  onChange={(e) => setDescriptionText(e.target.value.slice(0, 172))}
                  placeholder="Texto de descripción"
                  rows={10}
                  className="w-full px-3 py-1.5 rounded-lg text-xs light-form resize-none overflow-hidden"
                />
                <p className="text-right text-[10px] mt-0.5" style={{ color: descriptionText.length >= 172 ? '#DC2626' : '#1D1D1F66' }}>
                  {descriptionText.length}/172
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Datos del evento */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#1D1D1F99' }}>Datos del evento</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
                placeholder="Fecha del evento"
              />
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              />
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <select
                value={comuna}
                onChange={(e) => setComuna(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              >
                <option value="" disabled>Selecciona una comuna</option>
                {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Ticket className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <select
                value={tipo}
                onChange={(e) => { setTipo(e.target.value as EventType); setTicketUrl(''); }}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              >
                <option value="" disabled>Selecciona un tipo</option>
                <option value="gratis">Gratis</option>
                <option value="compra">Compra tu entrada</option>
                <option value="cupo">Asegura tu cupo</option>
              </select>
            </div>
            {tipo === 'compra' && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
                <input
                  type="url"
                  value={ticketUrl}
                  onChange={(e) => setTicketUrl(e.target.value)}
                  placeholder="URL de compra de entradas"
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
                />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              >
                <option value="" disabled>Selecciona una categoría</option>
                <option value="Música">Música</option>
                <option value="Cultura">Cultura</option>
                <option value="Gastronomía">Gastronomía</option>
                <option value="Turismo">Turismo</option>
                <option value="Trekking">Trekking</option>
                <option value="Deportes">Deportes</option>
                <option value="Ferias">Ferias</option>
                <option value="Bienestar">Bienestar</option>
                <option value="Fiestas">Fiestas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Período de publicación */}
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider mb-2" style={{ color: '#1D1D1F99' }}>Período de publicación</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg text-xs light-form"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="text-xs" style={{ color: '#DC2626' }}>{error}</p>
        )}

        <button
          type="button"
          onClick={handlePublish}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-white text-xs font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
          style={{ backgroundColor: '#2563EB' }}
        >
          <Send className="w-3.5 h-3.5" />
          {loading ? 'Publicando...' : 'Publicar'}
        </button>
      </div>
    </div>
  );
}
