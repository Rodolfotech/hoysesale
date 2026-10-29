import { prisma } from '../db';
import { conflict, notFound } from '../http';
import { PUBLIC_USER_SELECT } from '../users/public-user';

export async function registerAttendee(userId: string, eventId: string) {
  try {
    return await prisma.attendee.create({
      data: { userId, eventId },
      include: { user: { select: PUBLIC_USER_SELECT }, event: true },
    });
  } catch (e) {
    if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
      throw conflict('Ya estás registrado en este evento');
    }
    throw e;
  }
}

export function attendeesOfEvent(eventId: string) {
  return prisma.attendee.findMany({
    where: { eventId },
    include: { user: { select: PUBLIC_USER_SELECT } },
  });
}

export function attendeeEventsOfUser(userId: string) {
  return prisma.attendee.findMany({
    where: { userId },
    include: { event: { include: { category: true } } },
  });
}

export async function unregisterAttendee(userId: string, eventId: string) {
  const attendee = await prisma.attendee.findFirst({ where: { userId, eventId } });
  if (!attendee) throw notFound('No estás registrado en este evento');
  return prisma.attendee.delete({ where: { id: attendee.id } });
}
