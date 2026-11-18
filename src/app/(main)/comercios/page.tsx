import Link from 'next/link';
import { BUSINESS_CATEGORY_GROUPS } from '@/constants/business';
import { listPublicBusinesses } from '@/server/services/directory';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Comercios | HoySeSale',
  description: 'Comercios de La Araucanía organizados por rubro.',
};

export default async function ComerciosPage() {
  const businesses = await listPublicBusinesses();

  return (
    <main className="max-w-6xl w-full mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold" style={{ color: '#1D1D1F' }}>Comercios</h1>
      <p className="mt-2 text-sm" style={{ color: '#1D1D1F99' }}>
        Encuentra negocios de La Araucanía por rubro.
      </p>

      {businesses.length === 0 && (
        <p className="mt-10 text-sm" style={{ color: '#1D1D1F99' }}>Todavía no hay comercios publicados.</p>
      )}

      {BUSINESS_CATEGORY_GROUPS.map((group) => {
        const items = businesses.filter((b) => (group.options as readonly string[]).includes(b.category ?? ''));
        if (items.length === 0) return null;
        return (
          <section key={group.label} className="mt-10">
            <h2 className="text-lg font-semibold mb-4" style={{ color: '#1D1D1F' }}>
              {group.label} <span className="text-sm font-normal" style={{ color: '#1D1D1F99' }}>({items.length})</span>
            </h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/${b.slug}`}
                    className="flex items-center gap-3 rounded-xl p-4 transition-shadow hover:shadow-md"
                    style={{ backgroundColor: '#FFFFFF', border: '1px solid #E4EBFA' }}
                  >
                    {b.logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.logoUrl}
                        alt=""
                        className={`w-12 h-12 object-cover shrink-0 ${b.logoShape === 'square' ? 'rounded-md' : 'rounded-full'}`}
                      />
                    ) : (
                      <div className="w-12 h-12 flex items-center justify-center text-white font-bold shrink-0 rounded-full" style={{ backgroundColor: '#2563EB' }}>
                        {b.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium truncate" style={{ color: '#1D1D1F' }}>{b.name}</p>
                      <p className="text-xs truncate" style={{ color: '#1D1D1F99' }}>
                        {b.category}{b.comuna ? ` · ${b.comuna}` : ''}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </main>
  );
}
