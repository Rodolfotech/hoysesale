'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from '@/lib/router';
import { eventsApi } from '../api';
import EventCard from '../features/events/EventCard';
import type { Event } from '../types';
import { COMUNAS } from '../constants/comunas';
import { Pagination } from '../components/ui/Pagination';
import { Calendar, Search, MapPin, ChevronRight, MapPinned } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const ITEMS_PER_PAGE = 12;

function groupByMonth(events: Event[]) {
  const groups: Record<string, Event[]> = {};
  for (const event of events) {
    const key = format(new Date(event.date), 'yyyy-MM');
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
}


export default function Events() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedComuna, setSelectedComuna] = useState(
    searchParams.get('ciudad') || searchParams.get('comuna') || ''
  );
  const [dateFrom, setDateFrom] = useState(
    searchParams.get('fecha') || searchParams.get('dateFrom') || ''
  );
  const [dateTo, setDateTo] = useState(
    searchParams.get('fecha') || searchParams.get('dateTo') || ''
  );
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('categoriaId') || '');
  const selectedCategoryName = searchParams.get('categoria') || '';
  const [showGratis, setShowGratis] = useState(searchParams.get('gratis') === 'true');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const defaultDateFrom = useMemo(() => {
    if (dateFrom || dateTo) return '';
    const now = new Date();
    return format(new Date(now.getFullYear(), now.getMonth(), 1), 'yyyy-MM-dd');
  }, [dateFrom, dateTo]);

  const defaultDateTo = useMemo(() => {
    if (dateFrom || dateTo) return '';
    const now = new Date();
    return format(new Date(now.getFullYear(), now.getMonth() + 1, 0), 'yyyy-MM-dd');
  }, [dateFrom, dateTo]);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: ITEMS_PER_PAGE };
    if (dateFrom) params.dateFrom = dateFrom;
    else if (defaultDateFrom) params.dateFrom = defaultDateFrom;
    if (dateTo) params.dateTo = dateTo;
    else if (defaultDateTo) params.dateTo = defaultDateTo;
    if (selectedCategory) params.categoryId = selectedCategory;
    if (selectedComuna) params.city = selectedComuna;
    eventsApi.getAll(params).then(({ data: { data, total } }) => {
      setEvents(data);
      setTotal(total);
      setLoading(false);
    });
  }, [page, dateFrom, dateTo, defaultDateFrom, defaultDateTo, selectedCategory, selectedComuna, showGratis]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (selectedComuna) {
      params.set('comuna', selectedComuna);
    } else {
      params.delete('comuna');
    }
    setSearchParams(params, { replace: true });
  }, [selectedComuna]);

  const filtered = useMemo(() => {
    let result = events;
    if (search) {
      result = result.filter((e) =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (showGratis) {
      result = result.filter((e) => {
        const priceFromAddr = e.address && !e.address.startsWith('http') ? e.address : null;
        return !e.price && !priceFromAddr;
      });
    }
    if (selectedCategoryName) {
      result = result.filter((e) =>
        e.category?.name?.toLowerCase() === selectedCategoryName.toLowerCase()
      );
    }
    return result;
  }, [events, search, showGratis, selectedCategoryName]);

  const months = useMemo(() => groupByMonth(filtered), [filtered]);
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  const handleComunaChange = (comuna: string) => {
    setSelectedComuna(comuna);
    setPage(1);
  };

  const clearFilters = () => {
    setSelectedComuna('');
    setDateFrom('');
    setDateTo('');
    setSelectedCategory('');
    setSearch('');
    setShowGratis(false);
    setPage(1);
  };

  const hasFilters = selectedComuna || dateFrom || dateTo || selectedCategory || showGratis;

  return (
    <div className="min-h-screen pt-16" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 pt-12 pb-12">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight" style={{ color: "#1D1D1F" }}>
                {selectedComuna || 'Región de La Araucanía'}
              </h1>
              <p className="mt-1 flex items-center gap-1.5" style={{ color: '#1D1D1F99' }}>
                <MapPinned className="w-4 h-4" style={{ color: '#2563EB' }} />
                {loading
                  ? 'Cargando...'
                  : selectedComuna
                    ? `${total} evento${total !== 1 ? 's' : ''} encontrado${total !== 1 ? 's' : ''}`
                    : `${total} evento${total !== 1 ? 's' : ''} este mes`
                }
              </p>
            </div>
          </div>

          {/* Search + Comuna */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1 max-w-md" role="search">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Buscar eventos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Buscar eventos por título o descripción"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm light-form"
              />
            </div>
            <div className="relative sm:w-64">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              <select
                value={selectedComuna}
                onChange={(e) => handleComunaChange(e.target.value)}
                aria-label="Filtrar por comuna"
                className="w-full pl-10 pr-8 py-2.5 rounded-xl text-sm appearance-none cursor-pointer light-form"
              >
                <option value="">Todas las comunas</option>
                {COMUNAS.map((comuna) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
              <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none rotate-90" />
            </div>
          </div>

          {/* Advanced filters */}
          <details className="mb-8 group">
            <summary className="text-sm cursor-pointer list-none flex items-center gap-2" style={{ color: '#1D1D1F99' }}>
              <span className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ borderColor: '#E4EBFA' }}>
                <span className="w-2 h-0.5 transition-all" style={{ backgroundColor: '#2563EB' }} />
              </span>
              Filtros avanzados
              {hasFilters && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: '#2563EB' }} />}
            </summary>
            <div className="rounded-2xl p-6 mt-4 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium" style={{ color: '#1D1D1F' }}>Filtros</h3>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="text-xs hover:underline cursor-pointer" style={{ color: '#2563EB' }}>
                    Limpiar filtros
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="dateFrom" className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Fecha desde</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input id="dateFrom" type="date" value={dateFrom}
                      onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm light-form" />
                  </div>
                </div>
                <div>
                  <label htmlFor="dateTo" className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Fecha hasta</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <input id="dateTo" type="date" value={dateTo}
                      onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm light-form" />
                  </div>
                </div>
                <div>
                  <label htmlFor="comuna" className="block text-xs mb-1" style={{ color: '#1D1D1F99' }}>Comuna</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    <select id="comuna" value={selectedComuna}
                      onChange={(e) => handleComunaChange(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-xl text-sm appearance-none cursor-pointer light-form">
                      <option value="">Todas las comunas</option>
                      {COMUNAS.map((comuna) => (
                        <option key={comuna} value={comuna}>{comuna}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </details>

          {/* Results */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-2xl p-6 animate-pulse border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
                  <div className="h-4 rounded w-3/4 mb-4" style={{ backgroundColor: '#E4EBFA' }} />
                  <div className="h-3 rounded w-full mb-2" style={{ backgroundColor: '#E4EBFA' }} />
                  <div className="h-3 rounded w-2/3 mb-4" style={{ backgroundColor: '#E4EBFA' }} />
                  <div className="h-3 rounded w-1/2" style={{ backgroundColor: '#E4EBFA' }} />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Calendar className="w-12 h-12 mx-auto mb-4" style={{ color: '#E4EBFA' }} />
              <p style={{ color: '#1D1D1F99' }}>
                {selectedComuna
                  ? `No hay eventos publicados en ${selectedComuna} aún`
                  : 'No hay eventos publicados este mes'}
              </p>
              <button onClick={clearFilters}
                className="mt-4 text-sm hover:underline cursor-pointer" style={{ color: '#2563EB' }}>
                Limpiar filtros
              </button>
            </div>
          ) : (
            <>
              {months.map(([monthKey, monthEvents]) => {
                const [year, month] = monthKey.split('-');
                const date = new Date(Number(year), Number(month) - 1);
                const monthName = format(date, 'MMMM yyyy', { locale: es });
                return (
                  <section key={monthKey} className="mb-10" aria-labelledby={`month-${monthKey}`}>
                    <h2 id={`month-${monthKey}`} className="text-lg font-bold mb-4 capitalize flex items-center gap-2" style={{ color: '#1D1D1F' }}>
                      <Calendar className="w-5 h-5" style={{ color: '#2563EB' }} />
                      {monthName}
                      <span className="text-sm font-normal" style={{ color: '#1D1D1F66' }}>({monthEvents.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {monthEvents.map((event) => (
                        <EventCard key={event.id} event={event} />
                      ))}
                    </div>
                  </section>
                );
              })}
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
