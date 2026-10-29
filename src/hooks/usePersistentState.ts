'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react';

// Estado que sobrevive a recargas de la página (sessionStorage, solo esta pestaña).
// Úsalo para borradores de formularios. Nunca guardes contraseñas ni archivos aquí.
export function usePersistentState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, () => void] {
  const [value, setValue] = useState<T>(initial);
  // En el primer ciclo no se escribe: el valor inicial no debe reemplazar lo guardado.
  const skipWrite = useRef(true);

  // Se lee después de montar para evitar diferencias entre servidor y cliente.
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      // Storage bloqueado o JSON inválido: se usa el valor inicial.
    }
  }, [key]);

  useEffect(() => {
    if (skipWrite.current) {
      skipWrite.current = false;
      return;
    }
    try {
      window.sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Sin espacio o storage bloqueado: el formulario sigue funcionando sin borrador.
    }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      // Nada que limpiar.
    }
  }, [key]);

  return [value, setValue, clear];
}
