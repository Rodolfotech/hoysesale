'use client';

// Capa de compatibilidad: expone con los mismos nombres que usaba react-router-dom
// (Link con `to`, useNavigate, useSearchParams, useParams, useLocation, Navigate),
// implementados sobre next/link y next/navigation. Así las páginas no cambian su lógica.
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as useNextSearchParams, useParams as useNextParams } from 'next/navigation';
import { useCallback, useEffect, type AnchorHTMLAttributes, type ReactNode } from 'react';

type LinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children?: ReactNode;
};

export function Link({ to, ...rest }: LinkProps) {
  return <NextLink href={to} {...rest} />;
}

// Función estable entre renders: se usa en dependencias de useEffect.
export function useNavigate() {
  const router = useRouter();
  return useCallback(
    (to: string | number) => {
      if (typeof to === 'number') {
        router.back();
      } else {
        router.push(to);
      }
    },
    [router],
  );
}

export function useSearchParams() {
  const params = useNextSearchParams() ?? new URLSearchParams();
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  // Igual que react-router: [params, setParams(nuevosParams, { replace })] reescribe la query de la URL.
  const setParams = useCallback((next: URLSearchParams | Record<string, string>, opts?: { replace?: boolean }) => {
    const sp = next instanceof URLSearchParams ? next : new URLSearchParams(next);
    const query = sp.toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (opts?.replace) {
      router.replace(url, { scroll: false });
    } else {
      router.push(url, { scroll: false });
    }
  }, [pathname, router]);
  return [params, setParams] as const;
}

export function useParams<T extends Record<string, string | undefined> = Record<string, string | undefined>>(): T {
  return (useNextParams() ?? {}) as T;
}

export function useLocation() {
  const pathname = usePathname() ?? "/";
  const search = typeof window !== 'undefined' ? window.location.search : '';
  return { pathname, search, hash: '', state: null, key: 'default' };
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
}
