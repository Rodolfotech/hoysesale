'use client';

import { useState } from 'react';
import { Search, Calendar, ChevronDown } from 'lucide-react';
import { COMUNAS } from '../../constants/comunas';
import { format, nextSaturday, nextSunday, isSaturday, isSunday, addDays } from 'date-fns';

const CATEGORIAS = ['Música', 'Cultura', 'Gastronomía', 'Turismo', 'Trekking', 'Deportes', 'Ferias', 'Bienestar', 'Fiestas'];

export interface EventSearchParams {
  q?: string;
  fecha?: string;
  categoria?: string;
  ciudad?: string;
  gratis?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

interface Props {
  onSearch: (params: EventSearchParams) => void;
  className?: string;
}

function getWeekendRange() {
  const today = new Date();
  const sat = isSaturday(today) ? today : nextSaturday(today);
  const sun = isSunday(today) ? today : nextSunday(addDays(sat, 0));
  return { from: format(sat, 'yyyy-MM-dd'), to: format(sun, 'yyyy-MM-dd') };
}

export function EventSearchForm({ onSearch, className = '' }: Props) {
  const [q, setQ] = useState('');
  const [fecha, setFecha] = useState('');
  const [categoria, setCategoria] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [activeQuick, setActiveQuick] = useState<'gratis' | 'hoy' | 'findesemana' | null>(null);

  const handleSearch = () => {
    setActiveQuick(null);
    onSearch({ q, fecha, categoria, ciudad });
  };

  const handleQuick = (type: 'gratis' | 'hoy' | 'findesemana') => {
    setActiveQuick(type);
    if (type === 'gratis') {
      onSearch({ gratis: true });
    } else if (type === 'hoy') {
      const today = format(new Date(), 'yyyy-MM-dd');
      onSearch({ fecha: today });
    } else {
      const { from, to } = getWeekendRange();
      onSearch({ dateFrom: from, dateTo: to });
    }
  };

  return (
    <div className={`light-form bg-white rounded-2xl shadow-xl p-6 ${className}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] gap-3 mb-4 mt-6">
        {/* Buscar evento */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Buscar evento
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="¿Qué buscas?"
              className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm placeholder-gray-400 focus:outline-none"
            />
          </div>
        </div>

        {/* Fecha */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Fecha
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border rounded-xl text-sm focus:outline-none"
            />
          </div>
        </div>

        {/* Categorías */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Categorías
          </label>
          <div className="relative">
            <select
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm appearance-none focus:outline-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {CATEGORIAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Comuna */}
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Comuna
          </label>
          <div className="relative">
            <select
              value={ciudad}
              onChange={(e) => setCiudad(e.target.value)}
              className="w-full pl-3 pr-8 py-2.5 border rounded-xl text-sm appearance-none focus:outline-none cursor-pointer"
            >
              <option value="">Todas las comunas</option>
              {COMUNAS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Buscar */}
        <div className="flex items-end">
          <button
            type="button"
            onClick={handleSearch}
            className="w-full px-6 py-2.5 rounded-xl text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
            style={{ backgroundColor: '#2563EB' }}
          >
            Buscar →
          </button>
        </div>
      </div>

      {/* Filtros rápidos */}
      <div className="flex items-center gap-2 flex-wrap mt-12">
        {(
          [
            { key: 'gratis', label: 'Gratis' },
            { key: 'hoy', label: 'Hoy' },
            { key: 'findesemana', label: 'Este Fin de Semana' },
          ] as const
        ).map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => handleQuick(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all cursor-pointer ${
              activeQuick === key
                ? 'bg-brand-blue text-white border-brand-blue'
                : 'text-brand-blue border-brand-blue hover:bg-brand-blue hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
