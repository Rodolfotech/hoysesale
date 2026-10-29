'use client';

import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { eventsApi, categoriesApi } from '../../api';
import type { Category } from '../../types';
import { COMUNAS } from '../../constants/comunas';
import { Sparkles, Calendar, MapPin, Globe, Image, Send } from 'lucide-react';
import { format } from 'date-fns';

interface CreateEventFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  showHeader?: boolean;
}

export default function CreateEventForm({ onSuccess, onCancel, showHeader = true }: CreateEventFormProps) {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    locationName: '',
    address: '',
    city: '',
    isOnline: false,
    imageUrl: '',
    categoryId: '',
  });

  useEffect(() => {
    categoriesApi.getAll().then(({ data }) => setCategories(data));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await eventsApi.create(form);
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/events/${data.slug}`);
      }
    } catch {
      setError('Error al crear el evento');
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = { color: '#1D1D1F', fontSize: '14px', fontWeight: 500 };
  const iconStyle = { color: '#2563EB' };

  return (
    <div>
      {showHeader && (
        <div className="text-center mb-10">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: '#2563EB' }}
          >
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: '#1D1D1F' }}>
            Publicar Evento
          </h1>
          <p className="mt-2 text-sm" style={{ color: '#1D1D1F99' }}>
            Comparte tu evento con la comunidad
          </p>
        </div>
      )}

      <div className="rounded-2xl p-8 border" style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA' }}>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Título del Evento
            </label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
              placeholder="Ej: Concierto de Rock en Pucón"
              required
            />
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Descripción
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl text-sm resize-none light-form"
              placeholder="Describe tu evento, artistas, actividades..."
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" style={iconStyle} />
                  Fecha y Hora
                </div>
              </label>
              <input
                type="datetime-local"
                name="date"
                value={form.date}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
                required
              />
            </div>

            <div>
              <label className="block mb-1.5" style={labelStyle}>
                Categoría
              </label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={iconStyle} />
                  Lugar
                </div>
              </label>
              <input
                type="text"
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
                placeholder="Ej: Teatro Municipal"
              />
            </div>

            <div>
              <label htmlFor="comuna" className="block mb-1.5" style={labelStyle}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" style={iconStyle} />
                  Comuna
                </div>
              </label>
              <select
                id="comuna"
                name="city"
                value={form.city}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
              >
                <option value="">Selecciona una comuna</option>
                {COMUNAS.map((comuna) => (
                  <option key={comuna} value={comuna}>{comuna}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-1.5" style={labelStyle}>
              Dirección
            </label>
            <input
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
              placeholder="Dirección del evento"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1.5" style={labelStyle}>
                <div className="flex items-center gap-2">
                  <Image className="w-4 h-4" style={iconStyle} />
                  URL de Imagen
                </div>
              </label>
              <input
                type="url"
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-xl text-sm light-form"
                placeholder="https://..."
              />
            </div>

            <div className="flex items-end pb-2.5">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="isOnline"
                    checked={form.isOnline}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div
                    className="w-10 h-6 rounded-full transition-all"
                    style={{ backgroundColor: form.isOnline ? '#2563EB' : '#E4EBFA' }}
                  />
                  <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow peer-checked:translate-x-4 transition-transform" />
                </div>
                <div className="flex items-center gap-2 text-sm" style={{ color: '#1D1D1F' }}>
                  <Globe className="w-4 h-4" style={iconStyle} />
                  Evento Online
                </div>
              </label>
            </div>
          </div>

          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 rounded-xl border text-sm transition-all cursor-pointer"
                style={{ borderColor: '#E4EBFA', color: '#1D1D1F99', backgroundColor: '#F8FAFC' }}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer ${
                onCancel ? 'flex-1' : 'w-full'
              }`}
              style={{ backgroundColor: '#2563EB' }}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Publicando...' : 'Publicar Evento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
