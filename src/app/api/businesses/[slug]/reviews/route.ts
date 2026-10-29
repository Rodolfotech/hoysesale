import { route, readBody } from '@/server/http';
import { requireUser } from '@/server/auth/session';
import { reviewBusiness } from '@/server/services/businesses';
import { BusinessReviewSchema } from '@/server/validation';

export const POST = route<{ slug: string }>(async (req, { params }) => {
  const user = await requireUser(req);
  const { slug } = await params;
  return reviewBusiness(user.id, slug, await readBody(req, BusinessReviewSchema));
});
