import 'dotenv/config';
import { prisma } from '../src/server/db';
import { ensureAdminUser } from '../src/server/services/seed';

// Crea la cuenta admin si no existe (ADMIN_EMAIL / ADMIN_PASSWORD). No sobrescribe nada existente.
ensureAdminUser()
  .then((result) => console.log(`Seed admin: ${result}`))
  .catch((error) => {
    console.error('Error en el seed:', error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
