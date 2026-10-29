import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza un botón de tipo button y ejecuta onClick', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Guardar</Button>);
    const button = screen.getByRole('button', { name: 'Guardar' });
    expect(button).toHaveAttribute('type', 'button');
    button.click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('con href renderiza un enlace y agrega rel seguro si abre en otra pestaña', () => {
    render(<Button href="https://wa.me/56912345678" target="_blank">Contactar</Button>);
    const link = screen.getByRole('link', { name: 'Contactar' });
    expect(link).toHaveAttribute('href', 'https://wa.me/56912345678');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('aplica la variante outline', () => {
    render(<Button variant="outline">Compartir</Button>);
    expect(screen.getByRole('button', { name: 'Compartir' })).toHaveClass('border-brand-blue');
  });
});
