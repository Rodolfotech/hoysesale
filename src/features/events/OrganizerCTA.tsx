'use client';

import { Link } from '@/lib/router';

interface Props {
  title?: string;
  subtitle?: string;
  buttonText?: string;
  buttonTo?: string;
}

export function OrganizerCTA({
  title = '¿Organizas eventos en La Araucanía?',
  subtitle = 'Únete a nuestra plataforma y dale mayor visibilidad a tus eventos',
  buttonText = 'Comenzar ahora →',
  buttonTo = '/register',
}: Props) {
  return (
    <section className="w-full py-12 px-4" style={{ backgroundColor: '#FFFFFF' }}>
      <div
        className="max-w-4xl mx-auto rounded-2xl px-8 py-14 text-center"
        style={{ backgroundColor: '#2563EB' }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
          {title}
        </h2>
        <p className="text-white/80 text-sm md:text-base mb-8">
          {subtitle}
        </p>
        <Link
          to={buttonTo}
          className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#FFFFFF', color: '#1D1D1F' }}
        >
          {buttonText}
        </Link>
      </div>
    </section>
  );
}
