'use client';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '../context/AuthContext';
import { eventsApi, socialApi, attendeesApi, mediaApi } from '../api';
import { clearCache } from '../api/eventsCache';
import { ImagePicker } from '../features/media/ImagePicker';
import { CreateBusinessPage } from '../features/business/CreateBusinessPage';
import type { Event, SocialPost } from '../types';
import {
  Camera,
  RefreshCw,
  X,
  Clock,
  PauseCircle,
  PlayCircle,
  Trash2,
  Edit3,
  CalendarRange,
  Check,
  Upload,
} from 'lucide-react';
import { SocialPostMedia } from '../features/social/SocialPostMedia';
import { Pagination } from '../components/ui/Pagination';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { COMUNAS } from '../constants/comunas';

type Tab = 'myevents' | 'registered' | 'instagram' | 'upload';

export default function CreateEventPage() {
  const { isAuthenticated, user, setUser } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = usePersistentState<Tab>('ui:event:tab', 'instagram');
  const [myEvents, setMyEvents] = useState<Event[]>([]);
  const [, setRegisteredEvents] = useState<Event[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<SocialPost[]>([]);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postPage, setPostPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<SocialPost | null>(null);
  const [pubTitle, setPubTitle] = usePersistentState('draft:event:pubTitle', '');
  const [pubSubtitle, setPubSubtitle] = usePersistentState('draft:event:pubSubtitle', '');
  const [pubDesc, setPubDesc] = usePersistentState('draft:event:pubDesc', '');
  const [pubDate, setPubDate] = usePersistentState('draft:event:pubDate', '');
  const [pubTime, setPubTime] = usePersistentState('draft:event:pubTime', '');
  const [pubStartDate, setPubStartDate] = usePersistentState('draft:event:pubStartDate', '');
  const [pubEndDate, setPubEndDate] = usePersistentState('draft:event:pubEndDate', '');
  const [pubCategory, setPubCategory] = usePersistentState('draft:event:pubCategory', '');
  const [pubComuna, setPubComuna] = usePersistentState('draft:event:pubComuna', '');
  const [pubFree, setPubFree] = usePersistentState('draft:event:pubFree', true);
  const [pubPrice, setPubPrice] = usePersistentState('draft:event:pubPrice', '');
  const [publishing, setPublishing] = useState(false);
  const [pubError, setPubError] = useState('');
  const [pubSuccess, setPubSuccess] = useState(false);
  // Imagen propia (sin Instagram): archivo subido o URL, y enlace opcional de publicación
  const [manualMode, setManualMode] = usePersistentState('ui:event:manualMode', false);
  const [manualImageUrl, setManualImageUrl] = usePersistentState('draft:event:manualImageUrl', '');
  const [manualError, setManualError] = useState('');
  const hasImage = !!selectedPost || manualMode;

  const updateInstagramStatus = useCallback(({ data }: { data: { instagram: boolean } }) => {
    setInstagramConnected(data.instagram);
  }, []);

  const loadUser = useCallback(() => {
    eventsApi.getByOwner()
      .then((eventsRes) => setMyEvents(eventsRes.data))
      .catch(() => undefined);
    attendeesApi.findByUser()
      .then((attendeesRes) => setRegisteredEvents(attendeesRes.data?.map((a: { event: Event }) => a.event) || []))
      .catch(() => undefined);
    socialApi.getStatus()
      .then(updateInstagramStatus)
      .catch(() => undefined);
  }, [updateInstagramStatus]);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    loadUser();
  }, [isAuthenticated, navigate, loadUser]);

  const handleInstagramLink = async () => {
    try {
      const { data } = await socialApi.getInstagramAuthUrl();
      const w = 600, h = 700;
      const x = window.screenX + (window.innerWidth - w) / 2;
      const y = window.screenY + (window.innerHeight - h) / 2;
      window.open(data.url, 'instagram-auth', `width=${w},height=${h},left=${x},top=${y},popup=1`);
    } catch { /* noop */ }
  };

  useEffect(() => {
    if (tab !== 'instagram') return;
    setLoadingPosts(true);
    socialApi.getUserMedia().then(({ data }) => setInstagramPosts(data)).catch(() => undefined).finally(() => setLoadingPosts(false));
  }, [tab]);

  const POST_PAGE_SIZE = 4;

  const filteredPosts = instagramPosts
    .filter((p) => !!p.media_url)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const postTotalPages = Math.ceil(filteredPosts.length / POST_PAGE_SIZE);
  const visiblePosts = filteredPosts.slice((postPage - 1) * POST_PAGE_SIZE, postPage * POST_PAGE_SIZE);

  const activePublications = myEvents.filter(e => e.imageUrl);

  const tabs: { key: Tab; label: string; icon: typeof Camera; count?: number }[] = [
    { key: 'instagram', label: 'Vincula Instagram', icon: CalendarRange },
    { key: 'upload', label: 'Crear publicación', icon: Upload },
    { key: 'registered', label: 'Publicaciones activas', icon: PlayCircle, count: activePublications.length },
  ];

  const handlePublishEvent = async () => {
    if (!hasImage || !pubTitle.trim() || !pubDate || !pubTime || !pubComuna || !pubCategory || !pubStartDate || !pubEndDate) {
      setPubError('Completa todos los campos obligatorios');
      return;
    }
    if (!selectedPost && !manualImageUrl.trim()) {
      setPubError('Sube una imagen para la publicación');
      return;
    }
    setPublishing(true);
    setPubError('');
    try {
      const description = [pubSubtitle.trim(), pubDesc.trim()].filter(Boolean).join('\n') || selectedPost?.caption || pubTitle;
      const { data: created } = await eventsApi.create({
        title: pubTitle.trim(),
        description,
        date: new Date(`${pubDate}T${pubTime}`).toISOString(),
        publicationStartDate: new Date(pubStartDate).toISOString(),
        publicationEndDate: new Date(pubEndDate).toISOString(),
        categoryName: pubCategory,
        imageUrl: selectedPost ? selectedPost.media_url || undefined : manualImageUrl.trim() || undefined,
        instagramMediaId: selectedPost?.id || undefined,
        city: pubComuna,
        isOnline: false,
        address: !pubFree && pubPrice ? pubPrice : undefined,
      });
      clearCache();
      setManualMode(false);
      setManualImageUrl('');
      setSelectedPost(null);
      setPubTitle('');
      setPubSubtitle('');
      setPubDesc('');
      setPubDate('');
      setPubTime('');
      setPubStartDate('');
      setPubEndDate('');
      setPubCategory('');
      setPubComuna('');
      setPubFree(true);
      setPubPrice('');
      setPubSuccess(true);
      loadUser();
      socialApi.getUserMedia().then(({ data }) => setInstagramPosts(data)).catch(() => {});
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } } };
      const msg = axiosErr?.response?.data?.message;
      setPubError(Array.isArray(msg) ? msg.join(', ') : (msg || 'Error al publicar el evento'));
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#FFFFFF' }}>

      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-6">
        <p style={{ fontSize: '28px', fontWeight: 700, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '36px' }}>
          Publica desde Instagram en un par de clics.
        </p>
        <p className="mt-2" style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif" }}>
          Conecta tu cuenta, elige una publicación y conviértela en un evento visible para toda la comunidad de La Araucanía.
        </p>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="flex gap-1">
          {tabs.map(({ key, label, icon: Icon, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setTab(key);
                // Pestaña "Subir imagen": imagen propia, sin publicación de Instagram
                setManualMode(key === 'upload');
                setSelectedPost(null);
              }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all cursor-pointer"
              style={
                tab === key
                  ? { backgroundColor: '#EFF6FF', color: '#2563EB', borderRadius: '12px 12px 0 0', borderBottom: '2px solid #2563EB' }
                  : { color: '#1D1D1F99', backgroundColor: 'transparent' }
              }
              >
                <Icon className="w-4 h-4" />
                {label}
                {count !== undefined && count > 0 && (
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={
                      tab === key
                        ? { backgroundColor: '#DBEAFE', color: '#2563EB' }
                        : { backgroundColor: '#E4EBFA', color: '#1D1D1F66' }
                    }
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="flex justify-end">
            {user && (
              <CreateBusinessPage user={user} onUpdated={(patch) => setUser({ ...user, ...patch })} />
            )}
          </div>
      </div>

      {/* Tab: Programar evento */}
      {(tab === 'instagram' || tab === 'upload') && (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">

          {tab === 'instagram' && (
            <div className="flex justify-end mb-3">
              <button
              type="button"
              onClick={() => {
                setLoadingPosts(true);
                socialApi.getUserMedia()
                  .then(({ data }) => setInstagramPosts(data))
                  .catch(() => {})
                  .finally(() => setLoadingPosts(false));
              }}
              disabled={loadingPosts}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer"
              style={{ backgroundColor: '#EFF6FF', color: '#2563EB', border: '1px solid #DBEAFE' }}
            >
              <RefreshCw className={`w-4 h-4 ${loadingPosts ? 'animate-spin' : ''}`} />
                Actualizar
            </button>
            </div>
          )}

          {/* Paso 1: Seleccionar publicación (solo en la pestaña de Instagram) */}
          <div className={`rounded-2xl p-6 mb-6 ${tab === 'upload' ? 'hidden' : ''}`} style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)' }}>
                <Camera className="w-5 h-5 text-white" />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 400, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif" }}>
                <strong>Paso 1:</strong> Selecciona la publicación que quieres convertir en evento, haciendo clic sobre la imagen y continúa en paso 2.
              </p>
            </div>

            {loadingPosts ? (
              <div className="flex items-center justify-center py-10">
                <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#2563EB', borderTopColor: 'transparent' }} />
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="text-center py-10">
                <Camera className="w-12 h-12 mx-auto mb-4" style={{ color: '#1D1D1F33' }} />
                <p className="text-sm" style={{ color: '#1D1D1F99' }}>Aún no hay publicaciones en Instagram</p>
                {!instagramConnected && (
                  <button type="button" onClick={handleInstagramLink} className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl text-white text-sm font-medium cursor-pointer hover:opacity-90" style={{ backgroundColor: '#2563EB' }}>
                    Vincular Instagram
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {visiblePosts.map((post) => (
                    <button
                      key={post.id}
                      type="button"
                      onClick={() => {
                        setSelectedPost(post);
                        setPubTitle(post.caption?.slice(0, 45) || '');
                      }}
                      className="relative rounded-xl overflow-hidden cursor-pointer transition-all hover:opacity-90"
                      style={{ border: selectedPost?.id === post.id ? '3px solid #2563EB' : '3px solid transparent', aspectRatio: '4/5' }}
                    >
                      <SocialPostMedia post={post} className="w-full h-full object-cover" />
                      {selectedPost?.id === post.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2563EB' }}>
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
                <Pagination currentPage={postPage} totalPages={postTotalPages} onPageChange={setPostPage} />
              </>
            )}
          </div>

          {/* Crear publicación: paso 2 en dos columnas (datos a la izquierda, imagen y vista previa a la derecha) */}
          {hasImage && (
            <section className="rounded-2xl p-6 mb-6 bg-white" style={{ border: '1px solid #E4EBFA' }} aria-labelledby="paso-2-titulo">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <div>
                  <h2 id="paso-2-titulo" className="text-lg font-semibold" style={{ color: '#1D1D1F' }}>Paso 2 · Publicar evento</h2>
                  <p className="text-sm" style={{ color: '#1D1D1F99' }}>Completa los detalles del evento. Cuando todo esté listo, podrás publicarlo.</p>
                </div>
                <ol className="flex items-center gap-2 text-xs" aria-label="Progreso">
                  <li style={{ color: '#1D1D1F99' }}>1. Imagen</li>
                  <li aria-hidden="true" style={{ color: '#1D1D1F66' }}>—</li>
                  <li aria-current="step" className="font-semibold" style={{ color: '#2563EB' }}>2. Publicar evento</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Información básica</legend>
                    <div>
                      <label htmlFor="evt-titulo" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Título *</label>
                      <input id="evt-titulo" type="text" value={pubTitle} onChange={(e) => setPubTitle(e.target.value.slice(0, 45))} placeholder="Título del evento" aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      <p className="text-right text-[10px] mt-0.5" style={{ color: pubTitle.length >= 45 ? '#DC2626' : '#1D1D1F66' }}>{pubTitle.length}/45</p>
                    </div>
                    <div>
                      <label htmlFor="evt-subtitulo" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Subtítulo</label>
                      <input id="evt-subtitulo" type="text" value={pubSubtitle} onChange={(e) => setPubSubtitle(e.target.value.slice(0, 50))} placeholder="Subtítulo (opcional)" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      <p className="text-right text-[10px] mt-0.5" style={{ color: pubSubtitle.length >= 50 ? '#DC2626' : '#1D1D1F66' }}>{pubSubtitle.length}/50</p>
                    </div>
                    <div>
                      <label htmlFor="evt-descripcion" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Descripción</label>
                      <textarea id="evt-descripcion" value={pubDesc} onChange={(e) => setPubDesc(e.target.value.slice(0, 172))} placeholder="Describe tu evento: qué se va a realizar, para quién es y toda la información importante." rows={4} className="w-full px-3 py-2.5 rounded-xl text-sm light-form resize-none" />
                      <p className="text-right text-[10px] mt-0.5" style={{ color: pubDesc.length >= 172 ? '#DC2626' : '#1D1D1F66' }}>{pubDesc.length}/172</p>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Fecha y lugar</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="evt-fecha" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Fecha *</label>
                        <input id="evt-fecha" type="date" value={pubDate} onChange={(e) => setPubDate(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      </div>
                      <div>
                        <label htmlFor="evt-hora" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Hora *</label>
                        <input id="evt-hora" type="time" value={pubTime} onChange={(e) => setPubTime(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      </div>
                      <div>
                        <label htmlFor="evt-comuna" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Lugar (comuna) *</label>
                        <select id="evt-comuna" value={pubComuna} onChange={(e) => setPubComuna(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form">
                          <option value="">Selecciona</option>
                          {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-4">
                    <legend className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Publicación y categoría</legend>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label htmlFor="evt-pub-inicio" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Visible desde *</label>
                        <input id="evt-pub-inicio" type="date" value={pubStartDate} onChange={(e) => setPubStartDate(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      </div>
                      <div>
                        <label htmlFor="evt-pub-fin" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Visible hasta *</label>
                        <input id="evt-pub-fin" type="date" value={pubEndDate} onChange={(e) => setPubEndDate(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      </div>
                      <div>
                        <label htmlFor="evt-categoria" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Categoría *</label>
                        <select id="evt-categoria" value={pubCategory} onChange={(e) => setPubCategory(e.target.value)} aria-required="true" className="w-full px-3 py-2.5 rounded-xl text-sm light-form">
                          <option value="">Selecciona</option>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                  </fieldset>

                  <fieldset className="space-y-3">
                    <legend className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Entradas</legend>
                    <label className="flex items-center gap-2 text-sm cursor-pointer" style={{ color: '#1D1D1F' }}>
                      <input type="checkbox" checked={pubFree} onChange={(e) => setPubFree(e.target.checked)} className="w-4 h-4 rounded" />
                      El evento es gratuito
                    </label>
                    {!pubFree && (
                      <div>
                        <label htmlFor="evt-precio" className="block text-xs mb-1" style={{ color: '#1D1D1F' }}>Precio o condición de entrada</label>
                        <input id="evt-precio" type="text" value={pubPrice} onChange={(e) => setPubPrice(e.target.value)} placeholder="Ej: $5.000 / adhesión voluntaria" className="w-full px-3 py-2.5 rounded-xl text-sm light-form" />
                      </div>
                    )}
                  </fieldset>
                </div>

                <div className="space-y-6">
                  <section aria-labelledby="imagen-evento-titulo">
                    <h3 id="imagen-evento-titulo" className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Imagen del evento</h3>
                    <p className="text-xs mb-3" style={{ color: '#1D1D1F99' }}>Sube una imagen que represente tu evento.</p>
                    {selectedPost ? (
                      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
                        <SocialPostMedia post={selectedPost} className="w-full h-auto" />
                      </div>
                    ) : (
                      <ImagePicker label="Imagen de la publicación" value={manualImageUrl || null} onChange={(url) => { setManualImageUrl(url); setManualError(''); }} onUpload={async (f) => (await mediaApi.uploadTemp(f)).data.url} />
                    )}
                    {manualError && <p role="alert" className="text-xs mt-1" style={{ color: '#DC2626' }}>{manualError}</p>}
                  </section>

                  <section aria-labelledby="vista-previa-titulo">
                    <h3 id="vista-previa-titulo" className="text-sm font-semibold mb-1" style={{ color: '#1D1D1F' }}>Vista previa de la publicación</h3>
                    <p className="text-xs mb-3" style={{ color: '#1D1D1F99' }}>Así se verá tu evento en la plataforma.</p>
                    <article className="rounded-2xl overflow-hidden bg-white" style={{ border: '1px solid #E4EBFA' }}>
                      <div className="w-full aspect-[4/3] bg-slate-100 flex items-center justify-center">
                        {(selectedPost?.media_url || manualImageUrl) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={selectedPost?.media_url || manualImageUrl} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="p-4 space-y-1">
                        <p className="text-xs" style={{ color: '#1D1D1F99' }}>
                          {pubDate ? format(new Date(`${pubDate}T${pubTime || '00:00'}`), "d 'de' MMM yyyy · HH:mm", { locale: es }) : 'Fecha y hora'}
                        </p>
                        <p className="font-semibold" style={{ color: '#1D1D1F' }}>{pubTitle || 'Título del evento'}</p>
                        {pubSubtitle && <p className="text-sm" style={{ color: '#1D1D1F99' }}>{pubSubtitle}</p>}
                        {pubDesc && <p className="text-sm line-clamp-3" style={{ color: '#1D1D1F' }}>{pubDesc}</p>}
                        {pubCategory && <span className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#2563EB' }}>{pubCategory}</span>}
                      </div>
                    </article>
                  </section>
                </div>
              </div>

              {pubError && <p role="alert" className="text-sm mt-6" style={{ color: '#DC2626' }}>{pubError}</p>}
              {pubSuccess && <p role="status" className="text-sm mt-6" style={{ color: '#16A34A' }}>Evento publicado con éxito, puedes revisarlo en Publicaciones activas.</p>}

              <div className="flex justify-between gap-3 mt-8 pt-6" style={{ borderTop: '1px solid #E4EBFA' }}>
                <button
                  type="button"
                  onClick={() => { if (selectedPost) { setSelectedPost(null); } else { setTab('instagram'); setManualMode(false); setManualImageUrl(''); } setPubError(''); }}
                  className="px-5 py-2.5 rounded-xl text-sm cursor-pointer"
                  style={{ color: '#1D1D1F99', border: '1px solid #E4EBFA' }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handlePublishEvent}
                  disabled={publishing}
                  className="px-6 py-2.5 rounded-xl text-sm font-medium text-white cursor-pointer disabled:opacity-50"
                  style={{ backgroundColor: '#2563EB' }}
                >
                  {publishing ? 'Publicando...' : 'Publicar evento'}
                </button>
              </div>
            </section>
          )}
        </div>
      )}

      {/* Tab: Publicaciones activas */}
      {tab === 'registered' && (
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-20">
          {activePublications.length === 0 ? (
            <div className="rounded-2xl p-16 text-center border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ backgroundColor: '#E4EBFA' }}>
                <PlayCircle className="w-8 h-8" style={{ color: '#2563EB' }} />
              </div>
              <p className="text-sm" style={{ color: '#1D1D1F99' }}>No hay publicaciones activas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activePublications.map((event) => {
                const now = new Date();
                const endDate = event.publicationEndDate ? new Date(event.publicationEndDate) : null;
                const isActive = !endDate || endDate >= now;
                return (
                  <PublishedEventCard key={`${event.id}-${event.title}-${event.description}`} event={event} isActive={isActive} onUpdate={loadUser} />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modal éxito publicación */}
      {pubSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setPubSuccess(false)} />
          <div className="relative flex items-center gap-4 rounded-2xl px-8 py-5 shadow-xl" style={{ backgroundColor: '#FFFFFF' }}>
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: '#16A34A' }}>
              <Check className="w-6 h-6 text-white" />
            </div>
            <p className="whitespace-nowrap" style={{ fontSize: '14px', fontWeight: 500, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", lineHeight: '16px' }}>
              Evento publicado con éxito, puedes revisarlo en <span style={{ fontWeight: 600 }}>Publicaciones activas</span>.
            </p>
            <button type="button" onClick={() => setPubSuccess(false)} className="p-1 cursor-pointer hover:opacity-70 shrink-0" style={{ color: '#1D1D1F99' }}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const CATEGORIES = ['Música', 'Cultura', 'Gastronomía', 'Turismo', 'Trekking', 'Deportes', 'Ferias', 'Bienestar', 'Fiestas', 'Documental'];

function parseDescParts(desc: string) {
  const idx = desc.indexOf('\n');
  if (idx === -1) return { subtitle: '', descText: desc };
  return { subtitle: desc.slice(0, idx).trim(), descText: desc.slice(idx + 1).trim() };
}

function PublishedEventCard({ event, isActive, onUpdate }: { event: Event; isActive: boolean; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const parts = parseDescParts(event.description || '');
  const [title, setTitle] = useState(event.title);
  const [subtitle] = useState(parts.subtitle);
  const [descText, setDescText] = useState(parts.descText);
  const [eventDate, setEventDate] = useState(format(new Date(event.date), 'yyyy-MM-dd'));
  const [eventTime, setEventTime] = useState(format(new Date(event.date), 'HH:mm'));
  const [comuna, setComuna] = useState(event.city || '');
  const [tipo, setTipo] = useState(event.address && event.address.startsWith('http') ? 'compra' : 'gratis');
  const [category, setCategory] = useState(event.category?.name || '');
  const [startDate, setStartDate] = useState(
    event.publicationStartDate ? format(new Date(event.publicationStartDate), "yyyy-MM-dd'T'HH:mm") : ''
  );
  const [endDate, setEndDate] = useState(
    event.publicationEndDate ? format(new Date(event.publicationEndDate), "yyyy-MM-dd'T'HH:mm") : ''
  );

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const description = [subtitle.trim(), descText.trim()].filter(Boolean).join('\n') || event.description;
      await eventsApi.update(event.id, {
        title: title.trim(),
        description,
        date: new Date(`${eventDate}T${eventTime}`).toISOString(),
        city: comuna,
        categoryName: category || undefined,
        publicationStartDate: startDate ? new Date(startDate).toISOString() : undefined,
        publicationEndDate: endDate ? new Date(endDate).toISOString() : undefined,
      });
      setEditing(false);
      clearCache();
      onUpdate();
    } catch { /* noop */ } finally { setLoading(false); }
  };

  // Reanudar: vuelve a publicar la misma publicación (sin abrir el formulario de edición).
  const handleResume = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const startsInFuture = event.publicationStartDate && new Date(event.publicationStartDate) > now;
      await eventsApi.update(event.id, {
        publicationEndDate: null,
        ...(startsInFuture ? { publicationStartDate: now.toISOString() } : {}),
      });
      clearCache();
      onUpdate();
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await eventsApi.update(event.id, { publicationEndDate: new Date().toISOString() });
      clearCache();
      onUpdate();
    } catch { /* noop */ } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm('¿Eliminar esta publicación de la web?')) return;
    setLoading(true);
    try {
      await eventsApi.delete(event.id);
      clearCache();
      onUpdate();
    } catch { /* noop */ } finally { setLoading(false); }
  };

  if (editing) {
    return (
      <div className="rounded-2xl border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
        {/* Header con info del evento + botones */}
        <div className="flex items-center gap-3 p-4" style={{ borderBottom: '1px solid #E4EBFA' }}>
          <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden">
            {event.imageUrl && <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: '#1D1D1F' }}>{event.title}</p>
            <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: isActive ? '#16A34A' : '#DC2626' }}>
              <Clock className="w-3 h-3" />
              {isActive ? 'Publicado' : 'Detenido'}
            </div>
            <p className="text-[11px] mt-0.5" style={{ color: '#1D1D1F66' }}>
              {event.publicationStartDate ? format(new Date(event.publicationStartDate), "d MMM HH:mm", { locale: es }) : '—'}
              {' → '}
              {event.publicationEndDate ? format(new Date(event.publicationEndDate), "d MMM HH:mm", { locale: es }) : '—'}
            </p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button type="button" onClick={() => setEditing(true)} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#2563EB' }}><Edit3 className="w-3.5 h-3.5" /></button>
            {isActive ? (
              <button type="button" onClick={handleStop} disabled={loading} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#DC2626' }}><PauseCircle className="w-3.5 h-3.5" /></button>
            ) : (
              <button type="button" onClick={handleResume} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#16A34A' }}><PlayCircle className="w-3.5 h-3.5" /></button>
            )}
            <button type="button" onClick={handleDelete} disabled={loading} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#DC2626' }}><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Formulario expandido */}
        <div className="p-6">
          <p style={{ fontSize: '20px', fontWeight: 600, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '4px' }}>Detalles del evento</p>
          <p style={{ fontSize: '13px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '20px' }}>Completa o ajusta la información extraída desde tu publicación.</p>

          <div className="flex gap-6">
            <div className="flex-1 space-y-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#1D1D1F99' }}>Título</p>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value.slice(0, 45))} className="w-full px-3 py-2 rounded-xl text-sm light-form" />
                <p className="text-right text-[10px] mt-0.5" style={{ color: title.length >= 45 ? '#DC2626' : '#1D1D1F66' }}>{title.length}/45</p>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: '#1D1D1F99' }}>Descripción</p>
                <textarea value={descText} onChange={(e) => setDescText(e.target.value.slice(0, 300))} placeholder="Descripción del evento" rows={6} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
                <p className="text-right text-[10px] mt-0.5" style={{ color: descText.length >= 300 ? '#DC2626' : '#1D1D1F66' }}>{descText.length}/300</p>
              </div>
            </div>
            <div className="hidden sm:block w-48 shrink-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-2 text-center" style={{ color: '#1D1D1F99' }}>Publicación seleccionada</p>
              {event.imageUrl && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid #E4EBFA' }}>
                  <img src={event.imageUrl} alt="" className="w-full h-auto" />
                </div>
              )}
            </div>
          </div>

          {/* Datos del evento */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #E4EBFA' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#1D1D1F' }}>Datos del evento</p>
            <div className="flex gap-4 mb-6">
              <div style={{ width: '130px', flexShrink: 0 }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1D1D1F99' }}>Fecha evento</p>
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs light-form" />
              </div>
              <div style={{ width: '100px', flexShrink: 0 }}>
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1D1D1F99' }}>Hora evento</p>
                <input type="time" value={eventTime} onChange={(e) => setEventTime(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs light-form" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1D1D1F99' }}>Período de publicación</p>
                <div className="flex items-center rounded-xl overflow-hidden w-full light-form" style={{ border: '1px solid #E4EBFA' }}>
                  <input type={startDate ? 'datetime-local' : 'text'} value={startDate} placeholder="Desde" onFocus={(e) => { e.currentTarget.type = 'datetime-local'; }} onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }} onChange={(e) => setStartDate(e.target.value)} className="flex-1 px-2 py-2.5 text-xs bg-transparent border-none outline-none" />
                  <span className="text-xs px-1" style={{ color: '#1D1D1F66' }}>→</span>
                  <input type={endDate ? 'datetime-local' : 'text'} value={endDate} placeholder="Hasta" onFocus={(e) => { e.currentTarget.type = 'datetime-local'; }} onBlur={(e) => { if (!e.currentTarget.value) e.currentTarget.type = 'text'; }} onChange={(e) => setEndDate(e.target.value)} className="flex-1 px-2 py-2.5 text-xs bg-transparent border-none outline-none" />
                  <CalendarRange className="w-4 h-4 mr-2 shrink-0" style={{ color: '#1D1D1F66' }} />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1D1D1F99' }}>Categoría</p>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs light-form">
                  <option value="" disabled>Seleccione</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#1D1D1F99' }}>Comuna</p>
                <select value={comuna} onChange={(e) => setComuna(e.target.value)} className="w-full px-3 py-2.5 rounded-xl text-xs light-form">
                  <option value="" disabled>Todas las comunas</option>
                  {COMUNAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div style={{ flexShrink: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '8px' }}>ESTE EVENTO ES GRATUITO</p>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={tipo === 'gratis'} onChange={(e) => setTipo(e.target.checked ? 'gratis' : 'compra')} className="w-5 h-5 rounded" style={{ accentColor: '#2563EB' }} />
                  <span style={{ fontSize: '13px', fontWeight: 400, color: '#1D1D1F99', fontFamily: "'Raleway', system-ui, sans-serif" }}>Marca si la entrada no tiene costo.</span>
                </label>
              </div>
              <div style={{ width: '280px', flexShrink: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#1D1D1F', fontFamily: "'Raleway', system-ui, sans-serif", marginBottom: '8px' }}>$ VALOR DE ENTRADA</p>
                <input type="text" value={tipo === 'gratis' ? '' : (comuna || '')} onChange={() => {}} placeholder="Ej: $5.000 / adhesión voluntaria" disabled={tipo === 'gratis'} className="w-full px-4 py-3 rounded-xl text-sm light-form disabled:opacity-40" />
              </div>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={loading}
                className="px-10 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50 shrink-0 mt-7"
                style={{ backgroundColor: '#2563EB' }}
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl p-3 flex items-center gap-3 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
      <div className="w-14 h-14 shrink-0 rounded-lg overflow-hidden">
        {event.imageUrl && <img src={event.imageUrl} alt="" className="w-full h-full object-cover" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate" style={{ color: '#1D1D1F' }}>{event.title}</p>
        <div className="flex items-center gap-2 text-xs mt-0.5" style={{ color: isActive ? '#16A34A' : '#DC2626' }}>
          <Clock className="w-3 h-3" />
          {isActive ? 'Publicado' : 'Detenido'}
        </div>
        <p className="text-[11px] mt-0.5" style={{ color: '#1D1D1F66' }}>
          {event.publicationStartDate ? format(new Date(event.publicationStartDate), "d MMM HH:mm", { locale: es }) : '—'}
          {' → '}
          {event.publicationEndDate ? format(new Date(event.publicationEndDate), "d MMM HH:mm", { locale: es }) : '—'}
        </p>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button type="button" onClick={() => setEditing(true)} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#2563EB' }} title="Editar">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
        {isActive ? (
          <button type="button" onClick={handleStop} disabled={loading} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#DC2626' }} title="Detener">
            <PauseCircle className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button type="button" onClick={handleResume} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#16A34A' }} title="Reanudar">
            <PlayCircle className="w-3.5 h-3.5" />
          </button>
        )}
        <button type="button" onClick={handleDelete} disabled={loading} className="p-1.5 rounded-lg border cursor-pointer" style={{ borderColor: '#E4EBFA', color: '#DC2626' }} title="Eliminar">
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
