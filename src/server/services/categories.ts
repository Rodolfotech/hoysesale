import { prisma } from '../db';
import { conflict } from '../http';
import type { z } from 'zod';
import type { CreateCategorySchema } from '../validation';

export function listCategories() {
  return prisma.category.findMany({ include: { events: true } });
}

export async function createCategory(data: z.output<typeof CreateCategorySchema>) {
  try {
    return await prisma.category.create({ data });
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      throw conflict('Ya existe una categoría con ese nombre');
    }
    throw e;
  }
}
