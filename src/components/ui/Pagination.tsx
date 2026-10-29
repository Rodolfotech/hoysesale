'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  function getPages(): (number | '...')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  const pages = getPages();

  const btnBase = 'w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium transition-all cursor-pointer';

  return (
    <div className="flex items-center justify-center gap-1 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} border`}
        style={{
          borderColor: '#E4EBFA',
          color: currentPage === 1 ? '#1D1D1F33' : '#1D1D1F99',
          backgroundColor: '#FFFFFF',
        }}
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((page, i) =>
        page === '...' ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-sm" style={{ color: '#1D1D1F66' }}>
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page as number)}
            className={btnBase}
            style={
              page === currentPage
                ? { backgroundColor: '#2563EB', color: '#FFFFFF', border: 'none' }
                : { backgroundColor: '#FFFFFF', color: '#1D1D1F99', border: '1px solid #E4EBFA' }
            }
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} border`}
        style={{
          borderColor: '#E4EBFA',
          color: currentPage === totalPages ? '#1D1D1F33' : '#1D1D1F99',
          backgroundColor: '#FFFFFF',
        }}
        aria-label="Página siguiente"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
