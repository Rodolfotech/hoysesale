'use client';

export function AuthDivider() {
  return (
    <div className="relative mb-4">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t" style={{ borderColor: '#E4EBFA' }} />
      </div>
      <div className="relative flex justify-center text-xs">
        <span className="px-3" style={{ backgroundColor: '#FFFFFF', color: '#1D1D1F99' }}>
          o con correo
        </span>
      </div>
    </div>
  );
}
