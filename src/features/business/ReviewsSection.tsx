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
}

// Valoración, reseñas y formulario para dejar una reseña (una por usuario).
export function ReviewsSection({ slug, reviews, rating, reviewCount }: ReviewsSectionProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
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
