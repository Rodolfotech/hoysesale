import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState } from './EmptyState';

describe('EmptyState', () => {
  it('muestra el mensaje y una acción opcional', () => {
    render(<EmptyState action={<button>Crear</button>}>Aún no hay eventos</EmptyState>);
    expect(screen.getByText('Aún no hay eventos')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Crear' })).toBeInTheDocument();
  });
});
