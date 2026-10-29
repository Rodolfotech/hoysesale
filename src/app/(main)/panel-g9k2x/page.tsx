export const dynamic = 'force-dynamic';
import AdminGuard from '@/routes/AdminGuard';
import Admin from '@/views/Admin';

export default function Route() {
  return (
    <AdminGuard>
      <Admin />
    </AdminGuard>
  );
}
