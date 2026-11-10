'use client';

import { Link } from '@/lib/router';
import { CookieSettingsButton } from './CookieSettingsButton';

const columns = [
  {
    title: 'Explorar',
    links: [
      { label: 'Eventos', to: '/' },
      { label: 'Categorías', to: '/categorias' },
      { label: 'Comunas', to: '/comunas' },
    ],
  },
  {
    title: 'Organizadores',
    links: [
      { label: 'Publicar evento', to: '/create-event' },
      { label: 'Planes', to: '/' },
      { label: 'Ayuda', to: '/' },
    ],
  },
  {
    title: 'Sobre nosotros',
    links: [
      { label: 'Quiénes somos', to: '/' },
      { label: 'Contacto', to: '/' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Términos y condiciones', to: '/terminosdelservicio' },
      { label: 'Eliminar datos', to: '/eliminacion-datos' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#F8FAFC' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">

        {/* Columnas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4
                className="font-semibold mb-4"
                style={{ color: '#1D1D1F', fontSize: '14px' }}
              >
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm transition-colors"
                      style={{ color: '#1D1D1F99' }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = '#2563EB')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = '#1D1D1F99')}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divisor */}
        <hr style={{ borderColor: '#E4EBFA' }} />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6">
            <Link to="/" className="flex items-center">
              <img src="/Logohoysesale.svg" alt="HoySeSale" className="h-9 w-auto" />
            </Link>
            <p className="text-sm" style={{ color: '#1D1D1F99' }}>
              © {new Date().getFullYear()} hoysesale.cl — La Araucanía, Chile
            </p>
          </div>

          {/* Políticas y consentimiento de cookies: siempre a mano (Ley 21.719) */}
          <nav aria-label="Privacidad y cookies">
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              <li><Link to="/privacidad" className="transition-colors hover:!text-[#2563EB]" style={{ color: '#1D1D1F99' }}>Política de privacidad</Link></li>
              <li aria-hidden="true" style={{ color: '#1D1D1F33' }}>·</li>
              <li><CookieSettingsButton className="transition-colors hover:!text-[#2563EB]" style={{ color: '#1D1D1F99' }} /></li>
            </ul>
          </nav>
        </div>

      </div>
    </footer>
  );
}
