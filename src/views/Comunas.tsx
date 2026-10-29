'use client';

import { Link } from '@/lib/router';
import { MapPin, ArrowRight } from 'lucide-react';
import { COMUNAS } from '../constants/comunas';

export default function Comunas() {
  return (
    <div className="min-h-screen pt-24 pb-20" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-10">
          <h1 className="font-semibold mb-2" style={{ color: '#1D1D1F', fontSize: '36px', lineHeight: '60px' }}>Comunas</h1>
          <p className="text-sm" style={{ color: '#1D1D1F99' }}>Explora eventos por comuna en La Araucanía</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {COMUNAS.map((comuna) => (
            <Link
              key={comuna}
              to={`/categorias?ciudad=${encodeURIComponent(comuna)}`}
              className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border text-sm transition-all group"
              style={{ backgroundColor: '#FFFFFF', borderColor: '#E4EBFA', color: '#1D1D1F99' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E4EBFA'; e.currentTarget.style.color = '#1D1D1F99'; }}
            >
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 shrink-0" style={{ color: '#2563EB' }} />
                {comuna}
              </span>
              <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
