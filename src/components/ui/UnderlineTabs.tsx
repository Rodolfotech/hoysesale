'use client';

interface UnderlineTabsProps<T extends string> {
  tabs: readonly T[];
  labels: Record<T, string>;
  active: T;
  onChange: (tab: T) => void;
  ariaLabel?: string;
}

// Pestañas con subrayado para formularios.
export function UnderlineTabs<T extends string>({ tabs, labels, active, onChange, ariaLabel }: UnderlineTabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className="flex flex-wrap gap-x-2 gap-y-1" style={{ borderBottom: '1px solid #E4EBFA' }}>
      {tabs.map((key) => (
        <button
          key={key}
          type="button"
          role="tab"
          aria-selected={active === key}
          onClick={() => onChange(key)}
          className="px-4 py-2 text-sm font-medium cursor-pointer"
          style={{ borderBottom: active === key ? '2px solid #2563EB' : '2px solid transparent', marginBottom: '-1px', color: active === key ? '#2563EB' : '#1D1D1F99' }}
        >
          {labels[key]}
        </button>
      ))}
    </div>
  );
}
