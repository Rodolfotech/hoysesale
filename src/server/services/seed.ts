import bcrypt from 'bcryptjs';
import { prisma } from '../db';

// Crea la cuenta admin solo si no existe. Nunca sobrescribe la contraseña ni imprime credenciales.
// La clave viene de ADMIN_PASSWORD. Se ejecuta con `pnpm seed`, no en cada petición.
export async function ensureAdminUser(): Promise<'exists' | 'created' | 'skipped'> {
  const email = process.env.ADMIN_EMAIL ?? 'admin@eventos.cl';
  const password = process.env.ADMIN_PASSWORD;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return 'exists';
  if (!password) return 'skipped';

  await prisma.user.create({
    data: {
      email,
      password: await bcrypt.hash(password, 10),
      name: 'Admin Demo',
      role: 'ADMIN',
      isActive: true,
    },
  });
  return 'created';
}
