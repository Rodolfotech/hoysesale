import AuthGuard from '@/routes/AuthGuard';
import CreateEventScreen from '@/routes/CreateEventScreen';



export default function Route() {
  return (
    <AuthGuard>
      <CreateEventScreen />
    </AuthGuard>
  );
}
