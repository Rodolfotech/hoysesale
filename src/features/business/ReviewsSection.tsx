'use client';

import { apiErrorMessage } from '@/lib/api-error';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { businessApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import type { BusinessReview } from '@/lib/business';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';

interface ReviewsSectionProps {
  slug: string;
  reviews: BusinessReview[];
  rating: number | null;
  reviewCount: number;
  ratingCounts?: number[]; // reseñas con 1 a 5 estrellas (índice 0 = 1 estrella)
}

// Valoración, reseñas y formulario para dejar una reseña (una por usuario).
export function ReviewsSection({ slug, reviews, rating, reviewCount, ratingCounts = [0, 0, 0, 0, 0] }: ReviewsSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [writing, setWriting] = useState(false); // formulario abierto en la vista del visitante
  const isOwner = user?.slug === slug;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await businessApi.review(slug, { rating: stars, comment: comment.trim() || undefined });
      setSent(true);
      setComment('');
      router.refresh();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo enviar la reseña'));
    } finally {
      setSaving(false);
    }
  };

  const form = (
        <Card as="form" onSubmit={submit} className="space-y-3">
          <fieldset>
            <legend className="text-sm font-medium mb-2">Tu valoración</legend>
            <div className="flex gap-1" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                  onClick={() => setStars(n)}
                  className={`text-2xl cursor-pointer ${n <= stars ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="resena-comentario" className="block text-xs mb-1">Comentario (opcional)</label>
            <textarea id="resena-comentario" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Enviando...' : 'Enviar reseña'}
          </Button>
        </Card>
  );

  const list = reviews.length > 0 && (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <Card as="li" key={r.id} padding="sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.author.name}</p>
                <p className="text-xs text-brand-dark/60">{format(new Date(r.createdAt), 'd MMM yyyy', { locale: es })}</p>
              </div>
              <p className="text-sm text-amber-500" aria-label={`${r.rating} de 5 estrellas`}>{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></p>
              {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
            </Card>
          ))}
        </ul>
  );

  // Vista del visitante: promedio, barras por estrella y el recuadro para escribir una reseña.
  if (!isOwner) {
    const filled = rating !== null ? Math.round(rating) : 0;
    return (
      <div className="flex flex-col gap-4 flex-1">
        <Card padding="sm" className="p-5 flex flex-col flex-1">
          <div className="flex items-center gap-3">
            <p className="text-3xl font-semibold leading-none text-brand-dark/40" aria-hidden="true">{rating ?? '—'}</p>
            <div>
              <p className="text-lg leading-none tracking-wide" role="img" aria-label={rating !== null ? `Valoración ${rating} de 5` : 'Sin valoración'}>
                <span className="text-amber-500">{'★'.repeat(filled)}</span><span className="text-slate-300">{'★'.repeat(5 - filled)}</span>
              </p>
              <p className="text-xs font-medium mt-1">{reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}</p>
            </div>
          </div>
          <ul className="mt-5 space-y-2.5" aria-label="Reseñas por estrellas">
            {[5, 4, 3, 2, 1].map((n) => {
              const count = ratingCounts[n - 1] ?? 0;
              return (
                <li key={n} className="flex items-center gap-3 text-xs text-brand-dark/60">
                  <span className="w-2" aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}>{n}</span>
                  <span className="flex-1 h-1.5 rounded-full bg-brand-neutral-2 overflow-hidden">
                    <span className="block h-full rounded-full bg-amber-500" style={{ width: reviewCount ? `${(count / reviewCount) * 100}%` : 0 }} />
                  </span>
                  <span className="w-6 text-right">{count}</span>
                </li>
              );
            })}
          </ul>
          <div className="mt-auto pt-6">
            <div className="rounded-xl bg-brand-neutral-1 p-4">
              <p className="text-sm font-semibold">{reviewCount === 0 ? 'Aún no hay reseñas' : 'Comparte tu experiencia'}</p>
              <p className="text-xs text-brand-dark/60 mt-1">¿Ya compraste aquí? Tu opinión ayuda a otros clientes a decidir.</p>
              {sent ? (
                <p role="status" className="text-sm text-emerald-600 mt-3">¡Gracias por tu reseña!</p>
              ) : isAuthenticated ? (
                <Button variant="outline" fullWidth className="mt-3" aria-expanded={writing} onClick={() => setWriting((open) => !open)}>
                  Escribir una reseña
                </Button>
              ) : (
                <Button variant="outline" fullWidth className="mt-3" href="/login">Escribir una reseña</Button>
              )}
            </div>
          </div>
        </Card>
        {writing && !sent && form}
        {list}
      </div>
    );
  }

  // Vista del dueño: sin cambios.
  return (
    <div className="space-y-5">
      <Card padding="md" className="flex items-center gap-4">
        <p className="text-4xl font-semibold">{rating ?? '—'}</p>
        <div>
          <p className="text-lg text-amber-500" aria-label={rating !== null ? `Valoración ${rating} de 5` : 'Sin valoración'}>★★★★★</p>
          <p className="text-sm text-brand-dark/60">{reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'}</p>
        </div>
      </Card>

      {isAuthenticated && !isOwner && !sent && (
        <Card as="form" onSubmit={submit} className="space-y-3">
          <fieldset>
            <legend className="text-sm font-medium mb-2">Tu valoración</legend>
            <div className="flex gap-1" role="radiogroup">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  role="radio"
                  aria-checked={stars === n}
                  aria-label={`${n} ${n === 1 ? 'estrella' : 'estrellas'}`}
                  onClick={() => setStars(n)}
                  className={`text-2xl cursor-pointer ${n <= stars ? 'text-amber-500' : 'text-slate-300'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="resena-comentario" className="block text-xs mb-1">Comentario (opcional)</label>
            <textarea id="resena-comentario" value={comment} onChange={(e) => setComment(e.target.value)} maxLength={1000} rows={3} className="w-full px-3 py-2 rounded-xl text-sm light-form resize-none" />
          </div>
          {error && <p role="alert" className="text-xs text-red-600">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'Enviando...' : 'Enviar reseña'}
          </Button>
        </Card>
      )}
      {sent && <p role="status" className="text-sm text-emerald-600">¡Gracias por tu reseña!</p>}
      {!isAuthenticated && (
        <p className="text-sm text-brand-dark/60">
          <Link href="/login" className="underline text-brand-blue">Inicia sesión</Link> para dejar tu reseña.
        </p>
      )}

      {reviews.length === 0 ? (
        <EmptyState>Aún no hay reseñas.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {reviews.map((r) => (
            <Card as="li" key={r.id} padding="sm">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{r.author.name}</p>
                <p className="text-xs text-brand-dark/60">{format(new Date(r.createdAt), 'd MMM yyyy', { locale: es })}</p>
              </div>
              <p className="text-sm text-amber-500" aria-label={`${r.rating} de 5 estrellas`}>{'★'.repeat(r.rating)}<span className="text-slate-300">{'★'.repeat(5 - r.rating)}</span></p>
              {r.comment && <p className="text-sm mt-1">{r.comment}</p>}
            </Card>
          ))}
        </ul>
      )}
    </div>
  );
}
