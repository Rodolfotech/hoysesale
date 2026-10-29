import { prisma } from '../db';
import { getMediaStorage } from '../storage';
import { PUBLIC_USER_SELECT } from '../users/public-user';
import type { z } from 'zod';
import type { ProfileUpdateSchema } from '../validation';

// Usuario completo sin contraseña ni token de Instagram. Solo para el propio usuario o un ADMIN.
export function findAllUsers() {
  return prisma.user.findMany({ omit: { password: true, socialToken: true } });
}

// Vista para terceros: sin correo, teléfono, tokens ni datos fiscales.
export function findPublicUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, select: PUBLIC_USER_SELECT });
}

export function findUserById(id: string) {
  return prisma.user.findUnique({ where: { id }, omit: { password: true, socialToken: true } });
}

// Incluye la contraseña: solo para verificar credenciales.
export function findUserByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } });
}

export type NewUser = {
  email: string;
  password: string;
  name: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  comuna: string;
  role: 'ORGANIZER' | 'USER';
};

// La página del negocio no se crea al registrarse: la crea el cliente con su URL (POST /businesses/me).
export function createUser(data: NewUser) {
  return prisma.user.create({ data, omit: { password: true } });
}

export function updateUserProfile(id: string, data: z.output<typeof ProfileUpdateSchema>) {
  return prisma.user.update({ where: { id }, data, omit: { password: true } });
}

export async function deleteAccount(id: string) {
  await prisma.instagramClick.deleteMany({ where: { userId: id } });
  await prisma.adminAuditLog.deleteMany({ where: { adminId: id } });
  await prisma.attendee.deleteMany({ where: { userId: id } });

  const ownedEvents = await prisma.event.findMany({ where: { ownerId: id }, select: { id: true } });
  if (ownedEvents.length > 0) {
    await prisma.attendee.deleteMany({ where: { eventId: { in: ownedEvents.map((e) => e.id) } } });
    await prisma.event.deleteMany({ where: { ownerId: id } });
  }

  await prisma.user.delete({ where: { id } });

  // Imágenes de la cuenta (publicaciones, temporales, logo y portada): carpeta <userId>/
  await getMediaStorage().removePrefix(id);
}
