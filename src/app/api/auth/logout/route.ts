import { route } from '@/server/http';
import { clearSession } from '@/server/auth/session';

export const POST = route(async () => clearSession({ message: 'Sesión cerrada' }));
