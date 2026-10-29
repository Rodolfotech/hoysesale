'use client';

import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

type Variant = 'primary' | 'dark' | 'outline' | 'success' | 'ghost';
type Size = 'sm' | 'md';

const variants: Record<Variant, string> = {
  primary: 'bg-brand-blue text-white hover:opacity-90',
  dark: 'bg-brand-dark text-white hover:opacity-90',
  outline: 'bg-brand-white text-brand-blue border border-brand-blue hover:bg-brand-neutral-1',
  success: 'bg-emerald-600 text-white hover:opacity-90',
  ghost: 'bg-transparent text-brand-dark hover:bg-brand-neutral-2',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
};

interface BaseProps {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  fullWidth?: boolean;
  children: ReactNode;
  className?: string;
}

type ButtonProps = BaseProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type LinkProps = BaseProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

// Botón reutilizable. Con `href` se renderiza como enlace (abrir WhatsApp, mapa, etc.).
export function Button(props: ButtonProps | LinkProps) {
  const { variant = 'primary', size = 'md', icon: Icon, fullWidth, children, className = '', ...rest } = props;
  const classes = `inline-flex items-center justify-center gap-2 rounded-full font-medium whitespace-nowrap transition disabled:opacity-50 cursor-pointer no-underline focus-visible:outline-2 focus-visible:outline-offset-2 ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`;
  const content = (
    <>
      {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
      {children}
    </>
  );

  if ('href' in rest && rest.href) {
    const { href, ...anchorRest } = rest as AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };
    const external = anchorRest.target === '_blank';
    return (
      <a href={href} className={classes} {...anchorRest} rel={external ? 'noopener noreferrer' : anchorRest.rel}>
        {content}
      </a>
    );
  }

  const buttonRest = rest as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button type="button" className={classes} {...buttonRest}>
      {content}
    </button>
  );
}
