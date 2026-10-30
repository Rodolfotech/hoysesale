'use client';

import { useState } from 'react';

// Pagina una lista en el navegador. Se usa junto con el componente Pagination.
export function usePagedItems<T>(items: T[], perPage: number) {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(items.length / perPage);
  // Si se eliminan elementos, la página actual puede dejar de existir.
  const currentPage = Math.min(page, Math.max(totalPages, 1));
  const visible = items.slice((currentPage - 1) * perPage, currentPage * perPage);

  return { visible, currentPage, totalPages, setPage };
}
