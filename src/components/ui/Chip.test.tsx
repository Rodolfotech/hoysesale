import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Chip, ChipGroup } from './Chip';

describe('Chip', () => {
  it('refleja el estado activo con aria-pressed', () => {
    const { rerender } = render(<Chip active={false}>Todos</Chip>);
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
    rerender(<Chip active>Todos</Chip>);
    expect(screen.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('ChipGroup expone un grupo con nombre accesible', () => {
    render(
      <ChipGroup label="Filtrar productos">
        <Chip>Nuevo</Chip>
      </ChipGroup>,
    );
    expect(screen.getByRole('group', { name: 'Filtrar productos' })).toBeInTheDocument();
  });

  it('llama onClick al pulsarlo', () => {
    const onClick = vi.fn();
    render(<Chip onClick={onClick}>Regalo</Chip>);
    screen.getByRole('button', { name: 'Regalo' }).click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
