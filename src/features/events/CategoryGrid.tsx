'use client';

import { useNavigate } from '@/lib/router';
import {
  Music2,
  Palette,
  UtensilsCrossed,
  Mountain,
  Footprints,
  Trophy,
  ShoppingBag,
  HeartHandshake,
  PartyPopper,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const CATEGORY_CONFIG: { name: string; icon: LucideIcon }[] = [
  { name: 'Música',       icon: Music2 },
  { name: 'Cultura',      icon: Palette },
  { name: 'Gastronomía',  icon: UtensilsCrossed },
  { name: 'Turismo',      icon: Mountain },
  { name: 'Trekking',     icon: Footprints },
  { name: 'Deportes',     icon: Trophy },
  { name: 'Ferias',       icon: ShoppingBag },
  { name: 'Bienestar',    icon: HeartHandshake },
  { name: 'Fiestas',      icon: PartyPopper },
];

interface Props {
  title?: string;
  subtitle?: string;
}

export function CategoryGrid({
  title = 'Explora por categoría',
  subtitle = 'Encuentra rápidamente los eventos y panoramas que mejor se ajustan a tus gustos e intereses.',
}: Props) {
  const navigate = useNavigate();

  function handleClick(name: string) {
    const slug = name.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-');
    navigate(`/${slug}`);
  }

  return (
    <section className="w-full py-12 pb-16"  style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Encabezado */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>
            {title}
          </h2>
          <p className="mt-2 text-base font-medium max-w-xl mx-auto" style={{ color: '#1D1D1F', fontFamily: "'Raleway', sans-serif" }}>
            {subtitle}
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-4">
          {CATEGORY_CONFIG.map(({ name, icon: Icon }) => (
            <button
              key={name}
              type="button"
              onClick={() => handleClick(name)}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-105"
                style={{ backgroundColor: '#E4EBFA' }}
              >
                <Icon className="w-7 h-7" style={{ color: '#2563EB' }} />
              </div>
              <span className="text-xs font-medium text-center" style={{ color: '#1D1D1F', fontFamily: 'var(--font-brand)' }}>
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
