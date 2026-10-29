'use client';

interface AuthHeaderProps {
  title: string;
  subtitle: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div
        className="w-12 h-12 mx-auto mb-4 rounded-xl flex items-center justify-center"
        style={{ backgroundColor: '#2563EB' }}
      >
        <img src="/Isotipo.svg" alt="HoySeSale" className="w-7 h-7 brightness-0 invert" />
      </div>
      <h1 style={{ fontSize: '24px', lineHeight: '28px', fontWeight: 600, color: '#1D1D1F' }}>
        {title}
      </h1>
      <p className="text-sm mt-1" style={{ color: '#1D1D1F99' }}>{subtitle}</p>
    </div>
  );
}
