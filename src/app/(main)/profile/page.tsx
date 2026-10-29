import AuthGuard from '@/routes/AuthGuard';
import ProfileScreen from '@/routes/ProfileScreen';



export default function Route() {
  return (
    <AuthGuard>
      <ProfileScreen />
    </AuthGuard>
  );
}
