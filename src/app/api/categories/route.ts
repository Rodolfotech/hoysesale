import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { createCategory, listCategories } from '@/server/services/categories';
import { CreateCategorySchema } from '@/server/validation';

export const GET = route(async () => listCategories());

export const POST = route(async (req) => {
  await requireUser(req);
  return createCategory(await readBody(req, CreateCategorySchema));
});
