'use client';

export function EventCardSkeleton() {
  return (
    <div
      className="rounded-2xl overflow-hidden border flex flex-col h-full"
      style={{ borderColor: '#E4EBFA' }}
    >
      <div className="w-full aspect-4/5 bg-gray-100 animate-pulse" />
      <div className="flex flex-col flex-1 p-4 gap-3">
        <div className="h-4 rounded bg-gray-100 animate-pulse w-3/4" />
        <div className="h-3 rounded bg-gray-100 animate-pulse w-1/2" />
        <div className="space-y-2 flex-1">
          <div className="h-3 rounded bg-gray-100 animate-pulse w-2/3" />
          <div className="h-3 rounded bg-gray-100 animate-pulse w-1/2" />
          <div className="h-3 rounded bg-gray-100 animate-pulse w-2/3" />
        </div>
        <div className="h-8 rounded-xl bg-gray-100 animate-pulse w-24" />
      </div>
    </div>
  );
}
